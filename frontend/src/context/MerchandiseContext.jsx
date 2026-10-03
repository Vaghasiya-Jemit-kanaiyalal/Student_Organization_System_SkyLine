import React, { createContext, useContext, useState, useEffect } from 'react';

const MerchandiseContext = createContext(null);

// Initial default merchandise for Skyline Student Association
const DEFAULT_PRODUCTS = [
  {
    id: 'mch-101',
    name: 'Skyline SSA Heavyweight Crest Hoodie',
    type: 'Hoodie',
    category: 'Hoodies',
    price: 38.00,
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
    price: 20.00,
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
    price: 44.00,
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
    price: 22.00,
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
    unitPrice: 38.00,
    totalPrice: 38.00,
    memberId: 'usr-member-001',
    memberName: 'Sophia Montgomery',
    studentId: 'STU-2026-8842',
    memberEmail: 'student@university.edu',
    paymentStatus: 'PAID',
    paymentMethod: 'Student ID Account (Bursar)',
    paymentDate: '2026-10-01 14:32',
    fulfillmentStatus: 'READY_FOR_PICKUP',
    orderDate: 'Oct 01, 2026 • 2:32 PM',
    notes: 'Order placed via Mobile Web'
  },
  {
    id: 'ORD-2026-902',
    productId: 'mch-102',
    productName: 'Skyline Club Signature Cotton T-Shirt',
    productType: 'T-Shirt',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    size: 'L',
    quantity: 2,
    unitPrice: 20.00,
    totalPrice: 40.00,
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
  },
  {
    id: 'ORD-2026-903',
    productId: 'mch-101',
    productName: 'Skyline SSA Heavyweight Crest Hoodie',
    productType: 'Hoodie',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    size: 'XL',
    quantity: 1,
    unitPrice: 38.00,
    totalPrice: 38.00,
    memberId: 'mem-104',
    memberName: 'Elena Rostova',
    studentId: 'STU-2026-6733',
    memberEmail: 'elena.r@university.edu',
    paymentStatus: 'PENDING',
    paymentMethod: 'Cash upon Pickup',
    paymentDate: null,
    fulfillmentStatus: 'ORDERED',
    orderDate: 'Oct 03, 2026 • 11:20 AM',
    notes: 'Reserved online; payment pending at club counter'
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

  // Helper to compute total remaining stock across all sizes for a product
  const getProductTotalStock = (product) => {
    if (!product || !product.sizeStock) return 0;
    return Object.values(product.sizeStock).reduce((sum, count) => sum + (Number(count) || 0), 0);
  };

  // Add new hoodie or t-shirt product
  const addProduct = (newProduct) => {
    const productWithId = {
      ...newProduct,
      id: `mch-${Date.now().toString().slice(-4)}`,
      price: parseFloat(newProduct.price) || 0,
      sizeStock: newProduct.sizeStock || { S: 10, M: 20, L: 15, XL: 5 }
    };
    setProducts((prev) => [productWithId, ...prev]);
    return productWithId;
  };

  // Update existing product
  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            ...updatedFields,
            price: updatedFields.price !== undefined ? parseFloat(updatedFields.price) : item.price
          };
        }
        return item;
      })
    );
  };

  // Delete product
  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  // Update specific size stock directly (e.g. restock 10 Mediums)
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

  // Place online order (validates stock, decrements chosen size, creates order)
  const placeOrder = ({
    productId,
    size,
    quantity = 1,
    member,
    paymentMethod,
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

    // Decrement stock for the specific size
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

    const unitPrice = customUnitPrice !== undefined ? parseFloat(customUnitPrice) : product.price;
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
      memberName: member.name || 'Student Member',
      studentId: member.studentId || 'STU-2026',
      memberEmail: member.email || 'student@university.edu',
      paymentStatus: paymentStatus, // 'PAID' or 'PENDING'
      paymentMethod: paymentMethod,
      paymentDate: paymentStatus === 'PAID' ? new Date().toISOString() : null,
      fulfillmentStatus: 'ORDERED',
      orderDate: formattedDate,
      notes: notes || 'Online Mobile Order'
    };

    setOrders((prev) => [newOrder, ...prev]);

    return {
      success: true,
      order: newOrder
    };
  };

  // Record or update payment for an order
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

  // Update fulfillment status (ORDERED -> READY_FOR_PICKUP -> COLLECTED)
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
