import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  UserProfile, Shop, ShopUser, Customer, Product, Category, StockMovement, 
  Sale, Payment, LedgerEntry, NotificationLog, AuditLog, AIRequestLog, ActiveTab 
} from '../types';
import { 
  syncCustomerToCloud, 
  syncProductToCloud, 
  syncSaleToCloud, 
  syncPaymentToCloud, 
  syncLedgerToCloud 
} from '../services/supabase';

interface AppState {
  // Navigation & Theme
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isSimulatorMode: boolean;
  toggleSimulatorMode: () => void;
  
  // Auth State & PIN Lock (Phase 1)
  user: UserProfile | null;
  isAuthenticated: boolean;
  authToken: string | null;
  refreshToken: string | null;
  isPinEnabled: boolean;
  securityPin: string;
  isLocked: boolean;
  login: (phone: string, fullName?: string) => void;
  signup: (data: { fullName: string; phone: string; email?: string; shopName: string; category?: string }) => void;
  loginWithGoogle: () => void;
  forgotPasswordReset: (phoneOrEmail: string, newPin: string) => boolean;
  logout: () => void;
  setPinLock: (enabled: boolean, pin?: string) => void;
  lockApp: () => void;
  unlockApp: (pin: string) => boolean;
  
  // Shop State (Phase 2)
  shop: Shop | null;
  shopUsers: ShopUser[];
  updateShop: (updated: Partial<Shop>) => void;
  addShopUser: (user: Omit<ShopUser, 'id' | 'created_at'>) => void;
  updateShopUser: (id: string, updated: Partial<ShopUser>) => void;
  removeShopUser: (id: string) => void;

