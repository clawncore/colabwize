import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Megaphone, 
  TrendingUp, 
  Activity,
  Zap,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { apiClient } from '../../../services/apiClient';
import useAuth from '../../../services/useAuth';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiClient.get('/api/admin/analytics');
        if (response.success) {
          setData(response.data);
        }
      } catch (err) {
        console.error("Dashboard analytics fetch error", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = [
    { 
      label: 'Total Users', 
      value: data?.growth?.total || '0', 
      change: `+${data?.growth?.last30Days || 0}`, 
      icon: Users, 
      color: 'text-sky-500', 
      bg: 'bg-sky-500/10',
      link: '/admin/email'
    },
    { 
      label: 'Active Support', 
      value: data?.app?.activeSupport?.toString() || '0', 
      change: '', 
      icon: MessageSquare, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10',
      link: '/admin/email'
    },
    { 
      label: 'Blog Posts', 
      value: data?.app?.blogPosts?.toString() || '0', 
      change: '', 
      icon: FileText, 
      color: 'text-sky-400', 
      bg: 'bg-sky-400/10',
      link: '/admin/blogs'
    },
  ];

  return (
    <div className="space-y-8">
        {/* Header - Admin Overview */}
        <div className="relative overflow-hidden p-8 bg-white border border-slate-200 rounded-2xl group shadow-sm">
          <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 mb-4"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600">System Overview</span>
              </motion.div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Admin <span className="text-sky-500">Dashboard</span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium max-w-xl leading-relaxed text-sm">
                Welcome back, <span className="text-sky-600 font-bold">{user?.full_name || 'Admin'}</span>. All platform systems are operational and reporting nominal capacity.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 shrink-0">
               <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated As</p>
                  <p className="text-sm font-bold text-sky-600 uppercase tracking-tight">Lead Administrator</p>
               </div>
               <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm overflow-hidden p-2">
                  <img src="/images/Colabwize-logo.png" alt="Logo" className="w-full h-full object-contain" />
               </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <Link
              to={stat.link}
              key={stat.label}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-white border border-slate-200 rounded-2xl hover:border-sky-200 hover:bg-sky-50/[0.02] transition-all group relative overflow-hidden shadow-sm cursor-pointer active:scale-95 text-left"
              >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <stat.icon size={60} className={stat.color} />
                </div>
                <div className="flex items-start justify-between mb-6">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} border border-current opacity-80 transition-transform group-hover:scale-110 duration-500`}>
                    <stat.icon size={24} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                      {stat.change && <TrendingUp size={12} />}
                      {stat.change}
                    </span>
                    <ArrowUpRight size={14} className="text-slate-200 group-hover:text-sky-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
  );
};
