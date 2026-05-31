import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { CalendarCheck, Flame, Dumbbell, Activity, LogOut } from 'lucide-react';
import NotificationBell from '../../features/notifications/NotificationBell';

const navItems = [
  { to: '/member/attendance', icon: CalendarCheck, label: 'Attendance' },
  { to: '/member/warmup', icon: Flame, label: 'Warm-Up' },
  { to: '/member/workout', icon: Dumbbell, label: 'Workout' },
  { to: '/member/progress', icon: Activity, label: 'Progress' },
];

export default function MemberLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-primary-500" />
          <span className="text-white font-bold text-sm">Aditya Gym</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell dark />
          <span className="text-gray-400 text-sm">{user?.name}</span>
          <button onClick={handleLogout} className="text-gray-500 hover:text-white transition">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-3 text-xs transition relative ${
                isActive ? 'text-white' : 'text-gray-600 hover:text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
