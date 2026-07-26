import { useState, useEffect } from 'react';
import { useAppStore } from './stores/useAppStore';
import { HeaderBar } from './components/layout/HeaderBar';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { DesktopSidebar } from './components/layout/DesktopSidebar';
import { DashboardView } from './features/dashboard/DashboardView';
import { CustomerView } from './features/customers/CustomerView';
import { LedgerView } from './features/ledger/LedgerView';
import { ReportsView } from './features/reports/ReportsView';
import { AIAssistantWidget } from './features/ai/AIAssistantWidget';
import { SettingsView } from './features/settings/SettingsView';
import { NewSaleModal } from './features/sales/NewSaleModal';
import { ReceivePaymentModal } from './features/payments/ReceivePaymentModal';
import { AddCustomerModal } from './features/customers/AddCustomerModal';
import { syncAllLocalDataToCloud } from './services/supabase';

export function App() {
  const { activeTab } = useAppStore();

  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [showReceivePaymentModal, setShowReceivePaymentModal] = useState(false);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  useEffect(() => {
    syncAllLocalDataToCloud();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenNewSale={() => setShowNewSaleModal(true)}
            onOpenReceivePayment={() => setShowReceivePaymentModal(true)}
            onOpenAddCustomer={() => setShowAddCustomerModal(true)}
          />
        );
      case 'customers':
        return (
          <CustomerView
            onOpenAddCustomer={() => setShowAddCustomerModal(true)}
            onOpenNewSale={() => setShowNewSaleModal(true)}
            onOpenReceivePayment={() => setShowReceivePaymentModal(true)}
          />
        );
      case 'ledger':
        return <LedgerView />;
      case 'reports':
        return <ReportsView />;
      case 'ai':
        return <AIAssistantWidget />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onOpenNewSale={() => setShowNewSaleModal(true)} onOpenReceivePayment={() => setShowReceivePaymentModal(true)} onOpenAddCustomer={() => setShowAddCustomerModal(true)} />;
    }
  };

  return (
    <div className="app-viewport">
      <DesktopSidebar onOpenNewSale={() => setShowNewSaleModal(true)} />

      <div className="mobile-wrapper">
        <HeaderBar />

        <main className="main-content">
          {renderTabContent()}
        </main>

        <BottomTabBar onOpenNewSale={() => setShowNewSaleModal(true)} />

        {showNewSaleModal && <NewSaleModal onClose={() => setShowNewSaleModal(false)} />}
        {showReceivePaymentModal && <ReceivePaymentModal onClose={() => setShowReceivePaymentModal(false)} />}
        {showAddCustomerModal && <AddCustomerModal onClose={() => setShowAddCustomerModal(false)} />}
      </div>
    </div>
  );
}

export default App;
