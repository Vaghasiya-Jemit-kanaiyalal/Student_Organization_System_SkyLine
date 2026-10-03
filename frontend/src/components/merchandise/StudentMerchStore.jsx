import React, { useState, useMemo } from 'react';
import { useMerchandise } from '../../context/MerchandiseContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Package,
  DollarSign,
  CreditCard,
  User,
  X,
  Sparkles,
  Tag,
  Check,
  Receipt,
  MapPin,
  AlertCircle
} from 'lucide-react';

export const StudentMerchStore = ({ studentProfile, isClubMember = false }) => {
  const { user } = useAuth();
  const {
    products,
    orders,
    getProductTotalStock,
    placeOrder
  } = useMerchandise();

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'orders'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('ALL');

  // Order modal state
  const [orderingProduct, setOrderingProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Student ID Account (Bursar)');
  const [orderNotes, setOrderNotes] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const studentName = studentProfile?.name || user?.name || user?.fullName || 'Student Member';
  const studentId = studentProfile?.studentId || user?.studentId || user?.student_id || 'STU-2026-905';
  const studentEmail = studentProfile?.email || user?.email || 'student@university.edu';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Student's own private orders
  const userOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchEmail = Boolean(
        studentEmail &&
        order.memberEmail &&
        order.memberEmail.toLowerCase() === studentEmail.toLowerCase()
      );
      const matchId = Boolean(
        (user?.id && (order.memberId === user.id || order.userId === user.id || order.student_id === user.id)) ||
        (studentId && String(order.studentId).toLowerCase() === String(studentId).toLowerCase())
      );
      return matchEmail || matchId;
    });
  }, [orders, studentEmail, studentId, user?.id]);

  // Compute live KPI metrics for student
  const totalRevenue = useMemo(() => {
    return userOrders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + (parseFloat(o.totalPrice) || 0), 0);
  }, [userOrders]);

  const totalStockUnits = useMemo(() => {
    return products.reduce((acc, item) => acc + getProductTotalStock(item), 0);
  }, [products, getProductTotalStock]);

  const pendingCollectionOrders = useMemo(() => {
    return userOrders.filter((o) => o.paymentStatus === 'PENDING' || o.fulfillmentStatus === 'READY_FOR_PICKUP');
  }, [userOrders]);

  const pendingCollectionsAmount = useMemo(() => {
    return pendingCollectionOrders.reduce((sum, o) => sum + (parseFloat(o.totalPrice) || 0), 0);
  }, [pendingCollectionOrders]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.type && item.type.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory =
        categoryFilter === 'ALL' ||
        (categoryFilter === 'Hoodie' && (item.category === 'Hoodies' || item.type === 'Hoodie')) ||
        (categoryFilter === 'T-Shirt' && (item.category === 'T-Shirts' || item.type === 'T-Shirt'));
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return userOrders.filter((order) => {
      const matchesPayment =
        orderPaymentFilter === 'ALL' || order.paymentStatus === orderPaymentFilter;
      return matchesPayment;
    });
  }, [userOrders, orderPaymentFilter]);

  // Price calculation helper
  const getProductPrice = (basePrice) => {
    const num = Number(basePrice) || 0;
    if (isClubMember) {
      return {
        regular: num,
        final: num * 0.9,
        isDiscounted: true
      };
    }
    return {
      regular: num,
      final: num,
      isDiscounted: false
    };
  };

  const handleOpenOrderModal = (product) => {
    setOrderingProduct(product);
    setOrderQuantity(1);
    setOrderNotes('');

    // Default to first available size
    const availableSize = Object.entries(product.sizeStock || {}).find(([_, qty]) => qty > 0);
    setSelectedSize(availableSize ? availableSize[0] : 'M');
  };

  const handlePlaceOrderSubmit = (e) => {
    e.preventDefault();
    if (!orderingProduct) return;

    const availableStock = orderingProduct.sizeStock?.[selectedSize] || 0;
    if (availableStock < orderQuantity) {
      alert(`Only ${availableStock} item(s) left in size ${selectedSize}.`);
      return;
    }

    const priceInfo = getProductPrice(orderingProduct.price);
    const unitPrice = priceInfo.final;
    const paymentStatus = paymentMethod.includes('Cash') ? 'PENDING' : 'PAID';

    const res = placeOrder({
      productId: orderingProduct.id,
      size: selectedSize,
      quantity: Number(orderQuantity) || 1,
      member: {
        id: user?.id || 'stu-online',
        name: studentName,
        studentId: studentId,
        email: studentEmail
      },
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      notes: orderNotes || (isClubMember ? 'Club Member 10% Discount Order' : 'Standard Student Order'),
      unitPrice: unitPrice
    });

    if (res.success) {
      showToast(`Order #${res.order.id} placed successfully! Stock decremented in real-time.`);
      setOrderingProduct(null);
      setActiveTab('orders');
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

      {/* Top Header Card */}
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
          {isClubMember ? (
            <div className="h-9 px-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>10% Member Discount Unlocked</span>
            </div>
          ) : (
            <div className="h-9 px-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1.5 shadow-2xs">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              <span>Standard Student Pricing</span>
            </div>
          )}

          <button
            onClick={() => {
              if (products.length > 0) {
                handleOpenOrderModal(products[0]);
              }
            }}
            className="h-9 px-3.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order Hoodie or T-Shirt</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Recorded Purchases */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Total Purchases
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono mt-1.5">
            ${totalRevenue.toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-700 font-medium mt-1">
            ✓ Confirmed Member Purchases
          </span>
        </div>

        {/* KPI 2: Total Apparel in Stock */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Apparel in Stock
            </span>
            <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-800 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 font-mono mt-1.5">
            {totalStockUnits} Units
          </p>
          <span className="text-[11px] text-slate-500 mt-1">
            Tracked across all sizes (XS to 2XL)
          </span>
        </div>

        {/* KPI 3: Total Online Orders */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              My Apparel Orders
            </span>
            <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 font-mono mt-1.5">
            {userOrders.length} Orders
          </p>
          <span className="text-[11px] text-slate-500 mt-1">
            {userOrders.filter((o) => o.paymentStatus === 'PAID').length} Paid • {pendingCollectionOrders.length} Pending
          </span>
        </div>

        {/* KPI 4: Pending Collections */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Collections
            </span>
            <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-800 font-mono mt-1.5">
            ${pendingCollectionsAmount.toFixed(2)}
          </p>
          <span className="text-[11px] text-amber-800 font-medium mt-1">
            {pendingCollectionOrders.length} orders awaiting payment at pickup
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Search Controls */}
      <div className="bg-white rounded-lg border border-slate-200 p-2 sm:p-2.5 shadow-2xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`h-8 px-3 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Products & Size Stock ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`h-8 px-3 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-zinc-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-zinc-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Merchandise Orders & Payments ({orders.length})</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apparel..."
            className="w-full sm:w-60 h-8 pl-8 pr-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-zinc-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PRODUCTS & REAL-TIME SIZE STOCK TABLE              */}
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
                  const priceInfo = getProductPrice(item.price);
                  const isOutOfStock = totalStock <= 0;

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

                      {/* Price with Member Discount support */}
                      <td className="py-2.5 px-3.5 font-bold text-zinc-900 text-xs sm:text-sm font-mono">
                        {priceInfo.isDiscounted ? (
                          <div>
                            <span className="text-emerald-700">${priceInfo.final.toFixed(2)}</span>
                            <span className="block text-[10px] text-slate-400 line-through">${priceInfo.regular.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span>${item.price.toFixed(2)}</span>
                        )}
                      </td>

                      {/* REMAINING STOCK PER SIZE */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {item.sizeStock &&
                            Object.entries(item.sizeStock).map(([sz, count]) => {
                              const isLow = count > 0 && count < 5;
                              const isOut = count === 0;

                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  disabled={isOut}
                                  onClick={() => {
                                    setOrderingProduct(item);
                                    setSelectedSize(sz);
                                    setOrderQuantity(1);
                                  }}
                                  className={`px-1.5 py-0.5 rounded text-[11px] border font-medium flex items-center gap-1 cursor-pointer transition ${
                                    isOut
                                      ? 'bg-red-50 border-red-200 text-red-700 line-through cursor-not-allowed opacity-60'
                                      : isLow
                                      ? 'bg-amber-50 border-amber-200 text-amber-800 hover:border-amber-400'
                                      : 'bg-slate-50 border-slate-200 text-zinc-800 hover:border-emerald-600 hover:bg-emerald-50'
                                  }`}
                                  title={isOut ? `Size ${sz} is out of stock` : `Click to order size ${sz} (${count} left)`}
                                >
                                  <span className="font-bold">{sz}:</span>
                                  <span>{count}</span>
                                </button>
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

                      {/* Order Action Button */}
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => handleOpenOrderModal(item)}
                          className={`h-7 px-3 rounded-md text-xs font-semibold shadow-2xs transition inline-flex items-center gap-1 cursor-pointer ${
                            isOutOfStock
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          }`}
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>{isOutOfStock ? 'Sold Out' : 'Order'}</span>
                        </button>
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
                  <th className="py-2.5 px-3.5">Order Ref</th>
                  <th className="py-2.5 px-3.5">Customer</th>
                  <th className="py-2.5 px-3.5">Item & Size</th>
                  <th className="py-2.5 px-3.5">Qty</th>
                  <th className="py-2.5 px-3.5">Total Amount</th>
                  <th className="py-2.5 px-3.5">Payment Method</th>
                  <th className="py-2.5 px-3.5">Status</th>
                  <th className="py-2.5 px-3.5">Fulfillment</th>
                  <th className="py-2.5 px-3.5 text-right">Pickup Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const isMyOrder =
                    order.memberEmail?.toLowerCase() === studentEmail.toLowerCase() ||
                    order.studentId?.toLowerCase() === studentId.toLowerCase() ||
                    order.memberName?.toLowerCase() === studentName.toLowerCase();

                  return (
                    <tr
                      key={order.id}
                      className={`transition ${isMyOrder ? 'bg-emerald-50/30 hover:bg-emerald-50/50' : 'hover:bg-slate-50/80'}`}
                    >
                      {/* Order ref & date */}
                      <td className="py-2.5 px-3.5">
                        <span className="font-mono font-bold text-zinc-900 block">{order.id}</span>
                        <span className="text-[10px] text-slate-400">{order.orderDate}</span>
                      </td>

                      {/* Customer */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                            {order.memberName ? order.memberName.charAt(0) : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-zinc-900 block">{order.memberName}</span>
                              {isMyOrder && (
                                <span className="text-[9px] px-1 rounded bg-emerald-100 text-emerald-800 font-bold">You</span>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">{order.studentId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Item and size */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center space-x-2">
                          <img
                            src={order.image}
                            alt=""
                            className="w-7 h-7 rounded object-cover border border-slate-200 flex-shrink-0"
                            onError={(e) => {
                              e.target.src =
                                'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div>
                            <span className="font-medium text-zinc-900 block max-w-[160px] truncate">
                              {order.productName}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-800 font-mono font-bold border border-zinc-200">
                              Size {order.size}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-2.5 px-3.5 font-bold font-mono text-zinc-900">
                        {order.quantity}
                      </td>

                      {/* Total price */}
                      <td className="py-2.5 px-3.5 font-bold font-mono text-emerald-800 text-xs sm:text-sm">
                        ${(parseFloat(order.totalPrice) || 0).toFixed(2)}
                      </td>

                      {/* Payment method */}
                      <td className="py-2.5 px-3.5">
                        <span className="text-[11px] text-slate-600 truncate block max-w-[130px]">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Payment status badge */}
                      <td className="py-2.5 px-3.5">
                        {order.paymentStatus === 'PAID' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ✓ Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Pending at Desk
                          </span>
                        )}
                      </td>

                      {/* Fulfillment */}
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            order.fulfillmentStatus === 'COLLECTED'
                              ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              : order.fulfillmentStatus === 'READY_FOR_PICKUP'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {order.fulfillmentStatus === 'COLLECTED'
                            ? 'Collected'
                            : order.fulfillmentStatus === 'READY_FOR_PICKUP'
                            ? 'Ready at Rm 104'
                            : 'Processing'}
                        </span>
                      </td>

                      {/* Slip Action */}
                      <td className="py-2.5 px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingReceipt(order)}
                          className="h-7 px-2 rounded bg-white hover:bg-slate-100 border border-slate-200 text-zinc-700 text-xs font-semibold inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Receipt className="w-3 h-3 text-slate-400" />
                          <span>Slip</span>
                        </button>
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
      {/* MODAL 1: ORDER PLACEMENT MODAL                            */}
      {/* ========================================================= */}
      {orderingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-fadeIn">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl border border-slate-200 p-4 sm:p-5 space-y-3.5 relative">
            <button
              onClick={() => setOrderingProduct(null)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center space-x-2 text-emerald-800">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-zinc-900">
                  Place Apparel Order
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Real-time stock decrement on {orderingProduct.name}
              </p>
            </div>

            <form onSubmit={handlePlaceOrderSubmit} className="space-y-3 text-xs">
              {/* Product preview */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center space-x-3">
                <img
                  src={orderingProduct.image}
                  alt={orderingProduct.name}
                  className="w-12 h-12 rounded object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-zinc-900 truncate">{orderingProduct.name}</h4>
                  <p className="text-[11px] text-slate-500">{orderingProduct.type} • {orderingProduct.tag || 'Official'}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono font-bold text-emerald-800">
                      ${getProductPrice(orderingProduct.price).final.toFixed(2)}
                    </span>
                    {isClubMember && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-semibold">
                        10% Member Price
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Size selection */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700">Select Size</label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {orderingProduct.sizeStock?.[selectedSize] || 0} in stock
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {Object.entries(orderingProduct.sizeStock || {}).map(([size, count]) => {
                    const isAvailable = count > 0;
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setSelectedSize(size)}
                        className={`h-8 rounded border text-xs font-semibold font-mono transition flex flex-col items-center justify-center cursor-pointer ${
                          !isAvailable
                            ? 'bg-slate-50 text-slate-300 border-slate-100 line-through cursor-not-allowed'
                            : isSelected
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 text-zinc-800 border-slate-200'
                        }`}
                      >
                        <span>{size}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity & Total */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 font-bold text-zinc-700 flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={orderingProduct.sizeStock?.[selectedSize] || 1}
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 h-8 text-center rounded border border-slate-200 font-mono font-bold text-zinc-900 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setOrderQuantity((q) =>
                          Math.min(orderingProduct.sizeStock?.[selectedSize] || 1, q + 1)
                        )
                      }
                      className="w-8 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 font-bold text-zinc-700 flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Due</label>
                  <div className="h-8 px-2.5 rounded bg-slate-50 border border-slate-200 flex items-center font-mono font-bold text-emerald-800 text-sm">
                    ${(getProductPrice(orderingProduct.price).final * orderQuantity).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg border border-slate-200 bg-white text-zinc-900 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-medium"
                >
                  <option value="Student ID Account (Bursar)">Student ID Account (Bursar)</option>
                  <option value="Credit / Debit Card">Credit / Debit Card Online</option>
                  <option value="Cash / Card upon Pickup">Cash / Card at Pickup Counter</option>
                </select>
              </div>

              {/* Order Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pickup Notes (Optional)</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Will pick up after 3 PM engineering class"
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setOrderingProduct(null)}
                  className="h-8 px-3.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PICKUP SLIP RECEIPT                              */}
      {/* ========================================================= */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xs animate-fadeIn">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl border border-slate-200 p-4 sm:p-5 space-y-3.5 relative text-xs">
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-zinc-900 border-b border-slate-100 pb-2.5">
              <Receipt className="w-4 h-4 text-emerald-700" />
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Apparel Pickup Slip
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">Order Ref: {viewingReceipt.id}</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-zinc-900">{viewingReceipt.productName}</p>
                  <p className="text-[11px] text-slate-500">Size: <strong>{viewingReceipt.size}</strong> • Qty: <strong>{viewingReceipt.quantity}</strong></p>
                </div>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  ${(Number(viewingReceipt.totalPrice) || 0).toFixed(2)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div>
                  <span className="text-slate-400 block">Student Name</span>
                  <span className="font-semibold text-zinc-900">{viewingReceipt.memberName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Student ID</span>
                  <span className="font-mono font-semibold text-zinc-900">{viewingReceipt.studentId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Payment Status</span>
                  <span className="font-semibold text-emerald-800">{viewingReceipt.paymentStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Payment Method</span>
                  <span className="text-zinc-800 truncate block">{viewingReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1">
                <p className="text-slate-400">Pickup Counter:</p>
                <p className="font-semibold text-zinc-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Student Union Center, Room 104</span>
                </p>
                <p className="text-slate-500 text-[10px]">Hours: Monday–Friday 10:00 AM – 5:00 PM</p>
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="h-8 px-4 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
