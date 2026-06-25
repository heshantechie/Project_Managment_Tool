import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function AdminRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', textAlign: 'center', color: 'var(--text3)' }}>
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.user.email !== 'bethahemanth7264@gmail.com') {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
        <div style={{ marginTop: '16px' }}>
          <a href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>Return to Dashboard</a>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
