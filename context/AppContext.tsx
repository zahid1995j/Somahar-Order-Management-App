import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiSettings, AppConfigResponse } from '../types';
import SwiftTrackService from '../services/api';

interface AppContextType {
  settings: ApiSettings;
  updateSettings: (newSettings: ApiSettings) => void;
  service: SwiftTrackService;
  config: AppConfigResponse | null;
  refreshConfig: () => Promise<void>;
  isLoadingConfig: boolean;
  isAuthenticated: boolean;
  login: (url: string, key: string, remember?: boolean) => Promise<void>;
  enableDemoMode: () => void;
  logout: () => void;
}

const DEFAULT_SETTINGS: ApiSettings = {
  baseUrl: "https://your-wordpress-site.com/wp-json/fbbot/v1",
  apiKey: "",
  useMock: false,
  remember: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load settings from localStorage if available
  const [settings, setSettings] = useState<ApiSettings>(() => {
    try {
      const stored = localStorage.getItem('swift_track_settings');
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
      return DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  const [service, setService] = useState<SwiftTrackService>(new SwiftTrackService(settings));
  const [config, setConfig] = useState<AppConfigResponse | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);

  // Update service and storage when settings change
  useEffect(() => {
    if (settings.remember) {
      localStorage.setItem('swift_track_settings', JSON.stringify(settings));
    } else {
      localStorage.removeItem('swift_track_settings');
    }
    setService(new SwiftTrackService(settings));
  }, [settings]);

  // Fetch initial config (partners/statuses)
  const refreshConfig = async () => {
    // Prevent fetching if settings are obviously default or incomplete (unless in mock mode)
    if (!settings.useMock && (!settings.baseUrl || settings.baseUrl.includes('your-wordpress-site.com'))) {
        return;
    }

    setIsLoadingConfig(true);
    try {
      const svc = new SwiftTrackService(settings);
      const data = await svc.getConfig();
      setConfig(data);
    } catch (e) {
      console.warn("Failed to load config, using defaults", e);
      // Fallback for UI if config fails so app doesn't break
      if (!config) {
        setConfig({ delivery_partners: [], quick_statuses: [] });
      }
      throw e; 
    } finally {
      setIsLoadingConfig(false);
    }
  };

  useEffect(() => {
    // Only attempt auto-refresh if we have a seemingly valid setup
    if (settings.useMock || (settings.apiKey && settings.baseUrl && !settings.baseUrl.includes('your-wordpress-site.com'))) {
      refreshConfig().catch(err => {
        // Silently catch background refresh errors to avoid console spam on load
        console.debug("Background config sync failed:", err.message);
      }); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const updateSettings = (newSettings: ApiSettings) => {
    setSettings(newSettings);
  };

  const login = async (url: string, key: string, remember: boolean = true) => {
    // Create temporary service to validate credentials
    const tempSettings = { baseUrl: url, apiKey: key, useMock: false, remember };
    const tempService = new SwiftTrackService(tempSettings);
    
    // Attempt to fetch config to validate
    await tempService.getConfig();
    
    // If successful, update state
    setSettings(tempSettings);
  };

  const enableDemoMode = () => {
    setSettings({ ...DEFAULT_SETTINGS, useMock: true });
  };

  const logout = () => {
    // Resetting to default (where remember is false) triggers the useEffect to clear localStorage
    setSettings(DEFAULT_SETTINGS);
  };

  const isAuthenticated = settings.useMock || (!!settings.apiKey && !!settings.baseUrl && !settings.baseUrl.includes('your-wordpress-site.com'));

  return (
    <AppContext.Provider value={{ 
      settings, 
      updateSettings, 
      service, 
      config, 
      refreshConfig, 
      isLoadingConfig,
      isAuthenticated,
      login,
      enableDemoMode,
      logout
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};