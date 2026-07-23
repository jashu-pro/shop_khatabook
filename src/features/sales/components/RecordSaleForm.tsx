import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  DollarSign, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Camera
} from 'lucide-react';
import { ImageUploader } from '@/features/shop/components/ImageUploader';
import { useCustomersQuery } from '@/features/customers/hooks/useCustomers';
import { useCustomerBalanceQuery } from '../hooks/useSales';
import { saleService } from '../services/sale.service';
import type { Customer } from '@/features/customers/types/customer.types';

interface RecordSaleFormProps {
  customerId?: string; // Preselected if opened from CustomerDetail
  shopId: string;
  onClose: () => void;
  onSave: (payload: {
    customer_id: string;
    total_amount: number;
    sale_date: string;
    notes: string | null;
    bill_photo_url: string | null;
    bill_photo_path: string | null;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export const RecordSaleForm: React.FC<RecordSaleFormProps> = ({
  customerId,
  shopId,
  onClose,
  onSave,
  isSubmitting,
}) => {
  // Wizard steps: 1 = Customer Select, 2 = Sale Info & Details, 3 = Summary & Limits Checks
  const [step, setStep] = useState(customerId ? 2 : 1);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().substring(0, 16)); // YYYY-MM-DDTHH:mm
  const [billUrl, setBillUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Queries
  const { data: customers = [] } = useCustomersQuery(shopId);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  // Balance query for credit limit checks
  const { data: balance } = useCustomerBalanceQuery(selectedCustomerId);
  const currentOutstanding = balance?.outstanding_credit || 0;
  const creditLimit = selectedCustomer?.credit_limit || 0;
  const newOutstanding = currentOutstanding + (Number(amount) || 0);
  const isLimitExceeded = newOutstanding > creditLimit;

  const [customerSearch, setCustomerSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone && c.phone.includes(customerSearch)) ||
    (c.village && c.village.toLowerCase().includes(customerSearch.toLowerCase()))
  );

  const formatAmount = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const handleNext = () => {
    setErrors({});
    if (step === 1) {
      if (!selectedCustomerId) {
        setErrors({ customer: 'Please select a customer first.' });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setErrors({ amount: 'Please enter a valid amount greater than zero.' });
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2 && !customerId) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 3) {
      handleNext();
      return;
    }

    try {
      let finalBillUrl = billUrl;
      let finalBillPath = null;

      if (billUrl && billUrl.startsWith('data:image')) {
        const timestamp = Date.now();
        const uploadResult = await saleService.uploadBillPhoto(
          shopId,
          `bill_${timestamp}.jpg`,
          billUrl
        );
        if (uploadResult) {
          finalBillUrl = uploadResult.url;
          finalBillPath = uploadResult.path;
        }
      }

      await onSave({
        customer_id: selectedCustomerId,
        total_amount: Number(amount),
        sale_date: new Date(saleDate).toISOString(),
        notes: notes.trim() || null,
        bill_photo_url: finalBillUrl || null,
        bill_photo_path: finalBillPath,
      });
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to save credit sale.' });
    }
  };

  return (
    <div style={styles.backdrop} className="animate-fade-in">
      <div style={styles.modal} className="glass-panel animate-slide-up">
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>Record Credit Sale</h3>
          <button onClick={onClose} style={styles.closeBtn} disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>

        <div style={styles.divider} />

        {/* Stepper Dots */}
        <div style={styles.stepperContainer}>
          {!customerId && (
            <div style={styles.stepIndicator}>
              <div style={{ ...styles.stepDot, backgroundColor: step >= 1 ? 'var(--primary)' : 'var(--border-color)' }} />
              <div style={{ ...styles.stepLine, backgroundColor: step >= 2 ? 'var(--primary)' : 'var(--border-color)' }} />
              <div style={{ ...styles.stepDot, backgroundColor: step >= 2 ? 'var(--primary)' : 'var(--border-color)' }} />
              <div style={{ ...styles.stepLine, backgroundColor: step >= 3 ? 'var(--primary)' : 'var(--border-color)' }} />
              <div style={{ ...styles.stepDot, backgroundColor: step >= 3 ? 'var(--primary)' : 'var(--border-color)' }} />
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.scrollArea}>
            {errors.form && (
              <div style={styles.errorAlert}>
                <AlertTriangle size={16} />
                <span>{errors.form}</span>
              </div>
            )}

            {/* STEP 1: CUSTOMER SELECT */}
            {step === 1 && !customerId && (
              <div style={styles.stepContent} className="animate-fade-in">
                <label className="input-label">Select Customer Account *</label>
                <div style={styles.searchWrapper}>
                  <div style={styles.inputWrapper}>
                    <User size={16} style={styles.inputIcon} />
                    <input
                      type="text"
                      placeholder="Search customer by name or village..."
                      className="input-field"
                      style={{ paddingLeft: '40px' }}
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                    />
                  </div>

                  {isDropdownOpen && (
                    <div style={styles.dropdown} className="glass-panel">
                      {filteredCustomers.length === 0 ? (
                        <div style={styles.noResults}>No customers found</div>
                      ) : (
                        filteredCustomers.map((c) => (
                          <div
                            key={c.id}
                            style={{
                              ...styles.dropdownItem,
                              backgroundColor: selectedCustomerId === c.id ? 'var(--bg-tertiary)' : 'transparent',
                            }}
                            onClick={() => {
                              setSelectedCustomerId(c.id);
                              setCustomerSearch(c.name);
                              setIsDropdownOpen(false);
                            }}
                          >
                            <span style={styles.dropdownItemName}>{c.name}</span>
                            <span style={styles.dropdownItemSub}>
                              {c.village ? `${c.village}` : ''} {c.phone ? `· ${c.phone}` : ''}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.customer && <span className="input-error-msg">{errors.customer}</span>}
              </div>
            )}

            {/* STEP 2: SALE INFO */}
            {step === 2 && (
              <div style={styles.stepContent} className="animate-fade-in">
                {selectedCustomer && (
                  <div style={styles.customerSummaryBox}>
                    <div style={styles.customerSummaryAvatar}>
                      {selectedCustomer.photo_url ? (
                        <img src={selectedCustomer.photo_url} alt={selectedCustomer.name} style={styles.smallAvatar} />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <div style={styles.customerSummaryText}>
                      <span style={styles.customerSummaryName}>{selectedCustomer.name}</span>
                      <span style={styles.customerSummaryLimit}>Credit Limit: ₹{formatAmount(creditLimit)}</span>
                    </div>
                  </div>
                )}

                {/* Amount */}
                <div className="input-group">
                  <label className="input-label" htmlFor="sale-amount">Sale Amount (₹) *</label>
                  <div style={styles.inputWrapper}>
                    <DollarSign size={16} style={styles.inputIcon} />
                    <input
                      id="sale-amount"
                      type="number"
                      placeholder="Enter sale total amount"
                      className="input-field"
                      style={{ paddingLeft: '40px' }}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0.01"
                      step="any"
                      required
                    />
                  </div>
                  {errors.amount && <span className="input-error-msg">{errors.amount}</span>}
                </div>

                {/* Date */}
                <div className="input-group">
                  <label className="input-label" htmlFor="sale-date">Sale Date & Time *</label>
                  <div style={styles.inputWrapper}>
                    <Calendar size={16} style={styles.inputIcon} />
                    <input
                      id="sale-date"
                      type="datetime-local"
                      className="input-field"
                      style={{ paddingLeft: '40px' }}
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Bill Photo */}
                <div style={{ marginTop: '6px' }}>
                  <ImageUploader
                    id="bill_photo"
                    value={billUrl}
                    onChange={(base64) => setBillUrl(base64)}
                    label="Attach Invoice/Receipt Photo"
                    placeholderText="Scan or take bill photo"
                    shape="rect"
                  />
                </div>

                {/* Notes */}
                <div className="input-group" style={{ marginTop: '10px' }}>
                  <label className="input-label" htmlFor="sale-notes">Purchase Items Description</label>
                  <div style={styles.inputWrapper}>
                    <FileText size={16} style={{ ...styles.inputIcon, top: '14px' }} />
                    <textarea
                      id="sale-notes"
                      placeholder="e.g. 5kg Rice, 1L Sunflower Oil, 2 soap bars"
                      className="input-field"
                      style={{ paddingLeft: '40px', minHeight: '60px', resize: 'vertical', paddingTop: '8px' }}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SUMMARY & SAFETY CHECKS */}
            {step === 3 && selectedCustomer && (
              <div style={styles.stepContent} className="animate-fade-in">
                <h4 style={styles.sectionHeading}>Transaction Summary</h4>
                
                <div style={styles.summaryList}>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryItemLabel}>Customer:</span>
                    <span style={styles.summaryItemVal}>{selectedCustomer.name}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryItemLabel}>Sale Amount:</span>
                    <span style={{ ...styles.summaryItemVal, fontWeight: '800' }}>₹{formatAmount(Number(amount))}</span>
                  </div>
                  <div style={styles.summaryItem}>
                    <span style={styles.summaryItemLabel}>Sale Reference:</span>
                    <span style={styles.summaryItemVal}>Auto-generated</span>
                  </div>
                  {notes && (
                    <div style={styles.summaryItem}>
                      <span style={styles.summaryItemLabel}>Items Notes:</span>
                      <span style={styles.summaryItemVal}>{notes}</span>
                    </div>
                  )}
                </div>

                <div style={{ ...styles.divider, margin: '12px 0' }} />

                {/* Credit Limit Checking Box */}
                {isLimitExceeded ? (
                  <div style={styles.dangerAlertBox}>
                    <div style={styles.alertHeaderRow}>
                      <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
                      <span style={styles.dangerAlertTitle}>Credit Limit Exceeded</span>
                    </div>
                    <div style={styles.alertDetailsGrid}>
                      <div style={styles.alertDetailCell}>
                        <span style={styles.alertDetailLabel}>Current Outstanding</span>
                        <span style={styles.alertDetailVal}>₹{formatAmount(currentOutstanding)}</span>
                      </div>
                      <div style={styles.alertDetailCell}>
                        <span style={styles.alertDetailLabel}>Allowed Credit Limit</span>
                        <span style={styles.alertDetailVal}>₹{formatAmount(creditLimit)}</span>
                      </div>
                      <div style={{ ...styles.alertDetailCell, gridColumn: 'span 2', borderTop: '1px solid rgba(239, 68, 68, 0.1)', paddingTop: '6px', marginTop: '4px' }}>
                        <span style={styles.alertDetailLabel}>Outstanding after Sale</span>
                        <span style={{ ...styles.alertDetailVal, color: 'var(--danger)', fontSize: '1.05rem', fontWeight: '800' }}>₹{formatAmount(newOutstanding)}</span>
                      </div>
                    </div>
                    <p style={styles.alertDescription}>
                      Recording this credit transaction will exceed the customer limit setup for this account. Proceed anyway?
                    </p>
                  </div>
                ) : (
                  <div style={styles.safeAlertBox}>
                    <div style={styles.alertHeaderRow}>
                      <Check size={18} style={{ color: 'var(--success)' }} />
                      <span style={styles.safeAlertTitle}>Within Credit Limit</span>
                    </div>
                    <div style={styles.alertDetailsGrid}>
                      <div style={styles.alertDetailCell}>
                        <span style={styles.alertDetailLabel}>Current Outstanding</span>
                        <span style={styles.alertDetailVal}>₹{formatAmount(currentOutstanding)}</span>
                      </div>
                      <div style={styles.alertDetailCell}>
                        <span style={styles.alertDetailLabel}>Allowed Credit Limit</span>
                        <span style={styles.alertDetailVal}>₹{formatAmount(creditLimit)}</span>
                      </div>
                      <div style={{ ...styles.alertDetailCell, gridColumn: 'span 2', borderTop: '1px solid rgba(16, 185, 129, 0.1)', paddingTop: '6px', marginTop: '4px' }}>
                        <span style={styles.alertDetailLabel}>Outstanding after Sale</span>
                        <span style={{ ...styles.alertDetailVal, color: 'var(--success)', fontWeight: '800' }}>₹{formatAmount(newOutstanding)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Controls */}
          <div style={styles.footer}>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-secondary"
                style={{ marginRight: 'auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                disabled={isSubmitting}
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={styles.actionBtn}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary"
                style={styles.actionBtn}
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn"
                style={{
                  ...styles.actionBtn,
                  backgroundColor: isLimitExceeded ? 'var(--danger)' : 'var(--primary)',
                  color: '#fff',
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : isLimitExceeded ? (
                  <span>Proceed Anyway</span>
                ) : (
                  <span>Record Sale</span>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '20px',
  } as React.CSSProperties,
  modal: {
    maxWidth: '460px',
    width: '100%',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '90vh',
    boxShadow: 'var(--shadow-lg)',
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
  } as React.CSSProperties,
  title: {
    fontSize: '1.05rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  closeBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    padding: '4px',
    display: 'flex',
  } as React.CSSProperties,
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-color)',
  } as React.CSSProperties,
  stepperContainer: {
    padding: '8px 20px',
    display: 'flex',
    justifyContent: 'center',
  } as React.CSSProperties,
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    width: '140px',
  } as React.CSSProperties,
  stepDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  stepLine: {
    flexGrow: 1,
    height: '2px',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  } as React.CSSProperties,
  scrollArea: {
    padding: '12px 20px 20px 20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    flexGrow: 1,
  } as React.CSSProperties,
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  } as React.CSSProperties,
  // Search
  searchWrapper: {
    position: 'relative',
    width: '100%',
  } as React.CSSProperties,
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  } as React.CSSProperties,
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-muted)',
    pointerEvents: 'none',
  } as React.CSSProperties,
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    maxHeight: '180px',
    overflowY: 'auto',
    zIndex: 10,
    marginTop: '4px',
  } as React.CSSProperties,
  dropdownItem: {
    padding: '10px 14px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    borderBottom: '1px solid var(--border-color)',
    transition: 'background-color var(--transition-fast)',
  } as React.CSSProperties,
  dropdownItemName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  dropdownItemSub: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  noResults: {
    padding: '16px',
    textAlign: 'center',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  // Customer Summary Banner
  customerSummaryBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '8px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  customerSummaryAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  smallAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    objectFit: 'cover',
  } as React.CSSProperties,
  customerSummaryText: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  customerSummaryName: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  customerSummaryLimit: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  // Step 3 Summaries
  sectionHeading: {
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    letterSpacing: '0.04em',
  } as React.CSSProperties,
  summaryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '12px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
  } as React.CSSProperties,
  summaryItemLabel: {
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  summaryItemVal: {
    color: 'var(--text-primary)',
    fontWeight: '600',
  } as React.CSSProperties,
  // Alerts Boxes
  dangerAlertBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: 'var(--danger-light)',
    border: '1px solid var(--danger)',
    borderRadius: 'var(--radius-sm)',
    padding: '14px',
  } as React.CSSProperties,
  alertHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  dangerAlertTitle: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  alertDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: '10px',
    borderRadius: 'var(--radius-sm)',
  } as React.CSSProperties,
  alertDetailCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  } as React.CSSProperties,
  alertDetailLabel: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
  } as React.CSSProperties,
  alertDetailVal: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  alertDescription: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  } as React.CSSProperties,
  safeAlertBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: 'var(--success-light)',
    border: '1px solid var(--success)',
    borderRadius: 'var(--radius-sm)',
    padding: '14px',
  } as React.CSSProperties,
  safeAlertTitle: {
    fontSize: '0.85rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--danger-light)',
    border: '1px solid var(--danger)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '0.8rem',
  } as React.CSSProperties,
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 20px',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-tertiary)',
    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
  } as React.CSSProperties,
  actionBtn: {
    padding: '10px 20px',
    fontSize: '0.85rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  } as React.CSSProperties,
};
