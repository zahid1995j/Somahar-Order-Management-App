import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Package2, ArrowRight, Key, Globe, ShieldCheck, Zap, HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login, updateSettings, enableDemoMode } = useApp();
  const navigate = useNavigate();
  
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionFailed, setConnectionFailed] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setConnectionFailed(false);
    setLoading(true);

    // Auto-fix URL
    let fixedUrl = baseUrl.trim();
    if (!fixedUrl.startsWith('http')) {
        fixedUrl = 'https://' + fixedUrl;
    }
    setBaseUrl(fixedUrl);

    try {
      if (!fixedUrl || !apiKey) throw new Error("Please enter both URL and API Key");
      await login(fixedUrl, apiKey, remember);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Connection failed. Please check your URL and API Key.");
      setConnectionFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleForceConnect = () => {
    // Bypass validation and save settings directly
    updateSettings({
        baseUrl: baseUrl,
        apiKey: apiKey,
        useMock: false,
        remember: remember
    });
    navigate('/');
  };

  const handleDemo = () => {
    enableDemoMode();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="w-full max-w-sm space-y-8 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-4 flex flex-col items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Somahar</h1>
            <p className="text-slate-400 font-medium">Logistics Management App</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-5">
            
            <div className="space-y-4">
              <div className="group">
                <label className="text-xs font-bold text-slate-400 uppercase ml-3 mb-1.5 block">WordPress URL</label>
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-transparent focus-within:bg-white focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                  <Globe className="text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="url" 
                    value={baseUrl}
                    onChange={(e) => {
                        setBaseUrl(e.target.value);
                        setConnectionFailed(false);
                    }}
                    placeholder="https://your-site.com/..."
                    className="w-full bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="text-xs font-bold text-slate-400 uppercase ml-3 mb-1.5 block">API Key</label>
                <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 border border-transparent focus-within:bg-white focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                  <Key className="text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => {
                        setApiKey(e.target.value);
                        setConnectionFailed(false);
                    }}
                    placeholder="••••••••••••••"
                    className="w-full bg-transparent outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-300"
                    required
                  />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <label className="flex items-center gap-3 px-2 cursor-pointer group">
                 <div className="relative flex items-center">
                    <input 
                        type="checkbox" 
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-slate-200 transition-all checked:border-primary checked:bg-primary hover:border-slate-300"
                    />
                    <CheckCircle2 size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                 </div>
                 <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">Remember login information</span>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="shrink-0" />
                    <span>{error}</span>
                </div>
                {connectionFailed && (
                    <button 
                        type="button"
                        onClick={handleForceConnect}
                        className="mt-2 py-2 px-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-center transition-colors w-full flex items-center justify-center gap-1"
                    >
                        <span>Connect Anyway</span>
                        <ArrowRight size={14} />
                    </button>
                )}
              </div>
            )}

            {!connectionFailed && (
                <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                    Connect <ArrowRight size={18} />
                    </>
                )}
                </button>
            )}
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-300 font-bold tracking-widest">Or</span>
            </div>
          </div>

          <button 
            onClick={handleDemo}
            className="w-full py-4 bg-primary/5 text-primary rounded-2xl font-bold text-sm hover:bg-primary/10 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Zap size={18} />
            Try Demo Mode
          </button>
        </div>
        
        <div className="text-center">
            <button 
                type="button"
                onClick={() => alert("Common Issues:\n\n1. CORS Error: Your WordPress site must allow requests from this app. Install a 'CORS' plugin on WordPress.\n2. Mixed Content: Your site must be HTTPS.\n3. Permalink: Ensure your REST API is accessible at /wp-json/.")}
                className="inline-flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider hover:text-primary transition-colors"
            >
                <HelpCircle size={14} />
                Having Connection Issues?
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;