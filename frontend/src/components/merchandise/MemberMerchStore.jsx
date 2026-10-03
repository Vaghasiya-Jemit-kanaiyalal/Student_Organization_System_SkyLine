import React, { useState } from 'react';
import { useMerchandise } from '../../context/MerchandiseContext';
import { useAuth } from '../../context/AuthContext';
import {
  ShoppingBag,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  CreditCard,
  Building,
  Smartphone,
  QrCode,
  Tag,
  Search,
  Filter,
  Package,
  Layers,
  ChevronRight,
  ShieldCheck,
  Receipt,
  X
} from 'lucide-react';

export const MemberMerchStore = () => {
  const { user } = useAuth();
  const { products, orders, placeOrder, getProductTotalStock } = useMerchandise();

  // Active membership check
  const isClubMember = (user?.memberships && user.memberships.length > 0) || user?.role === 'ADMIN' || user?.role === 'TREASURER';
  const getProductPrice = (item) => isClubMember ? item.price : item.price + 10;

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('store'); // 'store' | 'my-orders'

  // Order modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Student Account (Bursar)');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Success / Receipt modal state
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Filtered products
  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      selectedCategory === 'ALL' ||
      item.type === selectedCategory ||
      item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // User's own orders
  const myOrders = orders.filter((o) => o.memberEmail === user?.email || o.memberId === user?.id);

  const handleOpenOrderModal = (product) => {
    setSelectedProduct(product);
    setOrderError('');
    setQuantity(1);
    setOrderNotes('');

    // Pre-select first available size
    const availableSizes = Object.entries(product.sizeStock || {}).filter(
      ([_, stock]) => stock > 0
    );
    if (availableSizes.length > 0) {
      setSelectedSize(availableSizes[0][0]);
    } else {
      setSelectedSize('');
    }
  };

  const handlePlaceOrderSubmit = (e) => {
    e.preventDefault();
    if (!selectedSize) {
      setOrderError('Please select a clothing size to proceed.');
      return;
    }

    const availableStock = selectedProduct.sizeStock?.[selectedSize] || 0;
    if (availableStock < quantity) {
      setOrderError(`Only ${availableStock} item(s) available in size ${selectedSize}.`);
      return;
    }

    setIsSubmitting(true);
    setOrderError('');

    // Determine initial payment status based on chosen method
    const isInstantPay =
      paymentMethod !== 'Cash / Pay at Pickup';
    const initialPaymentStatus = isInstantPay ? 'PAID' : 'PENDING';

    setTimeout(() => {
      const effectiveUnitPrice = getProductPrice(selectedProduct);
      const result = placeOrder({
        productId: selectedProduct.id,
        size: selectedSize,
        quantity: quantity,
        unitPrice: effectiveUnitPrice,
        member: {
          id: user?.id || 'usr-student',
          name: user?.name || user?.fullName || 'Student Member',
          studentId: user?.studentId || 'STU-2026',
          email: user?.email || 'student@university.edu'
        },
        paymentMethod: paymentMethod,
        paymentStatus: initialPaymentStatus,
        notes: orderNotes
      });

      setIsSubmitting(false);

      if (result.success) {
        setSelectedProduct(null);
        setConfirmedOrder(result.order);
      } else {
        setOrderError(result.error || 'Failed to place order.');
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Online Phone & Desktop Merchandise Store */}
      <div className="bg-gradient-to-r from-[#0F2942] to-[#1557B0] text-white rounded-xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#58A6FF]/20 text-[#58A6FF] border border-[#58A6FF]/40 uppercase tracking-wider">
                Skyline Student Association
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-white flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-[#58A6FF]" /> Mobile Online Ordering
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2">
              Official Club Apparel & Merchandise
            </h1>
            <p className="text-xs sm:text-sm text-[#D9E2EC] max-w-2xl mt-1 leading-relaxed">
              Order your official branded hoodies and T-shirts directly from your phone. Pick your size, select payment, and receive your digital pickup pass instantly without paper order forms!
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start md:self-center">
            <button
              onClick={() => setActiveView('store')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                activeView === 'store'
                  ? 'bg-white text-[#0F2942] shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              Browse Products
            </button>
            <button
              onClick={() => setActiveView('my-orders')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeView === 'my-orders'
                  ? 'bg-white text-[#0F2942] shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>My Orders ({myOrders.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: PRODUCT CATALOG & MOBILE-FRIENDLY STORE */}
      {activeView === 'store' && (
        <div className="space-y-6">
          {/* Search & Category Filter Toolbar */}
          <div className="bg-surface rounded-xl border border-border p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-text-secondary flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-primary" /> Filter:
              </span>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === 'ALL'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-ivory-100 hover:bg-ivory-200 text-text-secondary'
                }`}
              >
                All Apparel
              </button>
              <button
                onClick={() => setSelectedCategory('Hoodie')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === 'Hoodie'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-ivory-100 hover:bg-ivory-200 text-text-secondary'
                }`}
              >
                🧥 Hoodies
              </button>
              <button
                onClick={() => setSelectedCategory('T-Shirt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedCategory === 'T-Shirt'
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-ivory-100 hover:bg-ivory-200 text-text-secondary'
                }`}
              >
                👕 T-Shirts
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hoodies, t-shirts..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-text-primary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((item) => {
              const totalStock = getProductTotalStock(item);
              const isOutOfStock = totalStock === 0;

              return (
                <div
                  key={item.id}
                  className="border border-border rounded-xl bg-surface overflow-hidden shadow-subtle hover:shadow-card transition flex flex-col justify-between group"
                >
                  <div>
                    {/* Product Image */}
                    <div className="relative h-48 bg-ivory-200 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0F2942]/90 text-white backdrop-blur-xs">
                          {item.type || 'Apparel'}
                        </span>
                        {item.tag && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#1557B0] text-white">
                            {item.tag}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 right-2">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-status-error text-white">
                            Sold Out
                          </span>
                        ) : totalStock < 10 ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                            Only {totalStock} left
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-status-success text-white">
                            In Stock ({totalStock})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-text-primary leading-snug">
                          {item.name}
                        </h3>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Real-time Per-Size Stock Inventory Indicator */}
                      <div className="pt-2 border-t border-border space-y-1.5">
                        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block">
                          Available Sizes & Stock:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {item.sizeStock &&
                            Object.entries(item.sizeStock).map(([size, stock]) => (
                              <span
                                key={size}
                                className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                                  stock > 0
                                    ? 'bg-ivory-100 border-border text-text-primary'
                                    : 'bg-red-50 border-red-200 text-text-muted line-through opacity-60'
                                }`}
                                title={`${stock} remaining in size ${size}`}
                              >
                                {size}: <strong>{stock}</strong>
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Button */}
                  <div className="p-4 pt-2 border-t border-border flex items-center justify-between">
                    <div>
                      {isClubMember ? (
                        <div>
                          <span className="text-[10px] text-emerald-700 font-bold uppercase block">Club Member Price</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg font-bold text-emerald-700">
                              ${item.price.toFixed(2)}
                            </span>
                            <span className="text-xs text-text-muted line-through">
                              ${(item.price + 10).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-text-muted uppercase block">Standard Student Price</span>
                          <span className="text-lg font-bold text-text-primary">
                            ${(item.price + 10).toFixed(2)}
                          </span>
                          <span className="block text-[10px] text-amber-700 font-semibold">
                            Member Price: ${item.price.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenOrderModal(item)}
                      disabled={isOutOfStock}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-sm ${
                        isOutOfStock
                          ? 'bg-ivory-200 text-text-muted cursor-not-allowed'
                          : 'bg-primary hover:bg-primary-hover text-white active:scale-95'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'Out of Stock' : 'Order Now'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: MEMBER'S MERCHANDISE ORDER HISTORY */}
      {activeView === 'my-orders' && (
        <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-border gap-2">
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                My Merchandise Orders & Digital Passes
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Track your placed merchandise orders, payment status, and pickup verification
              </p>
            </div>
            <button
              onClick={() => setActiveView('store')}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition self-start sm:self-auto"
            >
              + Place New Order
            </button>
          </div>

          {myOrders.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-xs space-y-2">
              <Package className="w-8 h-8 mx-auto text-text-muted/60" />
              <p>You haven't placed any merchandise orders yet.</p>
              <button
                onClick={() => setActiveView('store')}
                className="text-primary font-semibold hover:underline"
              >
                Browse Skyline Hoodies and T-Shirts
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 rounded-xl border border-border bg-ivory-50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/40 transition"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={ord.image}
                      alt={ord.productName}
                      className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-primary">{ord.id}</span>
                        <span className="text-[11px] text-text-muted">• {ord.orderDate}</span>
                      </div>
                      <h4 className="text-sm font-bold text-text-primary">
                        {ord.productName}
                      </h4>
                      <p className="text-xs text-text-secondary flex items-center gap-2">
                        <span>
                          Size: <strong className="text-primary font-bold">{ord.size}</strong>
                        </span>
                        <span>•</span>
                        <span>Qty: <strong>{ord.quantity}</strong></span>
                        <span>•</span>
                        <span>Total: <strong className="text-accent">${ord.totalPrice.toFixed(2)}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Payment status badge */}
                    <div>
                      {ord.paymentStatus === 'PAID' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-status-success-bg text-status-success border border-status-success/30">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Paid ({ord.paymentMethod})
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3 mr-1" /> Payment Pending ({ord.paymentMethod})
                        </span>
                      )}
                    </div>

                    {/* Fulfillment status badge */}
                    <div>
                      {ord.fulfillmentStatus === 'COLLECTED' ? (
                        <span className="px-2.5 py-1 rounded text-xs font-semibold bg-ivory-200 text-text-secondary">
                          ✓ Collected
                        </span>
                      ) : ord.fulfillmentStatus === 'READY_FOR_PICKUP' ? (
                        <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
                          Ready for Pickup!
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded text-xs font-semibold bg-ivory-100 border border-border text-text-secondary">
                          Processing
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => setConfirmedOrder(ord)}
                      className="px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-ivory-100 text-xs font-semibold text-text-primary transition flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5 text-primary" />
                      <span>Digital Pass</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ORDER PLACEMENT & SIZE SELECTION MODAL */}
      {/* ========================================================= */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-border max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5 animate-scaleUp">
            <div className="flex justify-between items-start pb-3 border-b border-border">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white">
                  {selectedProduct.type} Order
                </span>
                <h3 className="text-xl font-bold text-text-primary mt-1">
                  {selectedProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-ivory-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{orderError}</span>
              </div>
            )}

            <form onSubmit={handlePlaceOrderSubmit} className="space-y-4">
              {/* Product preview */}
              <div className="flex items-center space-x-3.5 p-3 rounded-xl bg-ivory-100 border border-border">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-16 h-16 rounded-lg object-cover border border-border flex-shrink-0"
                />
                <div>
                  <p className="text-xs font-semibold text-text-primary">
                    Skyline Student Association Official Merchandise
                  </p>
                  <p className="text-lg font-bold text-primary mt-0.5">
                    ${selectedProduct.price.toFixed(2)} each
                  </p>
                  <span className="text-[11px] text-status-success font-medium">
                    ✓ Available for campus pickup at Skyline Student Lounge
                  </span>
                </div>
              </div>

              {/* CRITICAL REQUIREMENT: COLLECT THE MEMBER'S SIZE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center justify-between">
                  <span>1. Select Your Size <span className="text-red-500">*</span></span>
                  <span className="text-[11px] text-text-muted lowercase font-normal">
                    (Stock tracked per size)
                  </span>
                </label>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {selectedProduct.sizeStock &&
                    Object.entries(selectedProduct.sizeStock).map(([sz, stockCount]) => {
                      const isSelected = selectedSize === sz;
                      const hasStock = stockCount > 0;

                      return (
                        <button
                          type="button"
                          key={sz}
                          disabled={!hasStock}
                          onClick={() => {
                            setSelectedSize(sz);
                            setOrderError('');
                          }}
                          className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-sm scale-102'
                              : hasStock
                              ? 'bg-surface border-border text-text-primary hover:border-primary/50'
                              : 'bg-ivory-200 border-border/50 text-text-muted cursor-not-allowed opacity-50'
                          }`}
                        >
                          <span className="text-sm font-bold">{sz}</span>
                          <span
                            className={`text-[10px] mt-0.5 ${
                              isSelected
                                ? 'text-accent'
                                : hasStock
                                ? 'text-status-success font-semibold'
                                : 'text-red-500'
                            }`}
                          >
                            {hasStock ? `${stockCount} left` : 'Sold Out'}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
                <div>
                  <span className="text-xs font-semibold text-text-primary block">Quantity</span>
                  <span className="text-[10px] text-text-muted">
                    {selectedSize
                      ? `Max: ${selectedProduct.sizeStock?.[selectedSize] || 0} in size ${selectedSize}`
                      : 'Select size first'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 rounded border border-border bg-ivory-100 hover:bg-ivory-200 text-xs font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-text-primary">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const maxStock = selectedSize ? selectedProduct.sizeStock?.[selectedSize] || 1 : 1;
                      setQuantity(Math.min(maxStock, quantity + 1));
                    }}
                    className="w-7 h-7 rounded border border-border bg-ivory-100 hover:bg-ivory-200 text-xs font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Member Ordering Information */}
              <div className="p-3.5 rounded-xl bg-ivory-50 border border-border space-y-1.5 text-xs">
                <span className="font-semibold text-text-primary block">Ordering Member Details:</span>
                <div className="grid grid-cols-2 gap-2 text-text-secondary text-[11px]">
                  <div>
                    <span className="text-text-muted">Name:</span> {user?.name || 'Sophia Montgomery'}
                  </div>
                  <div>
                    <span className="text-text-muted">Student ID:</span> {user?.studentId || 'STU-2026-8842'}
                  </div>
                  <div className="col-span-2">
                    <span className="text-text-muted">Email:</span> {user?.email || 'student@university.edu'}
                  </div>
                </div>
              </div>

              {/* CRITICAL REQUIREMENT: RECORD PAYMENT / CHOOSE PAYMENT METHOD */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">
                  2. Choose Payment Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition ${
                      paymentMethod === 'Student Account (Bursar)'
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-border bg-surface text-text-secondary hover:bg-ivory-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Student Account (Bursar)"
                      checked={paymentMethod === 'Student Account (Bursar)'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary"
                    />
                    <Building className="w-4 h-4 text-primary" />
                    <div>
                      <span className="block leading-tight font-medium text-xs">Student ID / Bursar</span>
                      <span className="text-[10px] text-text-muted">Direct Campus Billing (Instant)</span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition ${
                      paymentMethod === 'Credit / Debit Card'
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-border bg-surface text-text-secondary hover:bg-ivory-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Credit / Debit Card"
                      checked={paymentMethod === 'Credit / Debit Card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary"
                    />
                    <CreditCard className="w-4 h-4 text-primary" />
                    <div>
                      <span className="block leading-tight font-medium text-xs">Credit / Debit Card</span>
                      <span className="text-[10px] text-text-muted">Visa, Mastercard, Amex</span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition ${
                      paymentMethod === 'Digital Wallet (Apple/Google Pay)'
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-border bg-surface text-text-secondary hover:bg-ivory-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Digital Wallet (Apple/Google Pay)"
                      checked={paymentMethod === 'Digital Wallet (Apple/Google Pay)'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary"
                    />
                    <Smartphone className="w-4 h-4 text-primary" />
                    <div>
                      <span className="block leading-tight font-medium text-xs">Apple / Google Pay</span>
                      <span className="text-[10px] text-text-muted">Fast 1-tap phone pay</span>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition ${
                      paymentMethod === 'Cash / Pay at Pickup'
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-border bg-surface text-text-secondary hover:bg-ivory-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Cash / Pay at Pickup"
                      checked={paymentMethod === 'Cash / Pay at Pickup'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary"
                    />
                    <Clock className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="block leading-tight font-medium text-xs">Pay at Counter</span>
                      <span className="text-[10px] text-text-muted">Reserve now, pay upon pickup</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div>
                <label className="text-[11px] font-semibold text-text-secondary block mb-1">
                  Order Pickup Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please leave with Skyline desk marshal..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-text-primary focus:outline-none focus:border-primary"
                />
              </div>

              {/* Total & Submit Button */}
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-text-muted uppercase block">Total Due</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">
                      ${(getProductPrice(selectedProduct) * quantity).toFixed(2)}
                    </span>
                    {isClubMember && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Member Rate
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="px-3.5 py-2 rounded-lg bg-surface border border-border text-xs font-semibold text-text-secondary hover:bg-ivory-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedSize}
                    className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <span>Processing Order...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-accent" />
                        <span>Place Online Order</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: CONFIRMED ORDER RECEIPT & DIGITAL PICKUP PASS */}
      {/* ========================================================= */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border-2 border-primary max-w-md w-full shadow-2xl p-6 space-y-4 animate-scaleUp relative">
            <button
              onClick={() => setConfirmedOrder(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-ivory-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-status-success/10 text-status-success mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                Skyline Student Association
              </span>
              <h3 className="text-xl font-bold text-text-primary">
                Order Confirmed!
              </h3>
              <p className="text-xs text-text-secondary">
                Your order is officially logged into the club inventory ledger.
              </p>
            </div>

            {/* Pass / Receipt Card */}
            <div className="p-4 rounded-xl bg-ivory-100 border border-border space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="text-xs font-mono font-bold text-primary">
                  Order ID: {confirmedOrder.id}
                </span>
                <span className="text-[11px] text-text-muted">{confirmedOrder.orderDate}</span>
              </div>

              <div className="flex items-center space-x-3">
                <img
                  src={confirmedOrder.image}
                  alt={confirmedOrder.productName}
                  className="w-12 h-12 rounded-lg object-cover border border-border"
                />
                <div>
                  <h4 className="text-sm font-bold text-text-primary">
                    {confirmedOrder.productName}
                  </h4>
                  <p className="text-xs text-text-secondary">
                    Size: <strong className="text-primary font-bold">{confirmedOrder.size}</strong> • Qty: <strong>{confirmedOrder.quantity}</strong>
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-muted text-[10px] uppercase block">Member</span>
                  <span className="font-semibold text-text-primary">{confirmedOrder.memberName}</span>
                  <span className="text-[11px] text-text-muted block">{confirmedOrder.studentId}</span>
                </div>
                <div>
                  <span className="text-text-muted text-[10px] uppercase block">Payment Status</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                      confirmedOrder.paymentStatus === 'PAID'
                        ? 'bg-status-success-bg text-status-success'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {confirmedOrder.paymentStatus === 'PAID' ? '✓ PAID' : 'PENDING'}
                  </span>
                  <span className="text-[10px] text-text-muted block mt-0.5">
                    {confirmedOrder.paymentMethod}
                  </span>
                </div>
              </div>

              {/* QR Verification for Pickup */}
              <div className="pt-3 border-t border-dashed border-border text-center space-y-1.5">
                <div className="inline-block p-2 bg-white rounded-lg border border-border shadow-xs">
                  <QrCode className="w-20 h-20 text-primary mx-auto" />
                </div>
                <p className="text-[10px] text-text-muted">
                  Present this digital QR pass at the Skyline Club Office for physical pickup.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  setActiveView('my-orders');
                }}
                className="w-full py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition"
              >
                View in My Orders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberMerchStore;