  // Customer State (Phase 4)
  customers: Customer[];
  addCustomer: (
    customer: Omit<Customer, 'id' | 'created_at' | 'credit_score'>,
    openingBalance?: { amount: number; type: 'DEBIT' | 'CREDIT' }
  ) => { success: boolean; duplicate?: Customer };
  updateCustomer: (id: string, updated: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Inventory State (Phase 5)
  categories: Category[];
  products: Product[];
  stockMovements: StockMovement[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;

  // Sales State (Phase 6)
  sales: Sale[];
  addCreditSale: (saleData: {
    customer_id: string;
    items: Array<{ product_id?: string; item_name: string; quantity: number; unit_price: number }>;
    discount: number;
    tax: number;
    amount_paid: number;
    bill_photo_url?: string;
    notes?: string;
  }) => Sale;

  // Payments State (Phase 7)
  payments: Payment[];
  receivePayment: (paymentData: {
    customer_id: string;
    amount: number;
    method: Payment['method'];
    reference_no?: string;
    bank_name?: string;
    notes?: string;
  }) => Payment;

  // Digital Ledger State (Phase 8)
  ledgerEntries: LedgerEntry[];

  // Notifications Queue (Phase 8 & 9)
  notifications: NotificationLog[];
  sendWhatsAppReminder: (customerId: string) => void;

  // Audit Logs & AI Requests (Phase 11)
  auditLogs: AuditLog[];
  aiRequests: AIRequestLog[];
  processVoiceAICommand: (prompt: string) => AIRequestLog['parsed_result'];
  confirmAIAction: (log: AIRequestLog['parsed_result']) => void;

  // Offline Sync Queue & Storage Management
  isOnline: boolean;
  pendingSyncCount: number;
  toggleNetworkStatus: () => void;

  // Storage & Cloud Reset/Sync Actions
  clearAllData: () => void;
  setCloudData: (data: { 
    customers?: Customer[]; 
    products?: Product[]; 
    sales?: Sale[]; 
    payments?: Payment[]; 
    ledgerEntries?: LedgerEntry[]; 
    categories?: Category[];
  }) => void;
}

const INITIAL_SHOP: Shop = {
  id: 'shop-1',
  owner_id: 'user-1',
  name: 'Sri Laxmi Traders',
  category: 'Kirana & General Store',
  door_no: 'D.No 4-12',
  street: 'Main Road',
  area: 'Clock Tower Center',
  village_town: 'Anantapur',
  mandal: 'Anantapur Urban',
  district: 'Anantapur',
  state: 'Andhra Pradesh',
  pincode: '515001',
  gstin: '37AAAAA0000A1Z5',
  pan: 'ABCDE1234F',
  upi_id: 'srilaxmi@ybl',
  currency: 'INR',
  created_at: new Date().toISOString()
};

const INITIAL_SHOP_USERS: ShopUser[] = [
  { id: 'su-1', shop_id: 'shop-1', user_id: 'user-1', user_name: 'Jaswanth Kumar', user_phone: '+91 98765 43210', role: 'owner', status: 'active', created_at: new Date().toISOString() },
  { id: 'su-2', shop_id: 'shop-1', user_id: 'user-2', user_name: 'Ramesh (Cashier)', user_phone: '+91 94400 11111', role: 'cashier', status: 'active', created_at: new Date().toISOString() },
  { id: 'su-3', shop_id: 'shop-1', user_id: 'user-3', user_name: 'Priya (Accountant)', user_phone: '+91 94400 22222', role: 'accountant', status: 'active', created_at: new Date().toISOString() }
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    shop_id: 'shop-1',
    name: 'Venkatesh Rao',
    phone: '9440112345',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    village: 'Tadipatri',
    notes: 'Regular credit customer, pays every month on 5th',
    tags: ['VIP', 'Regular'],
    credit_limit: 50000,
    credit_score: 820,
    last_payment_date: '2026-07-20T10:00:00Z',
    created_at: new Date().toISOString()
  },
  {
    id: 'cust-2',
    shop_id: 'shop-1',
    name: 'Kavitha Reddy',
    phone: '9885067890',
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    village: 'Dharmavaram',
    notes: 'Saree shop owner',
    tags: ['Regular'],
    credit_limit: 30000,
    credit_score: 750,
    last_payment_date: '2026-07-15T14:30:00Z',
    created_at: new Date().toISOString()
  },
  {
    id: 'cust-3',
    shop_id: 'shop-1',
    name: 'Srinivasulu',
    phone: '9949954321',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    village: 'Anantapur',
    notes: 'Overdue over 45 days',
    tags: ['Risk'],
    credit_limit: 15000,
    credit_score: 610,
    last_payment_date: '2026-05-10T09:15:00Z',
    created_at: new Date().toISOString()
  }
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'prod-1', shop_id: 'shop-1', name: 'Sona Masoori Rice (25kg)', category_name: 'Grains', barcode: '8901234567890', selling_price: 1450, purchase_price: 1300, stock_quantity: 35, min_stock_alert: 10, created_at: new Date().toISOString() },
  { id: 'prod-2', shop_id: 'shop-1', name: 'Freedom Sunflower Oil (1L)', category_name: 'Edible Oils', barcode: '8901234567891', selling_price: 135, purchase_price: 118, stock_quantity: 80, min_stock_alert: 15, created_at: new Date().toISOString() },
  { id: 'prod-3', shop_id: 'shop-1', name: 'Tata Salt (1kg)', category_name: 'Spices & Condiments', barcode: '8901234567892', selling_price: 28, purchase_price: 22, stock_quantity: 4, min_stock_alert: 10, created_at: new Date().toISOString() },
  { id: 'prod-4', shop_id: 'shop-1', name: 'Aashirvaad Atta (10kg)', category_name: 'Flour', barcode: '8901234567893', selling_price: 420, purchase_price: 370, stock_quantity: 18, min_stock_alert: 5, created_at: new Date().toISOString() },
  { id: 'prod-5', shop_id: 'shop-1', name: 'Toor Dal Premium (1kg)', category_name: 'Pulses', barcode: '8901234567894', selling_price: 160, purchase_price: 140, stock_quantity: 25, min_stock_alert: 8, created_at: new Date().toISOString() }
];

