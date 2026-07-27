import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { UserRole, ShopUser } from '../../types';
import { UserPlus, Moon, Sun, Database, RefreshCw, UploadCloud, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { 
  isSupabaseConfigured, 
  fetchCloudDataToLocal, 
  syncAllLocalDataToCloud, 
  clearAllSupabaseData
} from '../../services/supabase';

export const SettingsView: React.FC = () => {
  const { 
    shop, 
    shopUsers, 
    addShopUser, 
    theme, 
    toggleTheme, 
    user,
    customers,
    products,
    sales,
    payments,
    clearAllData,
    setCloudData
  } = useAppStore();

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('cashier');

  // Storage state management modal & notifications
  const [showClearStorageModal, setShowClearStorageModal] = useState(false);
  const [clearTarget, setClearTarget] = useState<'both' | 'local' | 'supabase'>('both');
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handlePullFromSupabase = async () => {
    setIsLoading(true);
    setSyncStatusMsg(null);
    try {
      const res = await fetchCloudDataToLocal();
      if (res.success && res.data) {
        if (res.isEmpty) {
          clearAllData();
          setSyncStatusMsg({ type: 'success', text: 'Supabase Cloud DB is empty. Local app storage cleared to match Supabase!' });
        } else {
          setCloudData(res.data);
          setSyncStatusMsg({ type: 'success', text: 'Successfully pulled latest records from Supabase Cloud DB!' });
        }
      } else {
        setSyncStatusMsg({ type: 'error', text: res.message || 'Failed to fetch from Supabase' });
      }
    } catch (err: any) {
      setSyncStatusMsg({ type: 'error', text: err?.message || 'Error fetching cloud storage data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushToSupabase = async () => {
    setIsLoading(true);
    setSyncStatusMsg(null);
    try {
      const res = await syncAllLocalDataToCloud();
      if (res.success) {
        setSyncStatusMsg({ type: 'success', text: res.message });
      } else {
        setSyncStatusMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setSyncStatusMsg({ type: 'error', text: err?.message || 'Failed to push local data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteClearStorage = async () => {
    setIsLoading(true);
    setSyncStatusMsg(null);
    try {
      if (clearTarget === 'local' || clearTarget === 'both') {
        clearAllData();
      }

      if (clearTarget === 'supabase' || clearTarget === 'both') {
        const res = await clearAllSupabaseData();
        if (!res.success) {
          throw new Error(res.message);
        }
      }

      setSyncStatusMsg({ 
        type: 'success', 
        text: clearTarget === 'both' 
          ? 'Cleared ALL data in Local App Storage & Supabase Cloud DB!' 
          : clearTarget === 'local' 
          ? 'Cleared Local App Storage successfully!' 
          : 'Cleared Supabase Cloud DB tables successfully!' 
      });
      setShowClearStorageModal(false);
    } catch (err: any) {
      setSyncStatusMsg({ type: 'error', text: err?.message || 'Clear storage action failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Shop Settings & Storage</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Database Sync, Storage Management & Team Roles</p>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatusMsg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: 16,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: syncStatusMsg.type === 'success' ? 'var(--khatta-50)' : 'var(--debt-50)',
          color: syncStatusMsg.type === 'success' ? 'var(--khatta-700)' : 'var(--debt-700)',
          border: syncStatusMsg.type === 'success' ? '1px solid var(--khatta-200)' : '1px solid var(--debt-200)'
        }}>
          {syncStatusMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{syncStatusMsg.text}</span>
        </div>
      )}

      {/* Storage & Database Control Card */}
      <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: isSupabaseConfigured() ? 'var(--khatta-100)' : 'var(--border-subtle)', color: 'var(--khatta-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px' }}>Storage & Database Engine</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {isSupabaseConfigured() ? 'Connected to Supabase Cloud DB' : 'Operating in Local Storage Mode'}
              </p>
            </div>
          </div>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: 800, 
            padding: '3px 8px', 
            borderRadius: '9999px', 
            background: isSupabaseConfigured() ? 'var(--khatta-50)' : 'var(--border-subtle)',
            color: isSupabaseConfigured() ? 'var(--khatta-600)' : 'var(--text-muted)'
          }}>
            {isSupabaseConfigured() ? 'Supabase Active' : 'Offline Engine'}
          </span>
        </div>

        {/* Current Storage Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14, textAlign: 'center' }}>
          <div style={{ background: 'var(--border-subtle)', padding: '10px 6px', borderRadius: '10px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--khatta-600)' }}>{customers.length}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 2 }}>Customers</div>
          </div>
          <div style={{ background: 'var(--border-subtle)', padding: '10px 6px', borderRadius: '10px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--khatta-600)' }}>{products.length}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 2 }}>Products</div>
          </div>
          <div style={{ background: 'var(--border-subtle)', padding: '10px 6px', borderRadius: '10px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--khatta-600)' }}>{sales.length}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 2 }}>Sales</div>
          </div>
          <div style={{ background: 'var(--border-subtle)', padding: '10px 6px', borderRadius: '10px' }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--khatta-600)' }}>{payments.length}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 2 }}>Payments</div>
          </div>
        </div>

        {/* Action Buttons for Storage Sync & Clear */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button 
              className="btn-secondary" 
              onClick={handlePullFromSupabase}
              disabled={isLoading || !isSupabaseConfigured()}
              style={{ padding: '8px 12px', fontSize: '12px', justifyContent: 'center' }}
            >
              <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
              <span>Pull from Supabase</span>
            </button>

            <button 
              className="btn-secondary" 
              onClick={handlePushToSupabase}
              disabled={isLoading || !isSupabaseConfigured()}
              style={{ padding: '8px 12px', fontSize: '12px', justifyContent: 'center' }}
            >
              <UploadCloud size={14} />
              <span>Push to Supabase</span>
            </button>
          </div>

          <button 
            onClick={() => setShowClearStorageModal(true)}
            style={{
              padding: '10px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              background: 'var(--debt-50)',
              color: 'var(--debt-600)',
              border: '1px solid var(--debt-200)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
              marginTop: 4
            }}
          >
            <Trash2 size={15} />
            <span>Clear Storage Data & Reset App</span>
          </button>
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

      {/* Clear Storage Modal */}
      {showClearStorageModal && (
        <div className="modal-overlay" onClick={() => setShowClearStorageModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--debt-600)' }}>
                <AlertTriangle size={20} />
                <h2 style={{ color: 'var(--debt-600)' }}>Clear Storage & Reset Data</h2>
              </div>
              <button onClick={() => setShowClearStorageModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 16 }}>
              Select what storage data you want to clear. This action will reset customer records, sales, payments and inventory items.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px',
                borderRadius: '10px',
                border: clearTarget === 'both' ? '2px solid var(--debt-600)' : '1px solid var(--border-light)',
                background: clearTarget === 'both' ? 'var(--debt-50)' : 'var(--bg-card)',
                cursor: 'pointer'
              }}>
                <input 
                  type="radio" 
                  name="clearTarget" 
                  checked={clearTarget === 'both'} 
                  onChange={() => setClearTarget('both')} 
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>Clear Local Storage & Supabase Cloud DB (Recommended)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Wipes both browser app cache and Supabase cloud tables for a clean slate.</div>
                </div>
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px',
                borderRadius: '10px',
                border: clearTarget === 'local' ? '2px solid var(--debt-600)' : '1px solid var(--border-light)',
                background: clearTarget === 'local' ? 'var(--debt-50)' : 'var(--bg-card)',
                cursor: 'pointer'
              }}>
                <input 
                  type="radio" 
                  name="clearTarget" 
                  checked={clearTarget === 'local'} 
                  onChange={() => setClearTarget('local')} 
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>Clear App Local Storage Only</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Clears browser cached data; Supabase Cloud DB tables remain unchanged.</div>
                </div>
              </label>

              {isSupabaseConfigured() && (
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px',
                  borderRadius: '10px',
                  border: clearTarget === 'supabase' ? '2px solid var(--debt-600)' : '1px solid var(--border-light)',
                  background: clearTarget === 'supabase' ? 'var(--debt-50)' : 'var(--bg-card)',
                  cursor: 'pointer'
                }}>
                  <input 
                    type="radio" 
                    name="clearTarget" 
                    checked={clearTarget === 'supabase'} 
                    onChange={() => setClearTarget('supabase')} 
                  />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>Clear Supabase Cloud DB Only</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Empties remote database tables on Supabase while keeping local state.</div>
                  </div>
                </label>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setShowClearStorageModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={handleExecuteClearStorage}
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: 'var(--debt-600)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: '10px'
                }}
              >
                {isLoading ? 'Clearing Storage...' : 'Confirm & Clear Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
