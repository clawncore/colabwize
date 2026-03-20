import React, { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
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
  children?: React.ReactNode;
  subSidebar?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, subSidebar: initialSubSidebar }) => {
  const [isSubSidebarOpen, setIsSubSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [dynamicSubSidebar, setDynamicSubSidebar] = useState<React.ReactNode>(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Show sub-sidebar if explicit subSidebar prop is provided OR we have dynamic content
  const hasSubSidebar = !!initialSubSidebar || !!dynamicSubSidebar;
  const activeSubSidebar = initialSubSidebar || dynamicSubSidebar;

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden selection:bg-sky-500/30 selection:text-white font-inter">
      <AdminSidebarComponent />

      {/* Sub-Sidebar Slide-out */}
      <AnimatePresence>
        {hasSubSidebar && isSubSidebarOpen && (
          <motion.aside
            initial={{ opacity: 0, x: -20, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 280 }}
            exit={{ opacity: 0, x: -20, width: 0 }}
            className="fixed left-20 top-0 h-full bg-white border-r border-border z-40 flex flex-col pt-24 overflow-hidden"
          >
             {activeSubSidebar}

             <button 
                onClick={() => setIsSubSidebarOpen(false)}
                className="mx-4 mt-auto mb-6 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider"
             >
                <ChevronLeft size={14} /> Hide Panel
             </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {!isSubSidebarOpen && hasSubSidebar && (
          <button 
            onClick={() => setIsSubSidebarOpen(true)}
            className="fixed left-[80px] top-1/2 -translate-y-1/2 z-50 p-1.5 bg-white border border-l-0 border-slate-200 text-slate-400 rounded-r-md shadow-sm hover:text-sky-500 transition-all"
          >
            <ChevronRight size={14} />
          </button>
      )}

      <main className={`flex-1 transition-all duration-500 ease-in-out relative z-10 ${hasSubSidebar && isSubSidebarOpen ? 'ml-[360px]' : 'ml-20'}`}>
        <header className="h-16 border-b border-border bg-white sticky top-0 px-8 flex items-center justify-between z-30">
          <div className="flex items-center gap-4">
            <div className="h-6 w-1 bg-sky-500/50 rounded-full" />
            <h1 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              <span className="text-slate-900">Colabwize Admin</span> <span className="text-slate-400 font-medium">/ {location.pathname.split('/').pop() || 'Dashboard'}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-sky-500 transition-colors z-[50]"
              >
                <Bell size={18} />
                <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-sky-500 rounded-full border border-white" />
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className="absolute top-12 right-0 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col p-4 text-left"
                    >
                      <div className="pb-3 border-b border-slate-50 mb-3">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Administrative Alerts</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex gap-3 items-start">
                          <div className="h-2 w-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">System Healthy</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">All transmission arrays are operational.</p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-start opacity-60">
                          <div className="h-2 w-2 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Backup Complete</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Global database synced 4h ago.</p>
                          </div>
                        </div>
                      </div>
                      <button className="mt-6 w-full py-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest rounded-lg hover:bg-slate-100 transition-all">
                        Clear All Logs
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100 relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="h-9 w-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-sky-600 font-bold hover:border-sky-500/50 transition-all cursor-pointer relative z-50 text-xs"
              >
                {user?.full_name?.charAt(0) || <UserIcon size={16} />}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className="absolute top-12 right-0 w-60 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col p-1.5"
                    >
                      <div className="px-3 py-2.5 border-b border-slate-50 mb-1">
                        <p className="text-sm font-bold text-slate-900 tracking-tight">{user?.full_name || 'Administrator'}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email || 'admin@colabwize.com'}</p>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/admin/profile');
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600 rounded-lg transition-colors w-full text-left"
                      >
                        <UserIcon size={14} /> Profile
                      </button>
                      
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/admin/security');
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-sky-600 rounded-lg transition-colors w-full text-left"
                      >
                        <Lock size={14} /> Security
                      </button>

                      <div className="h-px bg-slate-50 my-1 mx-1" />
                      
                      <button 
                        onClick={() => {
                          if (logout) logout();
                          else window.location.href = '/login';
                        }}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50/50 rounded-lg transition-colors w-full text-left"
                      >
                        <LogOut size={14} /> Sign out
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
              {children || <Outlet context={{ setSubSidebar: setDynamicSubSidebar }} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0ea5e9; }

        /* Table Stylings for Previews */
        .prose table, 
        .preview-area table,
        [dangerouslySetInnerHTML] table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 20px 0 !important;
          border: 1px solid #e2e8f0 !important;
        }
        .prose th, .prose td,
        .preview-area th, .preview-area td,
        [dangerouslySetInnerHTML] th, [dangerouslySetInnerHTML] td {
          border: 1px solid #e2e8f0 !important;
          padding: 12px !important;
          text-align: left !important;
        }
        .prose th, .preview-area th, [dangerouslySetInnerHTML] th {
          background-color: #f8fafc !important;
          font-weight: bold !important;
        }
      `}} />
    </div>
  );
};
