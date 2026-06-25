import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '../../lib/supabase';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileName, setProfileName] = useState<string>('');

  useEffect(() => {
    if (user) {
      // First try to use user metadata
      if (user.user_metadata?.full_name) {
        setProfileName(user.user_metadata.full_name);
      } else {
        // Fallback to fetch from profiles table
        supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setProfileName(data.full_name);
            }
          });
      }
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const initials = profileName 
    ? profileName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {user?.email === 'bethahemanth7264@gmail.com' && (
        <button
          onClick={() => navigate('/admin/approvals')}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: 13, marginRight: 8 }}
        >
          Approvals
        </button>
      )}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          {profileName || 'User'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
          {user?.email}
        </div>
      </div>
      <div 
        style={{ 
          width: 36, 
          height: 36, 
          borderRadius: 12, 
          background: 'var(--purple-light)', 
          color: 'var(--purple-text)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 700,
          fontFamily: 'Syne, sans-serif'
        }}
      >
        {initials}
      </div>
      <button 
        onClick={handleSignOut}
        className="btn-ghost"
        style={{ padding: '6px 12px', marginLeft: 8 }}
      >
        Logout
      </button>
    </div>
  );
}
