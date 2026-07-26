import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { UserRole, ShopUser } from '../../types';
import { UserPlus, Moon, Sun } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { shop, shopUsers, addShopUser, theme, toggleTheme, user } = useAppStore();
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('cashier');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserPhone) return;

    addShopUser({
      shop_id: shop?.id || 'shop-1',
      user_id: 'user-' + Date.now(),
      user_name: newUserName,
      user_phone: newUserPhone,
      role: newUserRole,
      status: 'active'
    });

    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserPhone('');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Shop Settings & Team</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Multi-User Roles & Business Information</p>
        </div>
      </div>

      {/* Shop Info Card */}
      <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--khatta-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px' }}>
            {shop?.name.charAt(0)}
          </div>
          <div>
            <h3 style={{ fontSize: '16px' }}>{shop?.name}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{shop?.category} • GSTIN: {shop?.gstin || 'N/A'}</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px', color: 'var(--text-main)', background: 'var(--border-subtle)', padding: '10px 12px', borderRadius: '10px' }}>
          <div><strong>Address:</strong> {shop?.door_no}, {shop?.street}, {shop?.village_town}, {shop?.district}, {shop?.state} - {shop?.pincode}</div>
          <div><strong>Shop UPI ID:</strong> {shop?.upi_id}</div>
          <div><strong>Owner:</strong> {user?.full_name} ({user?.phone})</div>
        </div>
      </div>

      {/* SaaS Subscription Status Card */}
      <div style={{ background: 'linear-gradient(135deg, #059669, #047857)', color: 'white', borderRadius: '16px', padding: '16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
              SaaS Pro Plan
            </span>
            <h3 style={{ color: 'white', fontSize: '16px', marginTop: 4 }}>Credora Unlimited Pro</h3>
            <p style={{ fontSize: '12px', opacity: 0.9 }}>Multi-User, WhatsApp Reminders & AI Enabled</p>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 800 }}>Active</div>
        </div>
      </div>

      {/* Multi-User Shop Users (shop_users) */}
      <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: '15px' }}>Staff & User Roles</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Owner, Manager, Cashier, Accountant</p>
          </div>
          <button className="btn-primary" onClick={() => setShowAddUserModal(true)} style={{ width: 'auto', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
            <UserPlus size={14} />
            + Add Staff
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {shopUsers.map((su: ShopUser) => (
            <div key={su.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: 'var(--border-subtle)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{su.user_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{su.user_phone}</div>
              </div>
              <span style={{ background: 'var(--khatta-50)', color: 'var(--khatta-700)', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, textTransform: 'capitalize' }}>
                {su.role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Theme Switcher */}
      <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '14px' }}>Appearance Theme</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Switch between Dark & Light Mode</p>
        </div>
        <button className="btn-secondary" onClick={toggleTheme} style={{ width: 'auto', padding: '8px 14px', borderRadius: '10px' }}>
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          <span style={{ marginLeft: 6 }}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>

      {/* Add Staff Modal */}
      {showAddUserModal && (
        <div className="modal-overlay" onClick={() => setShowAddUserModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2>Add Staff Team Member</h2>
              <button onClick={() => setShowAddUserModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Staff Full Name *</label>
                <input type="text" className="input-field" placeholder="e.g. Ramesh Kumar" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Mobile Number *</label>
                <input type="text" className="input-field" placeholder="+91 94400 11111" value={newUserPhone} onChange={(e) => setNewUserPhone(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Select Role *</label>
                <select className="input-field" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as UserRole)}>
                  <option value="cashier">Cashier (Sales & Payments)</option>
                  <option value="manager">Manager (Full Access)</option>
                  <option value="accountant">Accountant (Reports & Ledger)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: 8 }}>
                Assign & Add Staff Member
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
