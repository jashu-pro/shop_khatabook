import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { UserRole, ShopUser } from '../../types';
import { 
  UserPlus, Moon, Sun, Database, RefreshCw, UploadCloud, Trash2, 
  CheckCircle2, AlertTriangle, QrCode, Lock, Key, LogOut, Edit3, Shield, UserX 
} from 'lucide-react';
import { 
  isSupabaseConfigured, 
  fetchCloudDataToLocal, 
  syncAllLocalDataToCloud, 
  clearAllSupabaseData
} from '../../services/supabase';
import { EditShopModal } from './EditShopModal';
import { UpiQrPosterModal } from './UpiQrPosterModal';

export const SettingsView: React.FC = () => {
  const { 
    shop, 
    shopUsers, 
    addShopUser, 
    removeShopUser,
    theme, 
    toggleTheme, 
    user,
    logout,
    isPinEnabled,
    securityPin,
    setPinLock,
    lockApp,
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

  // Modals for Phase 1 & 2
  const [showEditShopModal, setShowEditShopModal] = useState(false);
  const [showQrPosterModal, setShowQrPosterModal] = useState(false);
  const [showPinConfigModal, setShowPinConfigModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState(securityPin || '1234');

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

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length === 4) {
      setPinLock(true, newPinInput);
      setShowPinConfigModal(false);
      setSyncStatusMsg({ type: 'success', text: `Security PIN successfully set to ${newPinInput}` });
    }
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
    <div style={{ paddingBottom: '30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Settings & Management</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phase 1 & Phase 2 • Auth, Security PIN, Store Details & Roles</p>
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

      {/* Phase 2: Shop Details Card */}
      <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: '14px', background: 'var(--khatta-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '22px' }}>
              {shop?.name.charAt(0)}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontSize: '17px' }}>{shop?.name}</h3>
                <span style={{ background: 'var(--khatta-50)', color: 'var(--khatta-700)', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700 }}>
                  Registered
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 2 }}>{shop?.category} • GSTIN: {shop?.gstin || 'N/A'}</p>
            </div>
          </div>

          <button className="btn-secondary" onClick={() => setShowEditShopModal(true)} style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}>
            <Edit3 size={14} />
            <span>Edit Store Details</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px', color: 'var(--text-main)', background: 'var(--border-subtle)', padding: '12px', borderRadius: '12px' }}>
          <div><strong>Address:</strong> {shop?.door_no}, {shop?.street}, {shop?.village_town}, {shop?.district}, {shop?.state} - {shop?.pincode}</div>
          <div><strong>UPI ID:</strong> {shop?.upi_id}</div>
          <div><strong>Owner Contact:</strong> {user?.full_name} ({user?.phone})</div>
        </div>

        {/* UPI QR Poster Quick Button */}
        <button
          onClick={() => setShowQrPosterModal(true)}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '10px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #059669, #047857)',
            color: 'white',
            border: 'none',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer'
          }}
        >
          <QrCode size={16} />
          <span>View & Print Official Shop UPI QR Poster</span>
        </button>
      </div>

      {/* Phase 1: Security PIN & App Lock Section */}
      <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: isPinEnabled ? 'var(--khatta-100)' : 'var(--border-subtle)', color: isPinEnabled ? 'var(--khatta-700)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px' }}>App Security & 4-Digit PIN Lock</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {isPinEnabled ? `PIN Protection Active (PIN: ${securityPin})` : 'PIN Lock is currently Disabled'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn-secondary"
              onClick={() => {
                setPinLock(!isPinEnabled);
                setSyncStatusMsg({ type: 'success', text: !isPinEnabled ? 'PIN Lock Security Enabled!' : 'PIN Lock Security Disabled.' });
              }}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }}
            >
              {isPinEnabled ? 'Disable PIN' : 'Enable PIN'}
            </button>

            {isPinEnabled && (
              <button
                className="btn-primary"
                onClick={lockApp}
                style={{ width: 'auto', padding: '6px 12px', fontSize: '12px', background: 'var(--debt-600)' }}
              >
                <Lock size={14} />
                <span>Lock App Now</span>
              </button>
            )}
          </div>
        </div>

        {isPinEnabled && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--border-subtle)', padding: '10px 12px', borderRadius: '10px', fontSize: '12px' }}>
            <span>Security PIN: <strong>{securityPin}</strong></span>
            <button
              onClick={() => setShowPinConfigModal(true)}
              style={{ border: 'none', background: 'none', color: 'var(--khatta-600)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <Key size={13} />
              <span>Change PIN</span>
            </button>
          </div>
        )}
      </div>

      {/* Phase 2: Staff & Multi-User Roles */}
      <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
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
          {shopUsers.map((su: ShopUser) => {
            const roleColor = 
              su.role === 'owner' ? { bg: 'var(--khatta-50)', text: 'var(--khatta-700)' } :
              su.role === 'manager' ? { bg: '#e0f2fe', text: '#0369a1' } :
              su.role === 'cashier' ? { bg: '#fef3c7', text: '#b45309' } :
              { bg: '#f3e8ff', text: '#6b21a8' };

            return (
              <div key={su.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: 'var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{su.user_name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{su.user_phone}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ background: roleColor.bg, color: roleColor.text, padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: 800, textTransform: 'capitalize' }}>
                    {su.role}
                  </span>
                  {su.role !== 'owner' && (
                    <button
                      onClick={() => removeShopUser(su.id)}
                      title="Remove Staff"
                      style={{ border: 'none', background: 'none', color: 'var(--debt-600)', cursor: 'pointer' }}
                    >
                      <UserX size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storage & Database Control Card */}
      <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
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

      {/* Session & Theme Section */}
      <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '14px' }}>Appearance Theme</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Switch between Dark & Light Mode</p>
        </div>
        <button className="btn-secondary" onClick={toggleTheme} style={{ width: 'auto', padding: '8px 14px', borderRadius: '10px' }}>
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          <span style={{ marginLeft: 6 }}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>
      </div>

      {/* Logout Action Card */}
      <div style={{ background: 'var(--bg-card)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '14px', color: 'var(--debt-600)' }}>Account Session</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Logged in as {user?.full_name} ({user?.phone})</p>
        </div>
        <button
          onClick={logout}
          style={{
            background: 'var(--debt-50)',
            color: 'var(--debt-600)',
            border: '1px solid var(--debt-200)',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <LogOut size={15} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Modals */}
      {showEditShopModal && <EditShopModal onClose={() => setShowEditShopModal(false)} />}
      {showQrPosterModal && <UpiQrPosterModal onClose={() => setShowQrPosterModal(false)} />}

      {/* Change PIN Modal */}
      {showPinConfigModal && (
        <div className="modal-overlay" onClick={() => setShowPinConfigModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2>Change 4-Digit Security PIN</h2>
              <button onClick={() => setShowPinConfigModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSavePin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>New 4-Digit Security PIN *</label>
                <input
                  type="text"
                  maxLength={4}
                  className="input-field"
                  style={{ textAlign: 'center', fontSize: '22px', fontWeight: 800, letterSpacing: '4px' }}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                Save Security PIN
              </button>
            </form>
          </div>
        </div>
      )}

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
