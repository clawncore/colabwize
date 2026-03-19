import React from 'react';
import { Link, useLocation } from 'react-router-dom';
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

  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-card border-r border-border transition-all duration-500 ease-in-out z-50 flex flex-col items-center py-6 shadow-sm">
      <div className="mb-10 group cursor-pointer" onClick={() => window.location.href = '/'}>
        <div className="h-10 w-10 flex items-center justify-center bg-sky-500 rounded-xl transition-all duration-500 group-hover:scale-110">
          <ShieldCheck size={24} className="text-white" />
        </div>
      </div>

      <nav className="flex-1 w-full space-y-4 px-2 flex flex-col items-center">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all duration-300 group relative ${
                isActive
                  ? 'bg-sky-500 text-white shadow-md border-transparent'
                  : 'text-muted-foreground hover:bg-secondary hover:text-sky-500 border border-transparent'
              }`}
            >
              <item.icon size={22} className="transition-transform duration-500 group-hover:scale-110" />
              <span className="text-[8px] font-black uppercase tracking-[0.1em] mt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="activeGlowRail"
                  className="absolute -right-2 top-1/4 bottom-1/4 w-1 bg-sky-500 rounded-full"
                />
              )}

              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-foreground text-background text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-[100] shadow-xl">
                {item.label} Center
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 flex flex-col items-center w-full px-2">
        <button className="w-14 h-14 flex items-center justify-center rounded-2xl text-muted-foreground hover:bg-secondary transition-all group">
            <Zap size={20} className="group-hover:text-amber-400 group-hover:rotate-12 transition-all" />
        </button>
        <button className="w-14 h-14 flex items-center justify-center rounded-2xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all group">
            <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};
