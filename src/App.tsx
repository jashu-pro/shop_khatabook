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
import { AuthModal } from './features/auth/AuthModal';
import { PinLockScreen } from './features/auth/PinLockScreen';
import { EditShopModal } from './features/settings/EditShopModal';
import { SplashScreen } from './components/common/SplashScreen';
import { isSupabaseConfigured, fetchCloudDataToLocal } from './services/supabase';

export function App() {
  const { activeTab, setCloudData, clearAllData, isAuthenticated, shop, isPinEnabled, isLocked, theme } = useAppStore();

  const [showSplash, setShowSplash] = useState(true);
  const [saleCustomerId, setSaleCustomerId] = useState<string | null>(null);
  const [paymentCustomerId, setPaymentCustomerId] = useState<string | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // Synchronize theme attribute on mount & theme change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial Boot Cloud & Local Sync
  useEffect(() => {
    const syncOnAppLoad = async () => {
      if (isSupabaseConfigured()) {
        const res = await fetchCloudDataToLocal();
        if (res.success && res.data) {
          if (res.isEmpty) {
            clearAllData();
          } else {
            setCloudData(res.data);
          }
        }
      }
    };
    syncOnAppLoad();
  }, [setCloudData, clearAllData]);

  const handleOpenNewSale = (cId?: string) => {
    setSaleCustomerId(cId || '');
  };

  const handleOpenReceivePayment = (cId?: string) => {
    setPaymentCustomerId(cId || '');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onOpenNewSale={handleOpenNewSale}
            onOpenReceivePayment={handleOpenReceivePayment}
            onOpenAddCustomer={() => setShowAddCustomerModal(true)}
          />
        );
      case 'customers':
        return (
          <CustomerView
            onOpenAddCustomer={() => setShowAddCustomerModal(true)}
            onOpenNewSale={handleOpenNewSale}
            onOpenReceivePayment={handleOpenReceivePayment}
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
        return (
          <DashboardView
            onOpenNewSale={handleOpenNewSale}
            onOpenReceivePayment={handleOpenReceivePayment}
            onOpenAddCustomer={() => setShowAddCustomerModal(true)}
          />
        );
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <div className="app-viewport">
        <DesktopSidebar onOpenNewSale={() => handleOpenNewSale()} />

        <div className="mobile-wrapper">
          <HeaderBar />

          <main className="main-content">
            {renderTabContent()}
          </main>

          <BottomTabBar onOpenNewSale={() => handleOpenNewSale()} />

          {saleCustomerId !== null && (
            <NewSaleModal
              initialCustomerId={saleCustomerId}
              onClose={() => setSaleCustomerId(null)}
            />
          )}
          {paymentCustomerId !== null && (
            <ReceivePaymentModal
              initialCustomerId={paymentCustomerId}
              onClose={() => setPaymentCustomerId(null)}
            />
          )}
          {showAddCustomerModal && (
            <AddCustomerModal
              onClose={() => setShowAddCustomerModal(false)}
            />
          )}
        </div>

        {!isAuthenticated && <AuthModal />}
        {isAuthenticated && !shop && <EditShopModal onClose={() => {}} />}
        {isAuthenticated && shop && isPinEnabled && isLocked && <PinLockScreen />}
      </div>
    </>
  );
}

export default App;
