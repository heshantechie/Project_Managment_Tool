import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { UserMenu } from '../auth/UserMenu';

interface PendingRegistration {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function UserApprovals() {
  const [registrations, setRegistrations] = useState<PendingRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id: string, action: 'approve' | 'reject') => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', id);

      if (error) {
        throw new Error(error.message || 'Failed to process request');
      }

      await fetchRegistrations();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : `Failed to ${action} user`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text3)' }}>Loading approvals...</div>;
  }

  return (
    <div>
      <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,var(--purple),var(--rose))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#fff', fontSize: 15, fontFamily: 'Syne,sans-serif', fontWeight: 700 }}>V</span>
              </div>
              <span style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: 'var(--text)', letterSpacing: '-0.3px' }}>Ve</span>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <Link to="/dashboard" className="nav-btn" style={{ textDecoration: 'none' }}>Dashboard</Link>
              <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }}></div>
              <UserMenu />
          </div>
      </nav>

      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div>
                <Link to="/dashboard" style={{ color: 'var(--text2)', textDecoration: 'none', fontSize: 13, marginBottom: 8, display: 'inline-block' }}>&larr; Back to Dashboard</Link>
                <h1 className="page-title" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', fontFamily: 'Syne,sans-serif' }}>User Approvals</h1>
                <p className="page-sub" style={{ color: 'var(--text2)', fontSize: 14 }}>Manage pending registration requests</p>
            </div>
            <button className="btn-secondary" style={{ padding: '8px 16px', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: 8, cursor: 'pointer' }} onClick={fetchRegistrations}>Refresh</button>
        </div>

        {error && <div style={{ background: 'var(--pink-light)', color: 'var(--pink-text)', padding: '12px 16px', borderRadius: 8, marginBottom: 24, fontSize: 14 }}>{error}</div>}

        <div className="proj-grid" style={{ gridTemplateColumns: '1fr' }}>
          {registrations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>No pending registrations</h3>
              <p style={{ color: 'var(--text3)', fontSize: 14 }}>There are currently no access requests waiting for approval.</p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead style={{ backgroundColor: 'var(--surface2)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text2)' }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text2)' }}>Email</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text2)' }}>Requested</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text2)' }}>Status</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text2)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(reg => (
                    <tr key={reg.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', color: 'var(--text)', fontWeight: 500 }}>{reg.full_name}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>{reg.email}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text2)' }}>
                        {new Date(reg.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: 500,
                          backgroundColor: reg.status === 'pending' ? 'var(--amber-light)' : reg.status === 'approved' ? 'var(--green-light)' : 'var(--pink-light)',
                          color: reg.status === 'pending' ? 'var(--amber-text)' : reg.status === 'approved' ? 'var(--green-text)' : 'var(--pink-text)'
                        }}>
                          {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        {reg.status === 'pending' && (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button 
                              className="btn-primary" 
                              style={{ padding: '6px 12px', fontSize: '13px', background: 'var(--purple)', color: '#fff', border: 'none', borderRadius: 6, cursor: processingId === reg.id ? 'not-allowed' : 'pointer' }}
                              onClick={() => handleProcess(reg.id, 'approve')}
                              disabled={processingId === reg.id}
                            >
                              {processingId === reg.id ? '...' : 'Approve'}
                            </button>
                            <button 
                              className="btn-ghost" 
                              style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--pink)', background: 'transparent', border: '1px solid var(--pink)', borderRadius: 6, cursor: processingId === reg.id ? 'not-allowed' : 'pointer' }}
                              onClick={() => handleProcess(reg.id, 'reject')}
                              disabled={processingId === reg.id}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
