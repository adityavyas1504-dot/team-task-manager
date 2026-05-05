import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../utils/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
      </div>

      <div style={{ maxWidth: 500 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Account Information</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 16, background: 'var(--gray-50)', borderRadius: 8 }}>
              <div className="avatar lg">{initials}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{user?.name}</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>{user?.email}</div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-control" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-control" value={user?.email} disabled style={{ background: 'var(--gray-50)', color: 'var(--gray-500)' }} />
                <span style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4, display: 'block' }}>Email cannot be changed</span>
              </div>
              <div className="form-group">
                <label className="form-label">Avatar URL <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>(optional)</span></label>
                <input className="form-control" type="url" placeholder="https://..." value={form.avatar}
                  onChange={e => setForm({ ...form, avatar: e.target.value })} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
