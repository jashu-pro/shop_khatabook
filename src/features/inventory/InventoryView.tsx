import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { AlertTriangle, Plus, Tag } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { products, categories, addProduct } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [categoryName, setCategoryName] = useState('Grains');
  const [sellingPrice, setSellingPrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [barcode, setBarcode] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sellingPrice || !stockQuantity) return;

    addProduct({
      shop_id: 'shop-1',
      name,
      category_name: categoryName,
      selling_price: parseFloat(sellingPrice),
      purchase_price: parseFloat(purchasePrice || '0'),
      stock_quantity: parseInt(stockQuantity),
      min_stock_alert: parseInt(minStockAlert),
      barcode: barcode || '890' + Math.floor(1000000000 + Math.random() * 9000000000)
    });

    setShowAddModal(false);
    setName('');
    setSellingPrice('');
    setPurchasePrice('');
    setStockQuantity('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Inventory & Products</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stock Catalog & Low-Stock Alerts</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)} style={{ width: 'auto', padding: '10px 16px', borderRadius: '12px' }}>
          <Plus size={16} />
          + Product
        </button>
      </div>

      {products.some(p => p.stock_quantity <= p.min_stock_alert) && (
        <div style={{ background: 'var(--debt-50)', border: '1px solid var(--debt-100)', color: 'var(--debt-700)', padding: '12px 16px', borderRadius: '12px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={20} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px' }}>Stock Alert Warning</div>
            <div style={{ fontSize: '11px' }}>Some items are running low in stock. Please re-order from suppliers.</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {products.map(product => {
          const isLowStock = product.stock_quantity <= product.min_stock_alert;
          return (
            <div key={product.id} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '14px 16px', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: '15px' }}>{product.name}</h3>
                    {isLowStock && (
                      <span style={{ background: 'var(--debt-500)', color: 'white', padding: '2px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 800 }}>
                        LOW STOCK
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: 4 }}>
                    <Tag size={11} style={{ display: 'inline', marginRight: 4 }} />
                    {product.category_name} • Barcode: {product.barcode || 'N/A'}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--khatta-700)' }}>
                    ₹{product.selling_price.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Cost: ₹{product.purchase_price}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: isLowStock ? 'var(--debt-600)' : 'var(--text-main)' }}>
                  In Stock: <strong>{product.stock_quantity} units</strong> (Min: {product.min_stock_alert})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Est Profit: ₹{(product.selling_price - product.purchase_price) * product.stock_quantity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2>Add New Product to Inventory</h2>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700 }}>Product Name *</label>
                <input type="text" className="input-field" placeholder="e.g. Sona Masoori Rice (25kg)" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>Category</label>
                  <select className="input-field" value={categoryName} onChange={(e) => setCategoryName(e.target.value)}>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>Selling Price (₹) *</label>
                  <input type="number" className="input-field" placeholder="1450" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>Purchase Price (₹)</label>
                  <input type="number" className="input-field" placeholder="1300" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>Stock Quantity *</label>
                  <input type="number" className="input-field" placeholder="35" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>Low Stock Alert Min</label>
                  <input type="number" className="input-field" value={minStockAlert} onChange={(e) => setMinStockAlert(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 700 }}>Barcode / SKU</label>
                  <input type="text" className="input-field" placeholder="Scan or enter SKU" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: 10 }}>
                Save Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
