import { Navigate, Outlet } from 'react-router-dom';
import { getSession } from '../lib/session';
import type { Role } from '../types';

interface ProtectedRouteProps {
    allowedRole?: Role;
}

export default function ProtectedRoute({ allowedRole }: ProtectedRouteProps) {
    const user = getSession();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRole && user.role !== allowedRole) {
        // Redirect based on their actual role
        switch (user.role) {
            case 'STUDENT': return <Navigate to="/student" replace />;
            case 'TUTOR': return <Navigate to="/tutor" replace />;
            case 'ADMIN': return <Navigate to="/admin" replace />;
            default: return <Navigate to="/login" replace />;
        }
    }

    return <Outlet />;
}
