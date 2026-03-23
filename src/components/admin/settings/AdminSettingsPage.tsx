import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Zap, 
  Shield, 
  Globe, 
  Save,
  Loader2
} from 'lucide-react';
import NotificationSettings from './NotificationSettings';

export const AdminSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'notifications'>('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // In a real app, this would call an API to update platform settings
    }, 1000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="text-sky-500" size={24} />
              Platform Configuration
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Manage global settings, API integrations and communication protocols.
            </p>
          </div>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Processing...' : 'Deploy Changes'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all relative ${
                activeTab === tab.id 
                  ? 'text-sky-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'general' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="p-8 bg-white border border-slate-200 rounded-2xl space-y-6 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Application Identity</h3>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-4">Core Branding Parameters</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Site Name</label>
                      <input 
                        type="text" 
                        defaultValue="ColabWize"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Support Email</label>
                      <input 
                        type="email" 
                        defaultValue="support@colabwize.com"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all text-sm font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-sky-500 shadow-sm">
                  <Shield size={32} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">Advanced Access Control</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Permissions for secondary administrators can be managed in the <span className="text-sky-600 font-bold">User Directory</span>.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'integrations' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Unsplash API', status: 'Connected', icon: Zap, color: 'text-sky-500', desc: 'Used for cover image stock selection.' },
                  { name: 'OpenAI (GPT-4)', status: 'Connected', icon: Zap, color: 'text-emerald-500', desc: 'Powers AI email generation.' },
                  { name: 'Supabase', status: 'Active', icon: Shield, color: 'text-sky-400', desc: 'Core database and authentication.' },
                  { name: 'Postmark/Resend', status: 'Active', icon: Bell, color: 'text-indigo-500', desc: 'Transactional email delivery engine.' },
                ].map((item) => (
                  <div key={item.name} className="p-6 bg-white border border-slate-200 rounded-2xl hover:border-sky-200 transition-all shadow-sm group">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2.5 rounded-lg bg-slate-50 ${item.color} border border-slate-100 group-hover:scale-110 transition-transform duration-500`}>
                        <item.icon size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {item.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{item.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <NotificationSettings />
            </motion.div>
          )}
      </div>
    </div>
  );
};
