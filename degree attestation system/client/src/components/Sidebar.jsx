import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  LayoutDashboard, 
  FilePlus, 
  FileText, 
  LogOut, 
  ShieldAlert, 
  UserCircle 
} from 'lucide-react';

const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isStudent = user?.role === 'student';
  const isAdmin = user?.role === 'admin';

  const menuItems = isStudent 
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/application', label: 'New Application', icon: FilePlus },
      ]
    : [
        { path: '/admin/dashboard', label: 'Admin Panel', icon: LayoutDashboard },
        { path: '/admin/requests', label: 'Attestation Queue', icon: FileText },
      ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('user');
      navigate(isAdmin ? '/admin/login' : '/login');
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen border-r border-slate-800 no-print">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-iqra-600 p-2 rounded-lg text-white">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-white leading-tight">Iqra University</h1>
          <span className="text-xs text-slate-400">Attestation Portal</span>
        </div>
      </div>

      {/* Profile Section */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-slate-950/50">
        <UserCircle className="w-10 h-10 text-slate-400 shrink-0" />
        <div className="overflow-hidden">
          <p className="font-medium text-white truncate text-sm">
            {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
          </p>
          <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-semibold tracking-wider text-iqra-400 uppercase bg-iqra-950/80 border border-iqra-800 rounded">
            {user?.role || 'Guest'}
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-iqra-600 text-white shadow-md shadow-iqra-900/30' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-rose-400 rounded-lg hover:bg-rose-950/30 hover:text-rose-300 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 text-rose-400" />
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
