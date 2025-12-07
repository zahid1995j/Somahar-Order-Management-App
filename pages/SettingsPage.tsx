import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { Save, AlertCircle, Server, Key, Info, LogOut } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { settings, updateSettings, refreshConfig, logout } = useApp();
  
  const [formData, setFormData] = useState({
    baseUrl: settings.baseUrl,
    apiKey: settings.apiKey,
    useMock: settings.useMock
  });

  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    updateSettings(formData);
    
    try {
      await refreshConfig();
      setMessage({ type: 'success', text: "Connected successfully!" });
    } catch (e) {
      setMessage({ type: 'error', text: "Connection failed. Check details." });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <Layout title="Settings">
      <div className="space-y-6">
        
        {/* Mode Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-soft border border-slate-100">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-slate-100 rounded-xl text-slate-600"><Server size={20} /></div>
             <h3 className="font-bold text-slate-800">App Mode</h3>
          </div>
          
          <label className="relative flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
            <div>
                <span className="font-bold text-slate-700 block text-sm">Demo / Mock Mode</span>
                <span className="text-xs text-slate-400">Use dummy data for testing</span>
            </div>
            <div className="relative">
                <input 
                    type="checkbox" 
                    checked={formData.useMock} 
                    onChange={e => setFormData({...formData, useMock: e.target.checked})}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </label>
        </div>

        {/* Connection Card */}
        <div className={`bg-white p-6 rounded-[2rem] shadow-soft border border-slate-100 transition-opacity duration-300 ${formData.useMock ? 'opacity-50 grayscale pointer-events-none' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-slate-100 rounded-xl text-slate-600"><Key size={20} /></div>
             <h3 className="font-bold text-slate-800">Connection Details</h3>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">WordPress Base URL</label>
              <input
                type="url"
                value={formData.baseUrl}
                onChange={e => setFormData({...formData, baseUrl: e.target.value})}
                placeholder="https://mysite.com/wp-json/fbbot/v1"
                className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">API Key</label>
              <div className="relative">
                <input
                    type="password"
                    value={formData.apiKey}
                    onChange={e => setFormData({...formData, apiKey: e.target.value})}
                    placeholder="••••••••••••••"
                    className="w-full p-4 bg-slate-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
            Save
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
            <AlertCircle size={20} />
            <span className="text-sm font-bold">{message.text}</span>
          </div>
        )}

        <button 
          onClick={logout}
          className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <LogOut size={20} />
          Sign Out
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-300 mt-8">
            <Info size={14} />
            <span>Swift Track Mobile v1.0.0</span>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsPage;