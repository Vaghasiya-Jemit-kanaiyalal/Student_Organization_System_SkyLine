import React, { createContext, useContext, useState, useEffect } from 'react';

const MerchandiseContext = createContext(null);

// Initial default merchandise with Regular Price and Member Price
const DEFAULT_PRODUCTS = [
  {
    id: 'mch-101',
    name: 'Skyline SSA Heavyweight Crest Hoodie',
    type: 'Hoodie',
    category: 'Hoodies',
    regularPrice: 1000.00,
    memberPrice: 800.00,
    price: 1000.00,
    tag: 'Official Skyline',
    description: 'Collegiate heavyweight fleece hoodie with embroidered Skyline Student Association crest, warm front pouch pocket, and ribbed cuffs.',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    sizeStock: {
      'S': 12,
      'M': 24,
      'L': 18,
      'XL': 8,
      '2XL': 4
    }
  },
  {
    id: 'mch-102',
    name: 'Skyline Club Signature Cotton T-Shirt',
    type: 'T-Shirt',
    category: 'T-Shirts',
    regularPrice: 500.00,
    memberPrice: 350.00,
    price: 500.00,
    tag: 'Bestseller',
    description: '100% ring-spun organic cotton breathable T-shirt featuring the Skyline modern club emblem on the chest and athletic fit.',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    sizeStock: {
      'XS': 6,
      'S': 20,
      'M': 35,
      'L': 25,
      'XL': 15,
      '2XL': 8
    }
  },
  {
    id: 'mch-103',
    name: 'Skyline Athletic Zip-Up Tech Hoodie',
    type: 'Hoodie',
    category: 'Hoodies',
    regularPrice: 1200.00,
    memberPrice: 950.00,
    price: 1200.00,
    tag: 'New Release',
    description: 'Performance stretch thermal zip-up hoodie with Skyline Association badge, zippered phone pocket, and athletic drawstrings.',
    image: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80',
    sizeStock: {
      'S': 8,
      'M': 16,
      'L': 12,
      'XL': 6,
      '2XL': 3
    }
  },
  {
    id: 'mch-104',
    name: 'Skyline Vintage Campus Graphic T-Shirt',
    type: 'T-Shirt',
    category: 'T-Shirts',
    regularPrice: 600.00,
    memberPrice: 450.00,
    price: 600.00,
    tag: 'Heritage Edition',
    description: 'Retro washed collegiate tee with distressed Skyline Student Association typography and ultra-soft pre-shrunk cotton.',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80',
    sizeStock: {
      'S': 14,
      'M': 28,
      'L': 22,
      'XL': 10,
      '2XL': 5
    }
  }
];

const DEFAULT_ORDERS = [
  {
    id: 'ORD-2026-901',
    productId: 'mch-101',
    productName: 'Skyline SSA Heavyweight Crest Hoodie',
    productType: 'Hoodie',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    size: 'M',
    quantity: 1,
    unitPrice: 800.00,
    totalPrice: 800.00,
    memberId: 'usr-member-001',
    memberName: 'Sophia Montgomery',
    studentId: 'STU-2026-8842',
    memberEmail: 'student@university.edu',
    paymentStatus: 'PAID',
    paymentMethod: 'Student ID Account (Bursar)',
    paymentDate: '2026-10-01 14:32',
    fulfillmentStatus: 'READY_FOR_PICKUP',
    orderDate: 'Oct 01, 2026 • 2:32 PM',
    notes: 'Order placed with Member Discount (Saved ₹200)'
  },
  {
    id: 'ORD-2026-902',
    productId: 'mch-102',
    productName: 'Skyline Club Signature Cotton T-Shirt',
    productType: 'T-Shirt',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    size: 'L',
    quantity: 2,
    unitPrice: 350.00,
    totalPrice: 700.00,
    memberId: 'mem-105',
    memberName: 'Julian Chen',
    studentId: 'STU-2026-9021',
    memberEmail: 'julian.c@university.edu',
    paymentStatus: 'PAID',
    paymentMethod: 'Credit / Debit Card',
    paymentDate: '2026-10-02 09:15',
    fulfillmentStatus: 'COLLECTED',
    orderDate: 'Oct 02, 2026 • 9:15 AM',
    notes: 'Picked up at Student Union desk'
  }
];

export const MerchandiseProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('skyline_merchandise_products');
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('skyline_merchandise_orders');
      return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
    } catch {
      return DEFAULT_ORDERS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('skyline_merchandise_products', JSON.stringify(products));
    } catch (e) {
      console.error('Failed to sync products', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('skyline_merchandise_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to sync orders', e);
    }
  }, [orders]);

  const getProductTotalStock = (product) => {
    if (!product || !product.sizeStock) return 0;
    return Object.values(product.sizeStock).reduce((sum, count) => sum + (Number(count) || 0), 0);
  };

  /**
   * Pricing Calculator based on Student Membership Status
   */
  const getProductPricing = (product, isMember = false) => {
    const regular = parseFloat(product.regularPrice || product.price || 1000);
    const member = parseFloat(product.memberPrice || regular * 0.8);
    const savings = Math.max(0, regular - member);

    if (isMember) {
      return {
        price: member,
        regularPrice: regular,
        memberPrice: member,
        savings: savings,
        isMemberDiscountApplied: true,
        message: `You saved ₹${savings}`,
        badge: 'Member Price'
      };
    }

    return {
      price: regular,
      regularPrice: regular,
      memberPrice: member,
      savings: savings,
      isMemberDiscountApplied: false,
      message: 'Member discount available',
      badge: 'Regular Price'
    };
  };

  const addProduct = (newProduct) => {
    const regular = parseFloat(newProduct.regularPrice || newProduct.price) || 1000.00;
    const member = parseFloat(newProduct.memberPrice) || (regular * 0.8);

    const productWithId = {
      ...newProduct,
      id: `mch-${Date.now().toString().slice(-4)}`,
      regularPrice: regular,
      memberPrice: member,
      price: regular,
      sizeStock: newProduct.sizeStock || { S: 10, M: 20, L: 15, XL: 5 }
    };
    setProducts((prev) => [productWithId, ...prev]);
    return productWithId;
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const regular = updatedFields.regularPrice !== undefined ? parseFloat(updatedFields.regularPrice) : (updatedFields.price !== undefined ? parseFloat(updatedFields.price) : item.regularPrice || item.price);
          const member = updatedFields.memberPrice !== undefined ? parseFloat(updatedFields.memberPrice) : (item.memberPrice || regular * 0.8);
          return {
            ...item,
            ...updatedFields,
            regularPrice: regular,
            memberPrice: member,
            price: regular
          };
        }
        return item;
      })
    );
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const updateSizeStock = (productId, size, quantity) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const currentSizeStock = { ...(item.sizeStock || {}) };
          currentSizeStock[size] = Math.max(0, parseInt(quantity, 10) || 0);
          return {
            ...item,
            sizeStock: currentSizeStock
          };
        }
        return item;
      })
    );
  };

  const placeOrder = ({
    productId,
    size,
    quantity = 1,
    member,
    paymentMethod = 'Student Account (Bursar)',
    paymentStatus = 'PAID',
    notes = '',
    unitPrice: customUnitPrice
  }) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      return { success: false, error: 'Product not found.' };
    }

    const availableSizeStock = product.sizeStock?.[size] || 0;
    if (availableSizeStock < quantity) {
      return {
        success: false,
        error: `Insufficient stock for size ${size}. Only ${availableSizeStock} item(s) left.`
      };
    }

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const newSizeStock = { ...p.sizeStock };
          newSizeStock[size] = Math.max(0, (newSizeStock[size] || 0) - quantity);
          return {
            ...p,
            sizeStock: newSizeStock
          };
        }
        return p;
      })
    );

    const isMember = member?.is_active_member || member?.membershipStatus === 'ACTIVE';
    const pricing = getProductPricing(product, isMember);
    const unitPrice = customUnitPrice !== undefined ? parseFloat(customUnitPrice) : pricing.price;
    const totalPrice = unitPrice * quantity;
    const newOrderId = `ORD-${Date.now().toString().slice(-4)}`;
    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newOrder = {
      id: newOrderId,
      productId: product.id,
      productName: product.name,
      productType: product.type || 'Apparel',
      image: product.image,
      size: size,
      quantity: quantity,
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      memberId: member.id || 'usr-guest',
      memberName: member.name || member.fullName || 'Student',
      studentId: member.studentId || member.student_id || 'STU-2026',
      memberEmail: member.email || 'student@university.edu',
      paymentStatus: paymentStatus,
      paymentMethod: paymentMethod,
      paymentDate: paymentStatus === 'PAID' ? new Date().toISOString() : null,
      fulfillmentStatus: 'ORDERED',
      orderDate: formattedDate,
      notes: notes || (isMember ? `Member pricing applied (${pricing.message})` : 'Regular order')
    };

    setOrders((prev) => [newOrder, ...prev]);

    return {
      success: true,
      order: newOrder
    };
  };

  const recordPayment = (orderId, status = 'PAID', method = null) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            paymentStatus: status,
            paymentDate: status === 'PAID' ? new Date().toISOString() : order.paymentDate,
            paymentMethod: method || order.paymentMethod
          };
        }
        return order;
      })
    );
  };

  const updateFulfillmentStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            fulfillmentStatus: newStatus
          };
        }
        return order;
      })
    );
  };

  return (
    <MerchandiseContext.Provider
      value={{
        products,
        orders,
        getProductTotalStock,
        getProductPricing,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSizeStock,
        placeOrder,
        recordPayment,
        updateFulfillmentStatus
      }}
    >
      {children}
    </MerchandiseContext.Provider>
  );
};

export const useMerchandise = () => {
  const context = useContext(MerchandiseContext);
  if (!context) {
    throw new Error('useMerchandise must be used within a MerchandiseProvider');
  }
  return context;
};

export default MerchandiseContext;
