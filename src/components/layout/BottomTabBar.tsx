import React from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { LayoutDashboard, Users, Plus, BookOpen, Settings } from 'lucide-react';

export const BottomTabBar: React.FC<{
  onOpenNewSale: () => void;
}> = ({ onOpenNewSale }) => {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav className="bottom-tab-bar">
      <button
        className={`tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </button>

      <button
        className={`tab-item ${activeTab === 'customers' ? 'active' : ''}`}
        onClick={() => setActiveTab('customers')}
      >
        <Users size={20} />
        <span>Customers</span>
      </button>

      <button
        className="fab-center"
        onClick={onOpenNewSale}
        title="Record New Credit Sale"
      >
        <Plus size={28} />
      </button>

      <button
        className={`tab-item ${activeTab === 'ledger' ? 'active' : ''}`}
        onClick={() => setActiveTab('ledger')}
      >
        <BookOpen size={20} />
        <span>Ledger</span>
      </button>

      <button
        className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveTab('settings')}
      >
        <Settings size={20} />
        <span>Settings</span>
      </button>
    </nav>
  );
};
