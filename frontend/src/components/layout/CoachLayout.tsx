import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { LayoutDashboard, Users, CalendarCheck, Dumbbell, LogOut, ClipboardList, Menu, X } from 'lucide-react';
import NotificationBell from '../../features/notifications/NotificationBell';

const navItems = [
  { to: '/coach/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/coach/members', icon: Users, label: 'My Members' },
  { to: '/coach/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/coach/exercises', icon: Dumbbell, label: 'Exercises' },
  { to: '/coach/plans', icon: ClipboardList, label: 'Workout Plans' },
];

export default function CoachLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-60 bg-gray-900 flex flex-col flex-shrink-0 transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Aditya Gym</p>
              <p className="text-gray-500 text-xs">Coach Portal</p>
            </div>
            <button className="md:hidden text-gray-400 hover:text-white" onClick={closeSidebar}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <div className="px-3 py-2 mb-1 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs">Coach</p>
            </div>
            <NotificationBell dark />
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center px-4 h-14 bg-white border-b border-gray-200 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700 mr-3">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Aditya Gym</span>
          </div>
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
