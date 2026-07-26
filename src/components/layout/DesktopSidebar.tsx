import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import type { ActiveTab } from '../../types';
import { 
  Menu, ChevronLeft, LayoutDashboard, Users, 
  BookOpen, BarChart3, Settings, Sparkles, Plus, Store,
  Sun, Moon, Wifi, WifiOff
} from 'lucide-react';

export const DesktopSidebar: React.FC<{ onOpenNewSale: () => void }> = ({ onOpenNewSale }) => {
  const { shop, activeTab, setActiveTab, theme, toggleTheme, isOnline, toggleNetworkStatus } = useAppStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ElementType; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'ledger', label: 'Ledger', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'ai', label: 'AI Assistant', icon: Sparkles, badge: 'PRO' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`desktop-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header & Hamburger Collapse Toggle */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-logo">
            {shop?.name ? shop.name.charAt(0) : 'K'}
          </div>
          {!isCollapsed && (
            <div className="brand-text">
              <span className="brand-title">Shop KhattaBook</span>
              <span className="brand-subtitle">Credora POS SaaS</span>
            </div>
          )}
        </div>

        <button 
          className="hamburger-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar Menu" : "Collapse Sidebar Menu"}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Quick Action Sale Button */}
      <div className="sidebar-action-container">
        <button className="sidebar-sale-btn" onClick={onOpenNewSale} title="Record New Sale">
          <Plus size={18} />
          {!isCollapsed && <span>+ New Sale</span>}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">{!isCollapsed ? 'MAIN MENU' : '•'}</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
            >
              <Icon size={20} className="nav-icon" />
              {!isCollapsed && <span className="nav-label">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile & Controls */}
      <div className="sidebar-footer">
        <div className="store-info-box" onClick={() => setActiveTab('settings')}>
          <div className="store-avatar">
            <Store size={16} />
          </div>
          {!isCollapsed && (
            <div className="store-details">
              <div className="store-name">{shop?.name || 'Sri Laxmi Traders'}</div>
              <div className="store-location">{shop?.village_town}, {shop?.district}</div>
            </div>
          )}
        </div>

        <div className="sidebar-controls">
          <button 
            className="control-btn network-btn"
            onClick={toggleNetworkStatus}
            title={isOnline ? "Online Sync Active" : "Offline Storage Mode"}
          >
            {isOnline ? <Wifi size={16} color="var(--khatta-600)" /> : <WifiOff size={16} color="var(--debt-600)" />}
            {!isCollapsed && <span>{isOnline ? 'Online' : 'Offline'}</span>}
          </button>

          <button 
            className="control-btn theme-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
};
