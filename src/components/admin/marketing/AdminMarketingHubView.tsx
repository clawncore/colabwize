import React from 'react';
import { AdminLayout } from '../layout/AdminLayout';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Target, 
  Users, 
  BarChart3, 
  Zap, 
  ArrowUpRight,
  Send,
  Mail,
  Share2,
  TrendingUp,
  Cpu
} from 'lucide-react';

export const AdminMarketingHubView: React.FC = () => {
  const campaigns = [
    { name: 'Neural Launch Sweep', status: 'Active', reach: '12.4k', growth: '+18%', icon: Send, color: 'text-sky-500' },
    { name: 'Enterprise Outreach', status: 'Paused', reach: '4.2k', growth: '0%', icon: Target, color: 'text-orange-500' },
    { name: 'Beta Signal Program', status: 'Optimal', reach: '8.9k', growth: '+24%', icon: Megaphone, color: 'text-emerald-500' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden p-12 bg-card border border-border rounded-[3rem] group">
          <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Cpu size={240} className="text-sky-500" />
          </div>
          
          <div className="relative z-10">
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-3 mb-6"
            >
              <Zap size={16} className="text-sky-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500">Global Broadcast Active</span>
              <div className="h-px w-12 bg-border" />
            </motion.div>
            
            <h2 className="text-6xl font-black text-foreground tracking-tighter leading-none mb-6">
              Growth <span className="text-sky-500 italic">Intelligence</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Orchestrate global marketing transmissions and monitor audience acquisition velocity through the neural broadcasting array.
            </p>
            
            <div className="flex gap-4 mt-10">
              <button className="px-8 py-4 bg-sky-500 text-white font-black rounded-2xl shadow-xl shadow-sky-500/20 hover:shadow-sky-500/30 transition-all hover:-translate-y-1 active:scale-95 text-xs tracking-widest uppercase italic">
                Initialize Campaign
              </button>
              <button className="px-8 py-4 bg-secondary border border-border text-foreground font-black rounded-2xl hover:border-muted-foreground transition-all text-xs tracking-widest uppercase">
                Analytics Deepflow
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {campaigns.map((camp, i) => (
            <motion.div 
              key={camp.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-8 bg-card/40 border border-border rounded-[2.5rem] relative overflow-hidden group hover:border-sky-500/30 transition-all backdrop-blur-sm"
            >
              <div className="flex justify-between items-start mb-10">
                <div className={`p-4 rounded-2xl bg-secondary ${camp.color} border border-border`}>
                  <camp.icon size={28} />
                </div>
                <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-black border border-emerald-500/20">
                  <TrendingUp size={12} />
                  {camp.growth}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{camp.status} Payload</p>
                <h3 className="text-2xl font-black text-foreground tracking-tight">{camp.name}</h3>
              </div>
              
              <div className="mt-8 pt-8 border-t border-border flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Reach</p>
                  <p className="text-3xl font-black text-foreground tracking-tighter">{camp.reach}</p>
                </div>
                <button className="p-3 bg-secondary rounded-xl text-muted-foreground hover:text-sky-500 transition-colors">
                  <ArrowUpRight size={20} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Secondary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 p-10 bg-card/20 border border-border rounded-[3rem] border-dashed flex flex-col items-center justify-center text-center group hover:bg-card/30 transition-all cursor-pointer">
              <div className="h-20 w-20 rounded-[2rem] bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Share2 size={32} className="text-sky-500/40" />
              </div>
              <h3 className="text-2xl font-black text-foreground italic">Social Link Synchronization</h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm font-medium">Connect external data sources to the marketing matrix for unified audience intelligence.</p>
           </div>
           
           <div className="p-10 bg-primary/5 border border-primary/20 rounded-[3rem] space-y-8 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-black text-foreground italic flex items-center gap-3">
                  <Mail size={20} className="text-sky-500" />
                  Newsletter Uplink
                </h3>
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-2 leading-relaxed">Broadcast monthly status reports to your global subscriber base.</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                   <p className="text-4xl font-black text-foreground tracking-tighter">1,204</p>
                   <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-1">Subscribers</p>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                   <div className="h-full w-[65%] bg-sky-500" />
                </div>
              </div>
              
              <button className="w-full py-4 bg-sky-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all">
                Access Newsletter Array
              </button>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
};
