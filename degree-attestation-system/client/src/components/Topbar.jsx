import React from 'react';
import { Bell, ShieldCheck, HelpCircle } from 'lucide-react';

const Topbar = ({ title, user }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm no-print">
      {/* Title Area */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">{title || 'Portal Dashboard'}</h2>
      </div>

      {/* Action Indicators */}
      <div className="flex items-center gap-6">
        {/* Support docs hint */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-full">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
          <span>Support: support@iqra.edu.pk</span>
        </div>

        {/* System status tag */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>AI Engine Active</span>
        </div>

        {/* Notifications Icon (Mock) */}
        <button className="text-slate-400 hover:text-slate-600 relative p-1 rounded-full hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>

        {/* Profile Snapshot */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-iqra-50 border border-iqra-200 flex items-center justify-center font-bold text-iqra-700">
            {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-700 leading-none">
              {user ? `${user.firstName} ${user.lastName}` : 'System User'}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">
              {user?.email || 'user@iqra.edu.pk'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
