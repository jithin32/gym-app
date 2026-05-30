import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user } = useAppSelector((s) => s.auth);

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'coach') return <Navigate to="/coach/dashboard" replace />;
    return <Navigate to="/member/attendance" replace />;
  }

  return <>{children}</>;
}
