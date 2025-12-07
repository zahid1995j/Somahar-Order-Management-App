import React from 'react';
import { Home, PlusCircle, Settings, Package2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  action?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, title, action }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden selection:bg-primary/20">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 z-30 flex items-center justify-between h-[60px]">
        <div className="flex items-center gap-2">
          {!title || title === 'Swift Track' ? (
             <div className="bg-primary/10 p-1.5 rounded-lg">
               <Package2 className="text-primary w-5 h-5" />
             </div>
          ) : null}
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">{title || 'Swift Track'}</h1>
        </div>
        <div>{action}</div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-24 pt-[60px]">
        <div className="container mx-auto max-w-md p-4 animate-in fade-in duration-300">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg border-t border-slate-100 fixed bottom-0 w-full z-40 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          <NavLink to="/" icon={<Home size={22} />} label="Orders" active={isActive('/')} />
          <NavLink to="/add" icon={<PlusCircle size={22} />} label="New Order" active={isActive('/add')} />
          <NavLink to="/settings" icon={<Settings size={22} />} label="Settings" active={isActive('/settings')} />
        </div>
      </nav>
    </div>
  );
};

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => (
  <Link to={to} className="flex-1 flex flex-col items-center justify-center h-full group">
    <div className={`p-1.5 rounded-xl transition-all duration-300 ${active ? 'bg-primary/10 text-primary -translate-y-1' : 'text-slate-400 group-hover:text-slate-600'}`}>
      {icon}
    </div>
    <span className={`text-[10px] font-medium mt-1 transition-colors ${active ? 'text-primary' : 'text-slate-400'}`}>
      {label}
    </span>
  </Link>
);

export default Layout;