import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield,
  Bell,
  Zap,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
  Lock,
  User as UserIcon
} from 'lucide-react';
import useAuth from '../../../services/useAuth';
import { AdminSidebarComponent } from './AdminSidebarComponent';

interface AdminLayoutProps {
  children: React.ReactNode;
  subSidebar?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, subSidebar }) => {
  const [isSubSidebarOpen, setIsSubSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Show sub-sidebar if explicit subSidebar prop is provided OR we are in specific routes
  const hasSubSidebar = !!subSidebar;

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden selection:bg-sky-500/30 selection:text-white font-inter">
      {/* Neural Background Layer removed by user request (clean UI) */}

      <AdminSidebarComponent />

      {/* Sub-Sidebar Slide-out */}
      <AnimatePresence>
        {hasSubSidebar && isSubSidebarOpen && (
          <motion.aside
            initial={{ opacity: 0, x: -20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 280 }}
            exit={{ opacity: 0, x: -20, width: 0 }}
            className="fixed left-20 top-0 h-full bg-white border-r border-border z-40 flex flex-col pt-24 overflow-hidden shadow-sm"
          >
             {subSidebar}

             <button 
                onClick={() => setIsSubSidebarOpen(false)}
                className="mx-4 mt-auto mb-6 p-3 bg-secondary border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
             >
                <ChevronLeft size={14} /> Hide Panel
             </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {!isSubSidebarOpen && hasSubSidebar && (
          <button 
            onClick={() => setIsSubSidebarOpen(true)}
            className="fixed left-[84px] top-1/2 -translate-y-1/2 z-50 p-2 bg-sky-500 text-white rounded-r-xl shadow-lg hover:scale-110 transition-all"
          >
            <ChevronRight size={16} strokeWidth={3} />
          </button>
      )}

      <main className={`flex-1 transition-all duration-500 ease-in-out relative z-10 ${hasSubSidebar && isSubSidebarOpen ? 'ml-[360px]' : 'ml-20'}`}>
        <header className="h-20 border-b border-border bg-background sticky top-0 px-8 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <div className="h-8 w-1 bg-sky-500 rounded-full" />
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">
              <span className="text-foreground">Colabwize Admin</span> <span className="opacity-40">/ {location.pathname.split('/').pop() || 'Dashboard'}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-sky-500 transition-colors group">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-sky-500 rounded-full border-2 border-background shadow-[0_0_5px_rgba(14,165,233,0.5)]" />
              <div className="absolute inset-0 bg-sky-500/10 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500 opacity-0 group-hover:opacity-100" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-10 w-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-sky-500 font-black shadow-lg shadow-black/10 group hover:border-sky-500/50 transition-all cursor-pointer relative z-50"
              >
                <span className="group-hover:scale-110 transition-transform flex items-center justify-center">
                  {user?.full_name?.charAt(0) || <Shield size={20} />}
                </span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-14 right-0 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-2"
                    >
                      <div className="px-4 py-3 border-b border-border/50 mb-2">
                        <p className="text-sm font-black text-foreground tracking-tight">{user?.full_name || 'Administrator'}</p>
                        <p className="text-xs text-muted-foreground truncate font-medium">{user?.email || 'admin@colabwize.com'}</p>
                      </div>
                      
                      <button className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-foreground hover:bg-secondary hover:text-sky-500 rounded-xl transition-colors w-full text-left">
                        <UserIcon className="h-4 w-4" /> Administrative Profile
                      </button>
                      
                      <button className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-foreground hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl transition-colors w-full text-left">
                        <Lock className="h-4 w-4" /> Security Parameters
                      </button>

                      <div className="h-px bg-border my-2 mx-2" />
                      
                      <button 
                        onClick={() => {
                          if (logout) logout();
                          else window.location.href = '/login';
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-sm font-black text-red-500 hover:bg-red-500/10 rounded-xl transition-colors w-full text-left tracking-tight"
                      >
                        <LogOut className="h-4 w-4" /> Terminate Session
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0ea5e9; }
      `}} />
    </div>
  );
};
