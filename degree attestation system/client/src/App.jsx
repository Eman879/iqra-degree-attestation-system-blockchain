import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/auth/Login';
import AdminLogin from './pages/auth/AdminLogin';
import Dashboard from './pages/student/Dashboard';
import ApplicationWizard from './pages/student/ApplicationWizard';
import StatusDetail from './pages/student/StatusDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequests from './pages/admin/AdminRequests';
import RequestDetail from './pages/admin/RequestDetail';

// Layout wrapper for Student routes
const StudentLayout = ({ user, onLogout }) => {
  if (!user || user.role !== 'student') {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Student Attestation Panel" user={user} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Layout wrapper for Admin routes
const AdminLayout = ({ user, onLogout }) => {
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar user={user} onLogout={onLogout} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Staff Verification Console" user={user} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Session loading failed:', err);
        localStorage.removeItem('user');
      }
    }
    setInitializing(false);
  }, []);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="w-10 h-10 border-4 border-iqra-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Login Routes */}
        <Route 
          path="/login" 
          element={user?.role === 'student' ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/admin/login" 
          element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <AdminLogin onLoginSuccess={handleLoginSuccess} />} 
        />

        {/* Private Student Routes */}
        <Route element={<StudentLayout user={user} onLogout={handleLogout} />}>
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/application" element={<ApplicationWizard user={user} />} />
          <Route path="/status/:applicationId" element={<StatusDetail user={user} />} />
          <Route path="/approved/:applicationId" element={<StatusDetail user={user} />} />
          <Route path="/rejected/:applicationId" element={<StatusDetail user={user} />} />
        </Route>

        {/* Private Admin Routes */}
        <Route element={<AdminLayout user={user} onLogout={handleLogout} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard user={user} />} />
          <Route path="/admin/requests" element={<AdminRequests user={user} />} />
          <Route path="/admin/requests/:applicationId" element={<RequestDetail user={user} />} />
        </Route>

        {/* Fallback Redirects */}
        <Route 
          path="*" 
          element={<Navigate to={user ? (user.role === 'admin' ? '/admin/dashboard' : '/dashboard') : '/login'} replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
