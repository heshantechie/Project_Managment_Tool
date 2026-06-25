import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function ProtectedRoute() {
  const { session, profileStatus, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', textAlign: 'center', color: 'var(--text3)' }}>
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profileStatus === 'pending') {
    return (
      <div style={{ padding: '40px 24px', maxWidth: 600, margin: '40px auto', textAlign: 'center', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Pending Approval</h2>
        <p style={{ color: 'var(--text2)', lineHeight: 1.6, marginBottom: 24 }}>
          Your account has been created successfully, but it is currently awaiting administrator approval. You will be able to access the dashboard once approved.
        </p>
        <button className="btn-primary" onClick={() => window.location.href = '/login'}>Return to Login</button>
      </div>
    );
  }

  return <Outlet />;
}
