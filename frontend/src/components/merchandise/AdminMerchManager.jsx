import React, { useState } from 'react';
import { useMerchandise } from '../../context/MerchandiseContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Layers,
  DollarSign,
  CreditCard,
  User,
  X,
  Upload,
  Sparkles,
  ArrowUpDown,
  Tag,
  Check,
  ChevronDown
} from 'lucide-react';

export const AdminMerchManager = () => {
  const { user } = useAuth();
  const {
    products,
    orders,
    getProductTotalStock,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSizeStock,
    recordPayment,
    updateFulfillmentStatus,
    placeOrder
  } = useMerchandise();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('ALL');

  // Add / Edit Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    type: 'Hoodie',
    category: 'Hoodies',
    price: '',
    tag: 'Official Skyline',
    description: '',
    image: '',
    sizeStock: {
      'S': 15,
      'M': 25,
      'L': 20,
      'XL': 10,
      '2XL': 5
    }
  });

  // Manual Quick Order Modal (replaces paper order writing at club desk)
  const [isDeskOrderModalOpen, setIsDeskOrderModalOpen] = useState(false);
  const [deskOrderForm, setDeskOrderForm] = useState({
    productId: '',
    size: 'M',
    quantity: 1,
    memberName: '',
    studentId: '',
    memberEmail: '',
    paymentMethod: 'Cash / Club Desk',
    paymentStatus: 'PAID',
    notes: 'Walk-in desk order'
  });

  // Notification banner
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // KPIs
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingPaymentsTotal = orders
    .filter((o) => o.paymentStatus === 'PENDING')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingOrdersCount = orders.filter((o) => o.paymentStatus === 'PENDING').length;
  const totalUnitsInStock = products.reduce((acc, p) => acc + getProductTotalStock(p), 0);

  // Filtered products
  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      categoryFilter === 'ALL' || item.type === categoryFilter || item.category === categoryFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filtered orders
  const filteredOrders = orders.filter((ord) => {
    const matchesStatus =
      orderPaymentFilter === 'ALL' || ord.paymentStatus === orderPaymentFilter;
    const matchesSearch =
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.productName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Open modal for new product
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      type: 'Hoodie',
      category: 'Hoodies',
      price: '',
      tag: 'Official Skyline',
      description: '',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
      sizeStock: {
        'S': 15,
        'M': 25,
        'L': 20,
        'XL': 10,
        '2XL': 5
      }
    });
    setIsProductModalOpen(true);
  };

  // Open modal for editing product
  const handleOpenEditProduct = (item) => {
    setEditingProductId(item.id);
    setProductForm({
      name: item.name,
      type: item.type || 'Hoodie',
      category: item.category || 'Hoodies',
      price: item.price,
      tag: item.tag || '',
      description: item.description || '',
      image: item.image || '',
      sizeStock: { ...(item.sizeStock || { S: 10, M: 20, L: 15, XL: 5 }) }
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert('Please enter a product name and price.');
      return;
    }

    if (editingProductId) {
      updateProduct(editingProductId, productForm);
      showToast(`Updated "${productForm.name}" successfully!`);
    } else {
      addProduct(productForm);
      showToast(`Added new ${productForm.type} "${productForm.name}" to inventory!`);
    }

    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the store catalog?`)) {
      deleteProduct(id);
      showToast(`Removed "${name}" from store.`);
    }
  };

  // Handle image file selection (converts to base64 preview for admin upload)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle walk-in / desk paperless order submit
  const handleDeskOrderSubmit = (e) => {
    e.preventDefault();
    if (!deskOrderForm.productId || !deskOrderForm.memberName) {
      alert('Please fill in product and student member name.');
      return;
    }

    const res = placeOrder({
      productId: deskOrderForm.productId,
      size: deskOrderForm.size,
      quantity: Number(deskOrderForm.quantity) || 1,
      member: {
        id: `walkin-${Date.now().toString().slice(-4)}`,
        name: deskOrderForm.memberName,
        studentId: deskOrderForm.studentId || 'WALKIN-STU',
        email: deskOrderForm.memberEmail || 'walkin@university.edu'
      },
      paymentMethod: deskOrderForm.paymentMethod,
      paymentStatus: deskOrderForm.paymentStatus,
      notes: deskOrderForm.notes
    });

    if (res.success) {
      showToast(`Desk order #${res.order.id} recorded successfully! Stock decremented.`);
      setIsDeskOrderModalOpen(false);
      setDeskOrderForm({
        productId: '',
        size: 'M',
        quantity: 1,
        memberName: '',
        studentId: '',
        memberEmail: '',
        paymentMethod: 'Cash / Club Desk',
        paymentStatus: 'PAID',
        notes: 'Walk-in desk order'
      });
    } else {
      alert(res.error || 'Failed to place order.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-2xs animate-fadeIn">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700/70 hover:text-emerald-900">
            ✕
          </button>
        </div>
      )}

      {/* Top Header & Fast Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white tracking-wider uppercase font-mono">
              Skyline SSA
            </span>
            <span className="text-xs font-medium text-slate-500">Merchandise Inventory & Order Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1 tracking-tight">
            Hoodies & T-Shirts Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain apparel catalog, track size stock live, process online phone orders, and record payments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsDeskOrderModalOpen(true)}
            className="h-9 px-3.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5"
            title="Record walk-in order directly to avoid paper slips"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            <span>Record Desk Order</span>
          </button>

          <button
            onClick={handleOpenAddProduct}
            className="h-9 px-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Hoodie or T-Shirt</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Revenue */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Recorded Revenue
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono mt-1.5">
            ${totalRevenue.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium mt-1">
            ✓ Deposited to Club Treasury
          </span>
        </div>

        {/* KPI 2: Total Units In Stock */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Apparel In Stock
            </span>
            <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 font-mono mt-1.5">
            {totalUnitsInStock} <span className="text-xs font-normal text-slate-500">Units</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1">
            Tracked across all sizes (XS to 2XL)
          </span>
        </div>

        {/* KPI 3: Orders Placed */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Online Orders
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 font-mono mt-1.5">
            {orders.length} <span className="text-xs font-normal text-slate-500">Orders</span>
          </p>
          <span className="text-[11px] text-slate-500 mt-1">
            {orders.filter((o) => o.paymentStatus === 'PAID').length} Paid • {pendingOrdersCount} Pending
          </span>
        </div>

        {/* KPI 4: Pending Payments */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Collections
            </span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-700 font-mono mt-1.5">
            ${pendingPaymentsTotal.toFixed(2)}
          </p>
          <span className="text-[11px] text-amber-700 font-medium mt-1">
            {pendingOrdersCount} orders awaiting pickup payment
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border border-slate-200 bg-white rounded-lg p-1 shadow-2xs">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`h-8 px-3 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Products & Size Stock ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`h-8 px-3 rounded-md text-xs font-semibold transition flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Merchandise Orders & Payments ({orders.length})</span>
            {pendingOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white font-mono">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-64 pr-1 hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'inventory' ? 'Search apparel...' : 'Search student or order #...'}
            className="w-full h-8 pl-8 pr-3 rounded-md border border-slate-200 bg-slate-50/50 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PRODUCT CATALOG & REMAINING STOCK PER SIZE */}
      {/* ========================================================= */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                Apparel Inventory & Real-Time Stock per Size
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every hoodie and T-shirt tracks exact stock remaining per size. Stock decrements automatically upon online orders.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs text-zinc-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">All Garments</option>
                <option value="Hoodie">Hoodies</option>
                <option value="T-Shirt">T-Shirts</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Item Details</th>
                  <th className="py-2.5 px-3.5">Type</th>
                  <th className="py-2.5 px-3.5">Price</th>
                  <th className="py-2.5 px-3.5">Remaining Stock per Size</th>
                  <th className="py-2.5 px-3.5">Total Stock</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((item) => {
                  const totalStock = getProductTotalStock(item);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      {/* Product image & name */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-md object-cover border border-slate-200 flex-shrink-0"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div>
                            <span className="font-semibold text-zinc-900 block">{item.name}</span>
                            <span className="text-[11px] text-slate-500">{item.tag || 'Skyline Official'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Type badge */}
                      <td className="py-2.5 px-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
                          {item.type}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-3.5 font-bold text-zinc-900 text-xs sm:text-sm font-mono">
                        ${item.price.toFixed(2)}
                      </td>

                      {/* CRITICAL REQUIREMENT: TRACK STOCK REMAINING PER SIZE */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.sizeStock &&
                            Object.entries(item.sizeStock).map(([sz, count]) => {
                              const isLow = count > 0 && count < 5;
                              const isOut = count === 0;

                              return (
                                <div
                                  key={sz}
                                  className={`px-1.5 py-0.5 rounded text-[11px] border font-medium flex items-center gap-1 ${
                                    isOut
                                      ? 'bg-red-50 border-red-200 text-red-700'
                                      : isLow
                                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                                      : 'bg-slate-50 border-slate-200 text-zinc-800'
                                  }`}
                                  title={`${count} remaining in size ${sz}`}
                                >
                                  <span className="font-bold">{sz}:</span>
                                  <span>{count}</span>
                                  {/* Quick +5 Restock inline */}
                                  <button
                                    onClick={() => {
                                      updateSizeStock(item.id, sz, count + 5);
                                      showToast(`Added +5 stock to size ${sz} of "${item.name}"`);
                                    }}
                                    className="ml-0.5 text-[9px] px-1 py-0.2 rounded bg-slate-200/80 hover:bg-emerald-700 hover:text-white transition"
                                    title="Add 5 units"
                                  >
                                    +5
                                  </button>
                                </div>
                              );
                            })}
                        </div>
                      </td>

                      {/* Total Stock */}
                      <td className="py-2.5 px-3.5">
                        {totalStock === 0 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200">
                            Out of Stock
                          </span>
                        ) : totalStock < 15 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            {totalStock} (Low Stock)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {totalStock} in stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleOpenEditProduct(item)}
                            className="p-1 rounded text-slate-400 hover:text-zinc-900 hover:bg-slate-100 transition"
                            title="Edit product details & size stock"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.id, item.name)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MERCHANDISE ORDERS & PAYMENT TRACKING */}
      {/* ========================================================= */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                Online Orders & Payment Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Eliminates paper notes and chasing members for payment. Record payments, verify pickup passes, and track order fulfillment.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">Payment Filter:</span>
              <select
                value={orderPaymentFilter}
                onChange={(e) => setOrderPaymentFilter(e.target.value)}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs text-zinc-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="ALL">All Payments</option>
                <option value="PAID">Paid Only</option>
                <option value="PENDING">Pending Collection</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3.5">Order ID & Date</th>
                  <th className="py-2.5 px-3.5">Member Info</th>
                  <th className="py-2.5 px-3.5">Product & Size</th>
                  <th className="py-2.5 px-3.5">Qty & Total</th>
                  <th className="py-2.5 px-3.5">Payment Status</th>
                  <th className="py-2.5 px-3.5">Fulfillment</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
                      No merchandise orders match current filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition">
                      {/* ID and Date */}
                      <td className="py-2.5 px-3.5">
                        <span className="font-mono font-bold text-zinc-900 block">{ord.id}</span>
                        <span className="text-[11px] text-slate-500">{ord.orderDate}</span>
                      </td>

                      {/* Member Info */}
                      <td className="py-2.5 px-3.5">
                        <span className="font-semibold text-zinc-900 block">{ord.memberName}</span>
                        <span className="text-[11px] text-slate-500 block font-mono">{ord.studentId}</span>
                        <span className="text-[10px] text-slate-400 block">{ord.memberEmail}</span>
                      </td>

                      {/* Product and Size */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center space-x-2">
                          <img
                            src={ord.image}
                            alt={ord.productName}
                            className="w-9 h-9 rounded object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <span className="font-medium text-zinc-900 block max-w-[180px] truncate">
                              {ord.productName}
                            </span>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white mt-0.5 font-mono">
                              Size: {ord.size}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Qty and Total */}
                      <td className="py-2.5 px-3.5">
                        <span className="text-slate-500 block">Qty: {ord.quantity}</span>
                        <span className="font-bold text-zinc-900 text-xs sm:text-sm font-mono">
                          ${ord.totalPrice.toFixed(2)}
                        </span>
                      </td>

                      {/* Payment Status & Method */}
                      <td className="py-2.5 px-3.5">
                        {ord.paymentStatus === 'PAID' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> PAID
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                              {ord.paymentMethod}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <Clock className="w-3 h-3 mr-1 text-amber-600" /> PENDING
                            </span>
                            {/* Fast Action: Record Cash / In-person payment */}
                            <button
                              onClick={() => {
                                recordPayment(ord.id, 'PAID', 'Cash / Club Desk Verified');
                                showToast(`Payment recorded for Order #${ord.id}!`);
                              }}
                              className="text-[10px] px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold block transition"
                            >
                              Record Payment
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Fulfillment */}
                      <td className="py-2.5 px-3.5">
                        {ord.fulfillmentStatus === 'COLLECTED' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            ✓ Collected
                          </span>
                        ) : ord.fulfillmentStatus === 'READY_FOR_PICKUP' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Ready for Pickup
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 border border-slate-200 text-slate-600">
                            Ordered
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3.5 text-right">
                        <select
                          value={ord.fulfillmentStatus}
                          onChange={(e) => {
                            updateFulfillmentStatus(ord.id, e.target.value);
                            showToast(`Updated order status to ${e.target.value}`);
                          }}
                          className="px-2 py-1 rounded border border-slate-200 bg-white text-[11px] text-zinc-900 focus:outline-none focus:border-emerald-600"
                        >
                          <option value="ORDERED">Ordered</option>
                          <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                          <option value="COLLECTED">Collected / Handed Over</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD / EDIT HOODIE OR T-SHIRT (PHOTO ADDED BY ADMIN) */}
      {/* ========================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl p-4 sm:p-5 space-y-3.5 animate-scaleUp">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
              <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                {editingProductId ? 'Edit Garment Product' : 'Add New Hoodie or T-Shirt'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-zinc-900 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Product Name */}
                <div className="col-span-2">
                  <label className="font-semibold text-zinc-900 block mb-1">
                    Garment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Skyline SSA Heavyweight Crest Hoodie"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full h-8 px-3 rounded-md border border-slate-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                {/* Apparel Type */}
                <div>
                  <label className="font-semibold text-zinc-900 block mb-1">
                    Apparel Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={productForm.type}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        type: e.target.value,
                        category: e.target.value === 'Hoodie' ? 'Hoodies' : 'T-Shirts'
                      })
                    }
                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Hoodie">🧥 Branded Hoodie</option>
                    <option value="T-Shirt">👕 Branded T-Shirt</option>
                    <option value="Zip-Up">🧥 Zip-Up Tech Hoodie</option>
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="font-semibold text-zinc-900 block mb-1">
                    Club Selling Price ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    placeholder="35.00"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full h-8 px-3 rounded-md border border-slate-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                </div>

                {/* Tag */}
                <div className="col-span-2">
                  <label className="font-semibold text-zinc-900 block mb-1">
                    Merch Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Official Skyline, Limited Edition, Fall 2026"
                    value={productForm.tag}
                    onChange={(e) => setProductForm({ ...productForm, tag: e.target.value })}
                    className="w-full h-8 px-3 rounded-md border border-slate-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="font-semibold text-zinc-900 block mb-1">
                    Description & Fabric Details
                  </label>
                  <textarea
                    rows="2"
                    placeholder="e.g. 100% heavyweight fleece with embroidered Skyline crest..."
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full p-2 rounded-md border border-slate-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* ADMIN PHOTO UPLOAD / PHOTO URL (per user request: photos added by admin only) */}
                <div className="col-span-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <label className="font-bold text-zinc-900 uppercase tracking-wider block text-[10px]">
                    Garment Photo (Added by Admin)
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-2.5">
                    {productForm.image && (
                      <img
                        src={productForm.image}
                        alt="Preview"
                        className="w-12 h-12 rounded-md object-cover border border-slate-200 flex-shrink-0"
                      />
                    )}
                    <div className="space-y-1 w-full">
                      <input
                        type="text"
                        placeholder="Paste image URL or upload photo below..."
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        className="w-full h-7 px-2.5 rounded border border-slate-200 bg-white text-xs text-zinc-900"
                      />
                      <label className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-xs font-semibold cursor-pointer transition text-zinc-800">
                        <Upload className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Upload photo from device</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* CRITICAL REQUIREMENT: PER-SIZE STOCK QUANTITY SETUP */}
                <div className="col-span-2 space-y-2 pt-2 border-t border-slate-200">
                  <label className="font-bold text-zinc-900 uppercase tracking-wider block text-[10px]">
                    Size Stock Allocations (Units Remaining in Stock)
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {['XS', 'S', 'M', 'L', 'XL', '2XL'].map((sizeKey) => (
                      <div key={sizeKey} className="p-1.5 rounded-md bg-white border border-slate-200 text-center">
                        <span className="text-[11px] font-bold text-zinc-900 block">{sizeKey}</span>
                        <input
                          type="number"
                          min="0"
                          value={productForm.sizeStock?.[sizeKey] ?? 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setProductForm((prev) => ({
                              ...prev,
                              sizeStock: {
                                ...prev.sizeStock,
                                [sizeKey]: val
                              }
                            }));
                          }}
                          className="w-full text-center mt-1 px-1 py-0.5 rounded border border-slate-200 bg-slate-50 text-xs font-bold text-zinc-900 font-mono focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="h-8 px-3 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition"
                >
                  {editingProductId ? 'Save Changes' : 'Publish to Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: WALK-IN / DESK PAPERLESS ORDER */}
      {/* ========================================================= */}
      {isDeskOrderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-slate-200 max-w-md w-full shadow-xl p-4 sm:p-5 space-y-3.5 animate-scaleUp">
            <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                  Record Desk Order
                </h3>
                <p className="text-xs text-slate-500">
                  Avoid paper slips when members visit the Skyline club desk in person.
                </p>
              </div>
              <button
                onClick={() => setIsDeskOrderModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-zinc-900 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDeskOrderSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-900 block mb-1">Select Garment</label>
                <select
                  required
                  value={deskOrderForm.productId}
                  onChange={(e) => setDeskOrderForm({ ...deskOrderForm, productId: e.target.value })}
                  className="w-full h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">-- Choose Hoodie or T-Shirt --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-zinc-900 block mb-1">Size</label>
                  <select
                    value={deskOrderForm.size}
                    onChange={(e) => setDeskOrderForm({ ...deskOrderForm, size: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="2XL">2XL</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-zinc-900 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={deskOrderForm.quantity}
                    onChange={(e) => setDeskOrderForm({ ...deskOrderForm, quantity: e.target.value })}
                    className="w-full h-8 px-3 rounded-md border border-slate-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-zinc-900 block mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Harper"
                    value={deskOrderForm.memberName}
                    onChange={(e) => setDeskOrderForm({ ...deskOrderForm, memberName: e.target.value })}
                    className="w-full h-8 px-3 rounded-md border border-slate-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-zinc-900 block mb-1">Student ID #</label>
                  <input
                    type="text"
                    placeholder="STU-2026-XXXX"
                    value={deskOrderForm.studentId}
                    onChange={(e) => setDeskOrderForm({ ...deskOrderForm, studentId: e.target.value })}
                    className="w-full h-8 px-3 rounded-md border border-slate-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-zinc-900 block mb-1">Payment Method</label>
                  <select
                    value={deskOrderForm.paymentMethod}
                    onChange={(e) => setDeskOrderForm({ ...deskOrderForm, paymentMethod: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Cash / Club Desk">Cash (Club Desk)</option>
                    <option value="Student Account (Bursar)">Student ID / Bursar</option>
                    <option value="Card Terminal POS">Card Terminal POS</option>
                    <option value="Digital Pay / UPI">Digital Pay / UPI</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-zinc-900 block mb-1">Payment Status</label>
                  <select
                    value={deskOrderForm.paymentStatus}
                    onChange={(e) => setDeskOrderForm({ ...deskOrderForm, paymentStatus: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs text-zinc-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="PAID">PAID (Collected Now)</option>
                    <option value="PENDING">PENDING (Pay Later)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsDeskOrderModalOpen(false)}
                  className="h-8 px-3 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-md bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition"
                >
                  Confirm & Decrement Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMerchManager;
