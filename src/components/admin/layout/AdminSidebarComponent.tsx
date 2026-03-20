import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Megaphone,
  Menu,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  onToggleSubSidebar?: () => void;
}

export const AdminSidebarComponent: React.FC<SidebarProps> = ({ onToggleSubSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dash', path: '/admin' },
    { icon: Megaphone, label: 'Email', path: '/admin/email' },
    { icon: FileText, label: 'Blogs', path: '/admin/blogs' },
    { icon: Settings, label: 'Setup', path: '/admin/settings' },
  ];

  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-card border-r border-border flex flex-col items-center py-6">
      <Link to="/admin" className="mb-10 group cursor-pointer">
        <div className="h-10 w-10 flex items-center justify-center bg-white rounded-lg transition-all duration-300 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:shadow-md overflow-hidden p-1.5">
          <img 
            src="/images/Colabwize-logo.png" 
            alt="ColabWize" 
            className="w-full h-full object-contain"
          />
        </div>
      </Link>

      <nav className="flex-1 w-full space-y-4 px-2 flex flex-col items-center">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-lg transition-all duration-300 group relative ${
                isActive
                  ? 'bg-sky-500/10 text-sky-600'
                  : 'text-slate-400 hover:bg-secondary hover:text-slate-600'
              }`}
            >
              <item.icon size={20} className="transition-transform duration-300" />
              <span className={`text-[9px] font-semibold uppercase tracking-wider mt-1.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <div className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-sky-500 rounded-l-full" />
              )}

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-medium tracking-wide rounded-md opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-md border border-slate-700">
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 flex flex-col items-center w-full px-2">
        <button className="w-12 h-12 flex items-center justify-center rounded-lg text-slate-400 hover:bg-secondary transition-all group">
            <Zap size={18} className="group-hover:text-amber-500 transition-all" />
        </button>
        <button className="w-12 h-12 flex items-center justify-center rounded-lg text-slate-400 hover:bg-red-50/50 hover:text-red-500 transition-all group">
            <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
