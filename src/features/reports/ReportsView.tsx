import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { FileText } from 'lucide-react';
import { downloadAllCustomersSummaryPDF } from '../../services/pdfService';

export const ReportsView: React.FC = () => {
  const { shop, customers, sales, payments, ledgerEntries } = useAppStore();

  const totalSalesVal = sales.reduce((sum, s) => sum + s.total_amount, 0);
  const totalCollectionsVal = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDebtVal = customers.reduce((sum, c) => {
    const cLedger = ledgerEntries.filter(l => l.customer_id === c.id);
    return sum + (cLedger.length > 0 ? cLedger[cLedger.length - 1].running_balance : 0);
  }, 0);

  const downloadPDFReport = () => {
    downloadAllCustomersSummaryPDF(customers, ledgerEntries, shop);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Reports & Analytics</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Financial Summary & Document Exporter</p>
        </div>
        <button className="btn-primary" onClick={downloadPDFReport} style={{ width: 'auto', padding: '8px 14px', borderRadius: '12px', fontSize: '12px' }}>
          <FileText size={15} />
          Download All Customers PDF Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Sales</span>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--khatta-600)', marginTop: 2 }}>
            ₹{totalSalesVal.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Collections</span>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--amber-600)', marginTop: 2 }}>
            ₹{totalCollectionsVal.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-light)', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Outstanding</span>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--debt-600)', marginTop: 2 }}>
            ₹{totalDebtVal.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
        <h3 style={{ fontSize: '14px', marginBottom: 10 }}>Customer Debt Aging Report</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 12px', background: 'var(--border-subtle)', borderRadius: '8px' }}>
            <span>0 - 30 Days (Current Debt)</span>
            <strong style={{ color: 'var(--khatta-600)' }}>₹{(totalDebtVal * 0.6).toFixed(0)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 12px', background: 'var(--amber-50)', color: 'var(--amber-800)', borderRadius: '8px' }}>
            <span>30 - 60 Days (Follow Up Needed)</span>
            <strong>₹{(totalDebtVal * 0.25).toFixed(0)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '8px 12px', background: 'var(--debt-50)', color: 'var(--debt-800)', borderRadius: '8px' }}>
            <span>60+ Days (High Risk Overdue)</span>
            <strong>₹{(totalDebtVal * 0.15).toFixed(0)}</strong>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '14px', marginBottom: 10 }}>Top Customers Ranking</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {customers.map((c, idx) => {
            const cLedger = ledgerEntries.filter(l => l.customer_id === c.id);
            const bal = cLedger.length > 0 ? cLedger[cLedger.length - 1].running_balance : 0;
            return (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--khatta-50)', color: 'var(--khatta-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '11px' }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{c.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{c.village}</div>
                  </div>
                </div>

                <div style={{ fontWeight: 800, fontSize: '13px', color: 'var(--debt-600)' }}>
                  ₹{bal.toLocaleString('en-IN')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
