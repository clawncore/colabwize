import React from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, 
  Target, 
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
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden p-10 bg-white border border-slate-200 rounded-2xl group shadow-sm">
        <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000">
          <Cpu size={240} className="text-sky-500" />
        </div>
        
        <div className="relative z-10 text-left">
          <motion.div 
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-3 mb-6"
          >
            <Zap size={14} className="text-sky-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600">Global Broadcast Active</span>
            <div className="h-px w-8 bg-slate-100" />
          </motion.div>
          
          <h2 className="text-5xl font-bold text-slate-900 tracking-tight leading-none mb-6">
            Growth <span className="text-sky-500">Intelligence</span>
          </h2>
          <p className="text-base text-slate-500 font-medium max-w-2xl leading-relaxed">
            Orchestrate global marketing transmissions and monitor audience acquisition velocity through the neural broadcasting array.
          </p>
          
          <div className="flex gap-4 mt-10">
            <button className="px-8 py-3.5 bg-sky-500 text-white font-bold rounded-xl shadow-sm hover:bg-sky-600 transition-all active:scale-95 text-[10px] tracking-widest uppercase">
              Initialize Campaign
            </button>
            <button className="px-8 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all text-[10px] tracking-widest uppercase">
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
            className="p-8 bg-white border border-slate-200 rounded-2xl relative overflow-hidden group hover:border-sky-200 transition-all text-left shadow-sm"
          >
            <div className="flex justify-between items-start mb-10">
              <div className={`p-4 rounded-xl bg-slate-50 ${camp.color} border border-slate-100`}>
                <camp.icon size={24} />
              </div>
              <div className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold border border-emerald-100">
                <TrendingUp size={12} />
                {camp.growth}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{camp.status} Payload</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{camp.name}</h3>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-end">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Reach</p>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">{camp.reach}</p>
              </div>
              <button className="p-2.5 bg-slate-50 rounded-lg text-slate-400 hover:text-sky-500 transition-colors">
                <ArrowUpRight size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-10 bg-slate-50 border border-slate-200 border-dashed rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-white hover:border-sky-200 transition-all cursor-pointer">
             <div className="h-20 w-20 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-sm">
               <Share2 size={32} className="text-sky-500/40" />
             </div>
             <h3 className="text-2xl font-bold text-slate-900">Social Link Synchronization</h3>
             <p className="text-slate-500 mt-2 max-w-sm text-sm font-medium">Connect external data sources to the marketing hub for unified audience intelligence.</p>
          </div>
          
          <div className="p-10 bg-sky-50 border border-sky-100 rounded-2xl space-y-8 flex flex-col justify-between text-left">
             <div>
               <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                 <Mail size={20} className="text-sky-500" />
                 Newsletter Uplink
               </h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2 leading-relaxed">Broadcast monthly status reports to your global subscriber base.</p>
             </div>
             
             <div className="space-y-4">
               <div className="flex justify-between items-end">
                  <p className="text-4xl font-bold text-slate-900 tracking-tight">1,204</p>
                  <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-1">Subscribers</p>
               </div>
               <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                  <div className="h-full w-[65%] bg-sky-500" />
               </div>
             </div>
             
             <button className="w-full py-4 bg-sky-500 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest shadow-sm hover:bg-sky-600 active:scale-95 transition-all">
               Access Newsletter Array
             </button>
          </div>
      </div>
    </div>
  );
};