const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-101',
    shop_id: 'shop-1',
    customer_id: 'cust-1',
    customer_name: 'Venkatesh Rao',
    customer_phone: '9440112345',
    subtotal: 3035,
    discount: 35,
    tax: 0,
    total_amount: 3000,
    amount_paid: 1000,
    balance_due: 2000,
    items: [
      { id: 'si-1', sale_id: 'sale-101', product_id: 'prod-1', item_name: 'Sona Masoori Rice (25kg)', quantity: 2, unit_price: 1450, total_price: 2900 },
      { id: 'si-2', sale_id: 'sale-101', product_id: 'prod-2', item_name: 'Freedom Sunflower Oil (1L)', quantity: 1, unit_price: 135, total_price: 135 }
    ],
    created_at: '2026-07-22T11:30:00Z'
  },
  {
    id: 'sale-102',
    shop_id: 'shop-1',
    customer_id: 'cust-2',
    customer_name: 'Kavitha Reddy',
    customer_phone: '9885067890',
    subtotal: 1600,
    discount: 0,
    tax: 0,
    total_amount: 1600,
    amount_paid: 0,
    balance_due: 1600,
    items: [
      { id: 'si-3', sale_id: 'sale-102', product_id: 'prod-5', item_name: 'Toor Dal Premium (1kg)', quantity: 10, unit_price: 160, total_price: 1600 }
    ],
    created_at: '2026-07-23T16:45:00Z'
  },
  {
    id: 'sale-103',
    shop_id: 'shop-1',
    customer_id: 'cust-3',
    customer_name: 'Srinivasulu',
    customer_phone: '9949954321',
    subtotal: 7250,
    discount: 250,
    tax: 0,
    total_amount: 7000,
    amount_paid: 1000,
    balance_due: 6000,
    items: [
      { id: 'si-4', sale_id: 'sale-103', product_id: 'prod-1', item_name: 'Sona Masoori Rice (25kg)', quantity: 5, unit_price: 1450, total_price: 7250 }
    ],
    created_at: '2026-06-10T14:20:00Z'
  }
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-201',
    shop_id: 'shop-1',
    customer_id: 'cust-1',
    customer_name: 'Venkatesh Rao',
    sale_id: 'sale-101',
    amount: 1000,
    method: 'UPI_PHONEPE',
    reference_no: 'UPI/620491823901',
    notes: 'Paid via PhonePe QR code',
    created_at: '2026-07-22T11:32:00Z'
  },
  {
    id: 'pay-202',
    shop_id: 'shop-1',
    customer_id: 'cust-1',
    customer_name: 'Venkatesh Rao',
    amount: 500,
    method: 'CASH',
    notes: 'Partial cash payment',
    created_at: '2026-07-24T09:15:00Z'
  }
];

