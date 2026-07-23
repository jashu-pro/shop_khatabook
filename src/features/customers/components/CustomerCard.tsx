import React from 'react';
import { Link } from 'react-router-dom';
import type { Customer } from '../types/customer.types';
import { User, Phone, MapPin, ChevronRight, BookOpen } from 'lucide-react';

interface CustomerCardProps {
  customer: Customer;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Mock outstanding credit (outstanding will be real in credit sales phase)
  const outstandingCredit = 0;

  return (
    <Link 
      to={`/customers/${customer.id}`} 
      style={styles.cardLink}
      className="glass-panel hover-grow animate-fade-in"
    >
      <div style={styles.cardHeader}>
        {customer.photo_url ? (
          <img src={customer.photo_url} alt={customer.name} style={styles.avatar} />
        ) : (
          <div style={styles.avatarPlaceholder}>
            <User size={20} style={{ color: 'var(--primary)' }} />
          </div>
        )}

        <div style={styles.customerMeta}>
          <h4 style={styles.name}>{customer.name}</h4>
          
          <div style={styles.subMeta}>
            {customer.phone ? (
              <span style={styles.metaItem}>
                <Phone size={12} />
                <span>{customer.phone}</span>
              </span>
            ) : (
              <span style={{ ...styles.metaItem, color: 'var(--text-muted)' }}>
                No phone number
              </span>
            )}

            {customer.village && (
              <span style={styles.metaItem}>
                <MapPin size={12} />
                <span>{customer.village}</span>
              </span>
            )}
          </div>
        </div>

        <ChevronRight size={18} style={styles.arrow} />
      </div>

      <div style={styles.divider} />

      <div style={styles.cardFooter}>
        <div style={styles.creditInfo}>
          <span style={styles.creditLabel}>Outstanding Credit</span>
          <span 
            style={{ 
              ...styles.creditValue, 
              color: outstandingCredit > 0 ? 'var(--danger)' : 'var(--text-muted)'
            }}
          >
            ₹{formatAmount(outstandingCredit)}
          </span>
        </div>

        <div style={styles.limitInfo}>
          <span style={styles.limitLabel}>Credit Limit</span>
          <span style={styles.limitValue}>
            ₹{formatAmount(customer.credit_limit)}
          </span>
        </div>
      </div>
    </Link>
  );
};

const styles = {
  cardLink: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    textDecoration: 'none',
    cursor: 'pointer',
    color: 'inherit',
    transition: 'all var(--transition-fast)',
  } as React.CSSProperties,
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    paddingRight: '20px',
  } as React.CSSProperties,
  avatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  avatarPlaceholder: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  customerMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflow: 'hidden',
  } as React.CSSProperties,
  name: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,
  subMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  } as React.CSSProperties,
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  arrow: {
    position: 'absolute',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-color)',
    margin: '12px 0',
  } as React.CSSProperties,
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  creditInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  } as React.CSSProperties,
  creditLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.02em',
  } as React.CSSProperties,
  creditValue: {
    fontSize: '0.9rem',
    fontWeight: '800',
  } as React.CSSProperties,
  limitInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  } as React.CSSProperties,
  limitLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.02em',
  } as React.CSSProperties,
  limitValue: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
};
