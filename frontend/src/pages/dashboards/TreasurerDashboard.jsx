import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMerchandise } from '../../context/MerchandiseContext';
import { FinanceDashboardModule } from '../../components/finance/FinanceDashboardModule';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

export const TreasurerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { orders, recordPayment } = useMerchandise();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab('overview');
    }
  }, [location.search]);

  const handleSubViewChange = (view) => {
    const tabName = view === 'dashboard' ? 'overview' : view;
    setActiveTab(tabName);
    navigate(`/treasurer/dashboard?tab=${tabName}`);
  };

  const paidMerchRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingMerchRevenue = orders
    .filter((o) => o.paymentStatus === 'PENDING')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  return (
    <div className="min-h-screen bg-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {notification && (
          <div className="p-3.5 rounded bg-status-success-bg border border-status-success/30 text-status-success text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{notification}</span>
            </div>
          </div>
        )}

        {/* Finance Dashboard & Subviews */}
        {activeTab !== 'merch' && (
          <FinanceDashboardModule
            activeSubView={activeTab === 'overview' ? 'dashboard' : activeTab}
            setActiveSubView={handleSubViewChange}
          />
        )}

        {/* Tab: MERCHANDISE REVENUE AUDIT */}
        {activeTab === 'merch' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Total Merch Revenue Collected
                </span>
                <p className="font-serif-academic text-2xl font-bold text-status-success mt-1">
                  ${paidMerchRevenue.toFixed(2)}
                </p>
                <span className="text-[11px] text-text-muted">Cleared & recorded in Bursar account</span>
              </div>
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Pending Order Collections
                </span>
                <p className="font-serif-academic text-2xl font-bold text-amber-700 mt-1">
                  ${pendingMerchRevenue.toFixed(2)}
                </p>
                <span className="text-[11px] text-amber-700 font-medium">To be collected upon counter pickup</span>
              </div>
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Total Orders Audited
                </span>
                <p className="font-serif-academic text-2xl font-bold text-primary mt-1">
                  {orders.length} Orders
                </p>
                <span className="text-[11px] text-text-muted">Direct digital order logs</span>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="pb-3 border-b border-border flex justify-between items-center">
                <div>
                  <h2 className="font-serif-academic text-xl font-bold text-text-primary">
                    Merchandise Sales & Payment Audit Ledger
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Official financial log of all member hoodie and T-shirt purchases, sizes ordered, and payment reconciliation
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Order ID & Date</th>
                      <th className="py-3 px-4">Member Info</th>
                      <th className="py-3 px-4">Product & Size</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Fiscal Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-ivory-50 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-primary">
                          {ord.id}
                          <span className="text-[11px] text-text-muted font-sans block">{ord.orderDate}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-text-primary block">{ord.memberName}</span>
                          <span className="text-[11px] font-mono text-text-secondary block">{ord.studentId}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-text-primary block">{ord.productName}</span>
                          <span className="text-[11px] text-text-secondary">Size: <strong>{ord.size}</strong> • Qty: {ord.quantity}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-primary font-serif-academic text-sm">
                          ${ord.totalPrice.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-text-secondary">
                          {ord.paymentMethod}
                        </td>
                        <td className="py-3.5 px-4">
                          {ord.paymentStatus === 'PAID' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-success-bg text-status-success border border-status-success/30">
                              ✓ Cleared
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {ord.paymentStatus === 'PENDING' ? (
                            <button
                              onClick={() => {
                                recordPayment(ord.id, 'PAID', 'Treasurer Audited Receipt');
                                setNotification(`Payment for Order #${ord.id} cleared and added to ledger.`);
                                setTimeout(() => setNotification(null), 3500);
                              }}
                              className="px-2.5 py-1 bg-status-success hover:bg-status-success/90 text-white rounded text-[11px] font-semibold transition"
                            >
                              Record Payment
                            </button>
                          ) : (
                            <span className="text-[11px] text-status-success font-medium">Reconciled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TreasurerDashboard;