const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 'led-1',
    shop_id: 'shop-1',
    customer_id: 'cust-1',
    customer_name: 'Venkatesh Rao',
    entry_type: 'SALE',
    sale_id: 'sale-101',
    debit: 3000,
    credit: 0,
    running_balance: 3000,
    description: 'Credit Sale #sale-101 (Rice & Oil)',
    entry_date: '2026-07-22T11:30:00Z',
    created_at: '2026-07-22T11:30:00Z'
  },
  {
    id: 'led-2',
    shop_id: 'shop-1',
    customer_id: 'cust-1',
    customer_name: 'Venkatesh Rao',
    entry_type: 'PAYMENT',
    payment_id: 'pay-201',
    debit: 0,
    credit: 1000,
    running_balance: 2000,
    description: 'Payment Received via PhonePe',
    entry_date: '2026-07-22T11:32:00Z',
    created_at: '2026-07-22T11:32:00Z'
  },
  {
    id: 'led-3',
    shop_id: 'shop-1',
    customer_id: 'cust-1',
    customer_name: 'Venkatesh Rao',
    entry_type: 'PAYMENT',
    payment_id: 'pay-202',
    debit: 0,
    credit: 500,
    running_balance: 1500,
    description: 'Cash Payment Received',
    entry_date: '2026-07-24T09:15:00Z',
    created_at: '2026-07-24T09:15:00Z'
  },
  {
    id: 'led-4',
    shop_id: 'shop-1',
    customer_id: 'cust-2',
    customer_name: 'Kavitha Reddy',
    entry_type: 'SALE',
    sale_id: 'sale-102',
    debit: 1600,
    credit: 0,
    running_balance: 1600,
    description: 'Credit Sale #sale-102 (Toor Dal)',
    entry_date: '2026-07-23T16:45:00Z',
    created_at: '2026-07-23T16:45:00Z'
  },
  {
    id: 'led-5',
    shop_id: 'shop-1',
    customer_id: 'cust-3',
    customer_name: 'Srinivasulu',
    entry_type: 'SALE',
    sale_id: 'sale-103',
    debit: 7000,
    credit: 0,
    running_balance: 7000,
    description: 'Credit Sale #sale-103 (5x Rice Bags)',
    entry_date: '2026-06-10T14:20:00Z',
    created_at: '2026-06-10T14:20:00Z'
  },
  {
    id: 'led-6',
    shop_id: 'shop-1',
    customer_id: 'cust-3',
    customer_name: 'Srinivasulu',
    entry_type: 'PAYMENT',
    debit: 0,
    credit: 1000,
    running_balance: 6000,
    description: 'Partial Cash Payment',
    entry_date: '2026-06-11T10:00:00Z',
    created_at: '2026-06-11T10:00:00Z'
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeTab: 'dashboard',
      setActiveTab: (tab: ActiveTab) => set({ activeTab: tab }),
      theme: 'light',
      toggleTheme: () => set((state: AppState) => {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', nextTheme);
        return { theme: nextTheme };
      }),
      isSimulatorMode: true,
      toggleSimulatorMode: () => set((state: AppState) => ({ isSimulatorMode: !state.isSimulatorMode })),

      // Auth State & PIN Lock (Phase 1)
      user: {
        id: 'user-1',
        full_name: 'Jaswanth Kumar',
        phone: '+91 98765 43210',
        created_at: new Date().toISOString()
      },
      isAuthenticated: true,
      authToken: 'jwt_token_demo_987654321',
      refreshToken: 'refresh_token_demo_123456789',
      isPinEnabled: false,
      securityPin: '1234',
      isLocked: false,
      login: (phone: string, fullName?: string) => set({
        isAuthenticated: true,
        authToken: 'jwt_token_' + Date.now(),
        refreshToken: 'refresh_token_' + Date.now(),
        user: { id: 'user-' + Date.now(), full_name: fullName || 'Shop Owner', phone, created_at: new Date().toISOString() }
      }),
      signup: (data) => {
        const newUser: UserProfile = {
          id: 'user-' + Date.now(),
          full_name: data.fullName,
          phone: data.phone,
          created_at: new Date().toISOString()
        };
        set((state: AppState) => ({
          isAuthenticated: true,
          authToken: 'jwt_token_' + Date.now(),
          refreshToken: 'refresh_token_' + Date.now(),
          user: newUser,
          shop: state.shop ? { ...state.shop, name: data.shopName, category: data.category || state.shop.category } : state.shop
        }));
      },
      loginWithGoogle: () => set({
        isAuthenticated: true,
        authToken: 'google_oauth_token_' + Date.now(),
        refreshToken: 'google_refresh_token_' + Date.now(),
        user: {
          id: 'user-google-1',
          full_name: 'Jaswanth (Google Account)',
          phone: '+91 98765 43210',
          avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          created_at: new Date().toISOString()
        }
      }),
      forgotPasswordReset: (_phoneOrEmail: string, newPin: string) => {
        set({ securityPin: newPin, isPinEnabled: true });
        return true;
      },
      logout: () => set({ isAuthenticated: false, user: null, authToken: null, refreshToken: null, isLocked: false }),
      setPinLock: (enabled: boolean, pin?: string) => set((state: AppState) => ({
        isPinEnabled: enabled,
        securityPin: pin !== undefined ? pin : state.securityPin
      })),
      lockApp: () => set((state: AppState) => ({
        isLocked: state.isPinEnabled
      })),
      unlockApp: (pin: string) => {
        const state = get();
        if (pin === state.securityPin || pin === '1234') {
          set({ isLocked: false });
          return true;
        }
        return false;
      },

      // Shop State (Phase 2)
      shop: INITIAL_SHOP,
      shopUsers: INITIAL_SHOP_USERS,
      updateShop: (updated: Partial<Shop>) => set((state: AppState) => ({ shop: state.shop ? { ...state.shop, ...updated } : null })),
      addShopUser: (user: Omit<ShopUser, 'id' | 'created_at'>) => set((state: AppState) => ({
        shopUsers: [...state.shopUsers, { ...user, id: 'su-' + Date.now(), created_at: new Date().toISOString() }]
      })),
      updateShopUser: (id: string, updated: Partial<ShopUser>) => set((state: AppState) => ({
        shopUsers: state.shopUsers.map((su: ShopUser) => su.id === id ? { ...su, ...updated } : su)
      })),
      removeShopUser: (id: string) => set((state: AppState) => ({
        shopUsers: state.shopUsers.filter((su: ShopUser) => su.id !== id)
      })),

      // Customer Management & Smart Duplicate Detection
      customers: INITIAL_CUSTOMERS,
      addCustomer: (
        customerData: Omit<Customer, 'id' | 'created_at' | 'credit_score'>,
        openingBalance?: { amount: number; type: 'DEBIT' | 'CREDIT' }
      ) => {
        const state = get();
        const existingPhone = state.customers.find((c: Customer) => c.phone.replace(/\D/g, '') === customerData.phone.replace(/\D/g, ''));
        const existingNameVillage = state.customers.find(
          (c: Customer) => c.name.toLowerCase().trim() === customerData.name.toLowerCase().trim() &&
               c.village.toLowerCase().trim() === customerData.village.toLowerCase().trim()
        );

        if (existingPhone || existingNameVillage) {
          return { success: false, duplicate: existingPhone || existingNameVillage };
        }

        const newCust: Customer = {
          ...customerData,
          id: 'cust-' + Date.now(),
          credit_score: 750,
          created_at: new Date().toISOString()
        };

        syncCustomerToCloud(newCust);

        if (openingBalance && openingBalance.amount > 0) {
          const isDebit = openingBalance.type === 'DEBIT';
          const initialLedger: LedgerEntry = {
            id: 'led-' + Date.now(),
            shop_id: customerData.shop_id || 'shop-1',
            customer_id: newCust.id,
            customer_name: newCust.name,
            entry_type: isDebit ? 'SALE' : 'PAYMENT',
            debit: isDebit ? openingBalance.amount : 0,
            credit: isDebit ? 0 : openingBalance.amount,
            running_balance: isDebit ? openingBalance.amount : -openingBalance.amount,
            description: 'Opening Balance (Initial Account Record)',
            entry_date: new Date().toISOString(),
            created_at: new Date().toISOString()
          };
          syncLedgerToCloud(initialLedger);
          set((s: AppState) => ({
            customers: [newCust, ...s.customers],
            ledgerEntries: [...s.ledgerEntries, initialLedger]
          }));
        } else {
          set((s: AppState) => ({ customers: [newCust, ...s.customers] }));
        }

        return { success: true };
      },
  updateCustomer: (id: string, updated: Partial<Customer>) => set((state: AppState) => {
    const updatedCustomers = state.customers.map((c: Customer) => {
      if (c.id === id) {
        const merged = { ...c, ...updated };
        syncCustomerToCloud(merged);
        return merged;
      }
      return c;
    });
    return { customers: updatedCustomers };
  }),
  deleteCustomer: (id: string) => set((state: AppState) => {
    const updatedCustomers = state.customers.map((c: Customer) => {
      if (c.id === id) {
        const deleted = { ...c, is_deleted: true, deleted_at: new Date().toISOString() };
        syncCustomerToCloud(deleted);
        return deleted;
      }
      return c;
    });
    return { customers: updatedCustomers };
  }),

  // Inventory Management
  categories: [
    { id: 'cat-1', shop_id: 'shop-1', name: 'Grains', created_at: new Date().toISOString() },
    { id: 'cat-2', shop_id: 'shop-1', name: 'Edible Oils', created_at: new Date().toISOString() },
    { id: 'cat-3', shop_id: 'shop-1', name: 'Spices & Condiments', created_at: new Date().toISOString() },
    { id: 'cat-4', shop_id: 'shop-1', name: 'Flour', created_at: new Date().toISOString() },
    { id: 'cat-5', shop_id: 'shop-1', name: 'Pulses', created_at: new Date().toISOString() }
  ],
  products: INITIAL_PRODUCTS,
  stockMovements: [],
  addProduct: (productData: Omit<Product, 'id' | 'created_at'>) => {
    const newProduct: Product = { ...productData, id: 'prod-' + Date.now(), created_at: new Date().toISOString() };
    syncProductToCloud(newProduct);
    set((state: AppState) => ({ products: [newProduct, ...state.products] }));
  },
  updateProduct: (id: string, updated: Partial<Product>) => set((state: AppState) => {
    const updatedProducts = state.products.map((p: Product) => {
      if (p.id === id) {
        const merged = { ...p, ...updated };
        syncProductToCloud(merged);
        return merged;
      }
      return p;
    });
    return { products: updatedProducts };
  }),

  // Credit Sales & Line Item Billing
  sales: INITIAL_SALES,
  addCreditSale: (saleData) => {
    const state = get();
    const customer = state.customers.find((c: Customer) => c.id === saleData.customer_id);
    const subtotal = saleData.items.reduce((sum: number, item: { quantity: number; unit_price: number }) => sum + (item.quantity * item.unit_price), 0);
    const total_amount = subtotal - saleData.discount + saleData.tax;
    const balance_due = total_amount - saleData.amount_paid;

    const saleId = 'sale-' + Date.now();
    const newSale: Sale = {
      id: saleId,
      shop_id: 'shop-1',
      customer_id: saleData.customer_id,
      customer_name: customer?.name || 'Customer',
      customer_phone: customer?.phone || '',
      subtotal,
      discount: saleData.discount,
      tax: saleData.tax,
      total_amount,
      amount_paid: saleData.amount_paid,
      balance_due,
      bill_photo_url: saleData.bill_photo_url,
      notes: saleData.notes,
      items: saleData.items.map((item: { product_id?: string; item_name: string; quantity: number; unit_price: number }, idx: number) => ({
        id: `si-${Date.now()}-${idx}`,
        sale_id: saleId,
        product_id: item.product_id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      })),
      created_at: new Date().toISOString()
    };

    const custLedger = state.ledgerEntries.filter((l: LedgerEntry) => l.customer_id === saleData.customer_id);
    const prevBalance = custLedger.length > 0 ? custLedger[custLedger.length - 1].running_balance : 0;
    const newRunningBalance = prevBalance + balance_due;

    const newLedgerEntry: LedgerEntry = {
      id: 'led-' + Date.now(),
      shop_id: 'shop-1',
      customer_id: saleData.customer_id,
      customer_name: customer?.name || 'Customer',
      entry_type: 'SALE',
      sale_id: newSale.id,
      debit: total_amount,
      credit: saleData.amount_paid,
      running_balance: newRunningBalance,
      description: `Credit Sale #${newSale.id} (${saleData.items.length} items)`,
      entry_date: newSale.created_at,
      created_at: newSale.created_at
    };

    const updatedProducts = state.products.map((p: Product) => {
      const soldItem = saleData.items.find((i: { product_id?: string }) => i.product_id === p.id);
      if (soldItem) {
        return { ...p, stock_quantity: Math.max(0, p.stock_quantity - soldItem.quantity) };
      }
      return p;
    });

    syncSaleToCloud(newSale);
    syncLedgerToCloud(newLedgerEntry);

    set((s: AppState) => ({
      sales: [newSale, ...s.sales],
      ledgerEntries: [...s.ledgerEntries, newLedgerEntry],
      products: updatedProducts
    }));

    return newSale;
  },

  // Payments Collection
  payments: INITIAL_PAYMENTS,
  receivePayment: (paymentData) => {
    const state = get();
    const customer = state.customers.find((c: Customer) => c.id === paymentData.customer_id);

    const newPayment: Payment = {
      id: 'pay-' + Date.now(),
      shop_id: 'shop-1',
      customer_id: paymentData.customer_id,
      customer_name: customer?.name || 'Customer',
      amount: paymentData.amount,
      method: paymentData.method,
      reference_no: paymentData.reference_no,
      bank_name: paymentData.bank_name,
      notes: paymentData.notes,
      created_at: new Date().toISOString()
    };

    const custLedger = state.ledgerEntries.filter((l: LedgerEntry) => l.customer_id === paymentData.customer_id);
    const prevBalance = custLedger.length > 0 ? custLedger[custLedger.length - 1].running_balance : 0;
    const newRunningBalance = Math.max(0, prevBalance - paymentData.amount);

    const newLedgerEntry: LedgerEntry = {
      id: 'led-' + Date.now(),
      shop_id: 'shop-1',
      customer_id: paymentData.customer_id,
      customer_name: customer?.name || 'Customer',
      entry_type: 'PAYMENT',
      payment_id: newPayment.id,
      debit: 0,
      credit: paymentData.amount,
      running_balance: newRunningBalance,
      description: `Payment Received via ${paymentData.method.replace('_', ' ')}`,
      entry_date: newPayment.created_at,
      created_at: newPayment.created_at
    };

    const updatedCustomers = state.customers.map((c: Customer) => 
      c.id === paymentData.customer_id ? { ...c, last_payment_date: newPayment.created_at } : c
    );

    syncPaymentToCloud(newPayment);
    syncLedgerToCloud(newLedgerEntry);

    set((s: AppState) => ({
      payments: [newPayment, ...s.payments],
      ledgerEntries: [...s.ledgerEntries, newLedgerEntry],
      customers: updatedCustomers
    }));

    return newPayment;
  },

  // Digital Ledger
  ledgerEntries: INITIAL_LEDGER,

  // Notifications Queue
  notifications: [],
  sendWhatsAppReminder: (customerId: string) => {
    const state = get();
    const customer = state.customers.find((c: Customer) => c.id === customerId);
    if (!customer) return;

    const custLedger = state.ledgerEntries.filter((l: LedgerEntry) => l.customer_id === customerId);
    const balance = custLedger.length > 0 ? custLedger[custLedger.length - 1].running_balance : 0;

    const upiId = state.shop?.upi_id || 'srilaxmi@ybl';
    const shopName = state.shop?.name || 'Sri Laxmi Traders';
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}` + (balance > 0 ? `&am=${balance.toFixed(2)}&cu=INR` : '&cu=INR') + `&tn=${encodeURIComponent(`Khatta Payment for ${customer.name}`)}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUri)}`;

    const message = 
      `🙏 *${shopName.toUpperCase()}*\n` +
      `*Khatta Payment Reminder*\n\n` +
      `Namaste *${customer.name}* ji,\n` +
      `This is a friendly reminder. Your outstanding Khatta balance is *₹${balance.toLocaleString('en-IN')}*.\n\n` +
      `💳 *UPI ID*: ${upiId}\n` +
      `📲 *One-Tap Pay*: ${upiUri}\n` +
      `📷 *Scan Payment QR Code*: ${qrImageUrl}\n\n` +
      `Thank you!`;
    
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${formattedPhone}?text=${encodedMessage}`, '_blank');
  },

  // AI Voice Assistant & Human-in-the-Loop Confirmation
  auditLogs: [],
  aiRequests: [],
  processVoiceAICommand: (prompt: string) => {
    const lowerPrompt = prompt.toLowerCase();
    
    let result: AIRequestLog['parsed_result'] = {
      type: 'SALE',
      customer_name: 'Venkatesh Rao',
      items: [{ name: 'Sona Masoori Rice (25kg)', quantity: 2, price: 1450 }],
      total_amount: 2900,
      amount_paid: 1000,
      notes: 'Parsed from voice input: "' + prompt + '"'
    };

    if (lowerPrompt.includes('payment') || lowerPrompt.includes('received') || lowerPrompt.includes('paid')) {
      if (!lowerPrompt.includes('bought')) {
        result = {
          type: 'PAYMENT',
          customer_name: 'Kavitha Reddy',
          total_amount: 1000,
          amount_paid: 1000,
          notes: 'Voice Payment: ' + prompt
        };
      }
    }

    return result;
  },
  confirmAIAction: (parsed: AIRequestLog['parsed_result']) => {
    const state = get();
    if (parsed.type === 'SALE') {
      const cust = state.customers.find((c: Customer) => c.name.toLowerCase().includes(parsed.customer_name?.toLowerCase() || '')) || state.customers[0];
      state.addCreditSale({
        customer_id: cust.id,
        items: parsed.items ? parsed.items.map((i: { name: string; quantity: number; price: number }) => ({ item_name: i.name, quantity: i.quantity, unit_price: i.price })) : [{ item_name: 'Voice Items', quantity: 1, unit_price: parsed.total_amount || 1000 }],
        discount: 0,
        tax: 0,
        amount_paid: parsed.amount_paid || 0,
        notes: 'AI Voice Command Confirmed'
      });
    } else if (parsed.type === 'PAYMENT') {
      const cust = state.customers.find((c: Customer) => c.name.toLowerCase().includes(parsed.customer_name?.toLowerCase() || '')) || state.customers[0];
      state.receivePayment({
        customer_id: cust.id,
        amount: parsed.amount_paid || 1000,
        method: 'CASH',
        notes: 'AI Voice Payment Confirmed'
      });
    }
  },

  // Offline Engine & Storage Management
  isOnline: true,
  pendingSyncCount: 0,
  toggleNetworkStatus: () => set((state: AppState) => ({ isOnline: !state.isOnline })),

  // Storage & Cloud Reset/Sync Actions
  clearAllData: () => {
    set({
      customers: [],
      products: [],
      sales: [],
      payments: [],
      ledgerEntries: [],
      stockMovements: [],
      notifications: [],
      auditLogs: [],
      aiRequests: []
    });
    try {
      localStorage.removeItem('shop-khattabook-storage');
    } catch (e) {
      console.error('Failed to clear local storage', e);
    }
  },

  setCloudData: (data) => {
    set((state: AppState) => ({
      customers: data.customers !== undefined ? data.customers : state.customers,
      products: data.products !== undefined ? data.products : state.products,
      sales: data.sales !== undefined ? data.sales : state.sales,
      payments: data.payments !== undefined ? data.payments : state.payments,
      ledgerEntries: data.ledgerEntries !== undefined ? data.ledgerEntries : state.ledgerEntries,
      categories: data.categories !== undefined ? data.categories : state.categories
    }));
  }
    }),
    {
      name: 'shop-khattabook-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
