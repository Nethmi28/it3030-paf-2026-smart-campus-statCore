import { Mail, MapPin, PencilLine, Phone, Save, ShieldCheck, UserCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { profileService } from '../../services/profileService';

const roleTitles = {
  ROLE_ADMIN: 'Administrator Profile',
  ROLE_MANAGER: 'Manager Profile',
  ROLE_TECHNICIAN: 'Technician Profile',
  ROLE_STUDENT: 'Student Profile'
};

function formatRole(role) {
  return (role || 'ROLE_USER').replace('ROLE_', '').replace(/_/g, ' ');
}

function buildEmptyForm(profile, fallbackName) {
  return {
    name: profile?.name || fallbackName || '',
    phoneNumber: profile?.phoneNumber || '',
    address: profile?.address || ''
  };
}

export default function ProfileDetails() {
  const { user, updateCurrentUserProfile } = useAuth();
  const currentUser = user || { name: 'Guest', role: 'ROLE_USER', token: '' };
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(buildEmptyForm(null, currentUser.name));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadProfile = async () => {
      if (!currentUser.token) {
        if (isActive) {
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError('');
        const payload = await profileService.getMyProfile(currentUser.token);

        if (!isActive) {
          return;
        }

        setProfile(payload);
        setForm(buildEmptyForm(payload, currentUser.name));
      } catch (loadError) {
        if (isActive) {
          setError(loadError.message || 'Failed to load your profile.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isActive = false;
    };
  }, [currentUser.name, currentUser.token]);

  const resolvedProfile = profile || {
    name: currentUser.name,
    email: 'Not available',
    role: currentUser.role,
    phoneNumber: '',
    address: ''
  };

  const roleLabel = formatRole(resolvedProfile.role);
  const pageTitle = roleTitles[resolvedProfile.role] || 'Profile Details';

  const hasChanges = useMemo(() => (
    form.name !== (profile?.name || currentUser.name || '') ||
    form.phoneNumber !== (profile?.phoneNumber || '') ||
    form.address !== (profile?.address || '')
  ), [currentUser.name, form.address, form.name, form.phoneNumber, profile]);

  const handleFieldChange = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value
    }));
    setSuccess('');
  };

  const handleReset = () => {
    setForm(buildEmptyForm(profile, currentUser.name));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = await profileService.updateMyProfile(currentUser.token, {
        name: form.name.trim(),
        phoneNumber: form.phoneNumber.trim(),
        address: form.address.trim()
      });

      setProfile(payload);
      setForm(buildEmptyForm(payload, currentUser.name));
      updateCurrentUserProfile(payload);
      setSuccess('Your profile changes were saved.');
    } catch (saveError) {
      setError(saveError.message || 'Failed to save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '24px' }}>
      <section
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '28px',
          padding: '32px',
          boxShadow: 'var(--stat-card-shadow)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '86px',
              height: '86px',
              borderRadius: '50%',
              background: '#3b82f6',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.7rem',
              fontWeight: '800',
              flexShrink: 0
            }}
          >
            {resolvedProfile.name?.charAt(0) || 'U'}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#3b82f6', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              My Profile
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>
              {pageTitle}
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Review your account details and update the personal information that you are allowed to change.
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '14px 16px', borderRadius: '14px', fontWeight: 600, fontSize: '0.92rem' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#ecfdf5', color: '#047857', padding: '14px 16px', borderRadius: '14px', fontWeight: 600, fontSize: '0.92rem' }}>
          {success}
        </div>
      )}

      <section
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '28px',
          padding: '28px',
          boxShadow: 'var(--stat-card-shadow)'
        }}
      >
        <div style={{ display: 'grid', gap: '2px' }}>
          {[
            {
              label: 'Full Name',
              value: resolvedProfile.name || 'Not available',
              icon: <UserCircle2 size={18} />,
              accent: '#3b82f6'
            },
            {
              label: 'Email',
              value: resolvedProfile.email || 'Not available',
              icon: <Mail size={18} />,
              accent: '#14b8a6'
            },
            {
              label: 'Role',
              value: roleLabel,
              icon: <ShieldCheck size={18} />,
              accent: '#22c55e'
            },
            {
              label: 'Phone Number',
              value: resolvedProfile.phoneNumber || 'Not added yet',
              icon: <Phone size={18} />,
              accent: '#f59e0b'
            },
            {
              label: 'Address',
              value: resolvedProfile.address || 'Not added yet',
              icon: <MapPin size={18} />,
              accent: '#8b5cf6'
            }
          ].map((item, index, items) => (
            <div
              key={item.label}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(180px, 240px) minmax(0, 1fr)',
                gap: '20px',
                alignItems: 'center',
                padding: '18px 0',
                borderBottom: index === items.length - 1 ? 'none' : '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.92rem' }}>
                <span
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '12px',
                    background: `${item.accent}20`,
                    color: item.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              <div style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '0.96rem', lineHeight: 1.6, wordBreak: 'break-word' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '28px',
          padding: '28px',
          boxShadow: 'var(--stat-card-shadow)',
          display: 'grid',
          gap: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontWeight: '800', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              <PencilLine size={16} />
              Edit Profile
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Update Your Personal Details
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              You can update your displayed name, phone number, and address here. Your email and role stay read-only.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            <label style={{ display: 'grid', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.9rem' }}>Full Name</span>
              <input
                value={form.name}
                onChange={handleFieldChange('name')}
                disabled={loading || saving}
                placeholder="Enter your full name"
                style={{
                  height: '52px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  padding: '0 16px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--bg-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.9rem' }}>Phone Number</span>
              <input
                value={form.phoneNumber}
                onChange={handleFieldChange('phoneNumber')}
                disabled={loading || saving}
                placeholder="Add your phone number"
                style={{
                  height: '52px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  padding: '0 16px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--bg-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
            <label style={{ display: 'grid', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.9rem' }}>Email</span>
              <input
                value={resolvedProfile.email || ''}
                disabled
                style={{
                  height: '52px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  padding: '0 16px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--bg-alt)',
                  color: 'var(--text-muted)'
                }}
              />
            </label>

            <label style={{ display: 'grid', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.9rem' }}>Role</span>
              <input
                value={roleLabel}
                disabled
                style={{
                  height: '52px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  padding: '0 16px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  background: 'var(--bg-alt)',
                  color: 'var(--text-muted)'
                }}
              />
            </label>
          </div>

          <label style={{ display: 'grid', gap: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: '700', fontSize: '0.9rem' }}>Address</span>
            <textarea
              value={form.address}
              onChange={handleFieldChange('address')}
              disabled={loading || saving}
              placeholder="Add your address"
              rows={4}
              style={{
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                padding: '14px 16px',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
                minHeight: '116px'
              }}
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleReset}
              disabled={loading || saving || !hasChanges}
              style={{
                height: '46px',
                padding: '0 18px',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: loading || saving || !hasChanges ? 'not-allowed' : 'pointer',
                opacity: loading || saving || !hasChanges ? 0.6 : 1
              }}
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={loading || saving || !hasChanges}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                height: '46px',
                padding: '0 18px',
                borderRadius: '14px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: loading || saving || !hasChanges ? 'not-allowed' : 'pointer',
                opacity: loading || saving || !hasChanges ? 0.65 : 1,
                boxShadow: '0 12px 24px rgba(37, 99, 235, 0.18)'
              }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
