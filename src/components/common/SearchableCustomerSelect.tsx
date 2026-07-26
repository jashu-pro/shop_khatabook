import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Search, MapPin, Check, ChevronDown } from 'lucide-react';

interface SearchableCustomerSelectProps {
  selectedCustomerId: string;
  onSelectCustomer: (customerId: string) => void;
  label?: string;
  placeholder?: string;
}

export const SearchableCustomerSelect: React.FC<SearchableCustomerSelectProps> = ({
  selectedCustomerId,
  onSelectCustomer,
  label = 'Select Customer *',
  placeholder = 'Search customer by name, village, mobile...'
}) => {
  const { customers, ledgerEntries } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const activeCustomers = customers.filter(c => !c.is_deleted);
  const selectedCustomer = activeCustomers.find(c => c.id === selectedCustomerId);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = activeCustomers.filter(c => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query) ||
      c.village.toLowerCase().includes(query) ||
      c.phone.includes(query)
    );
  });

  const getCustomerBalance = (customerId: string) => {
    const custLedger = ledgerEntries.filter(l => l.customer_id === customerId);
    return custLedger.length > 0 ? custLedger[custLedger.length - 1].running_balance : 0;
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '12px', fontWeight: 700, marginBottom: 4, display: 'block', color: 'var(--text-main)' }}>
          {label}
        </label>
      )}

      {/* Input Field / Trigger */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="input-field"
          placeholder={selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.village})` : placeholder}
          value={isOpen ? searchQuery : (selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.village}) — ${selectedCustomer.phone}` : searchQuery)}
          onFocus={() => {
            setIsOpen(true);
            setSearchQuery('');
          }}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          style={{
            paddingRight: '36px',
            fontWeight: 700,
            fontSize: '14px',
            background: 'var(--bg-card)',
            border: isOpen ? '2px solid var(--khatta-600)' : '1px solid var(--border-light)',
            cursor: 'pointer'
          }}
        />

        <div style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center'
        }}>
          {isOpen ? <Search size={18} color="var(--khatta-600)" /> : <ChevronDown size={18} />}
        </div>
      </div>

      {/* Floating Filtered Customer List Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          maxHeight: '260px',
          overflowY: 'auto',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1.5px solid var(--border-light)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 9999,
          padding: '6px'
        }}>
          {filteredCustomers.length === 0 ? (
            <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No customer found matching "{searchQuery}"
            </div>
          ) : (
            filteredCustomers.map(customer => {
              const balance = getCustomerBalance(customer.id);
              const isSelected = customer.id === selectedCustomerId;

              return (
                <div
                  key={customer.id}
                  onClick={() => {
                    onSelectCustomer(customer.id);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '12px',
                    background: isSelected ? 'var(--khatta-50)' : 'transparent',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--border-subtle)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {customer.photo_url ? (
                      <img
                        src={customer.photo_url}
                        alt={customer.name}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: '10px',
                          objectFit: 'cover',
                          border: '1px solid var(--border-light)',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 34, height: 34, borderRadius: '10px',
                        background: isSelected ? 'var(--khatta-600)' : '#f1f5f9',
                        color: isSelected ? 'white' : '#334155',
                        fontWeight: 800, fontSize: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {getInitials(customer.name)}
                      </div>
                    )}

                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)' }}>
                        {customer.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                        <MapPin size={11} color="var(--khatta-600)" />
                        {customer.village} • {customer.phone}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: balance > 0 ? 'var(--debt-600)' : 'var(--khatta-600)' }}>
                        ₹{balance.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                        {balance > 0 ? 'Owed' : 'Clear'}
                      </div>
                    </div>

                    {isSelected && <Check size={16} color="var(--khatta-600)" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
