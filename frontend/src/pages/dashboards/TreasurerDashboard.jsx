import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useMerchandise } from '../../context/MerchandiseContext';
import { UniversityCrest } from '../../components/common/UniversityCrest';
import { TREASURY_DATA } from '../../data/mockData';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Receipt,
  FileCheck2,
  FileSpreadsheet,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  Building,
  ShoppingBag,
  Package
} from 'lucide-react';

export const TreasurerDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { orders, recordPayment } = useMerchandise();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'overview';

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const [reimbursements, setReimbursements] = useState(TREASURY_DATA.reimbursements);
  const [selectedReceiptModal, setSelectedReceiptModal] = useState(null);
  const [notification, setNotification] = useState(null);

  // Approve / Reject reimbursement
  const handleAction = (id, newStatus) => {
    setReimbursements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    setNotification(`Reimbursement #${id} has been marked as ${newStatus}.`);
    setTimeout(() => setNotification(null), 3500);
  };

  const paidMerchRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingMerchRevenue = orders
    .filter((o) => o.paymentStatus === 'PENDING')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const tabs = [
    { id: 'overview', label: 'Financial Overview', icon: LayoutDashboard },
    { id: 'merch', label: 'Merchandise Revenue', icon: ShoppingBag, badge: '$' + paidMerchRevenue.toFixed(0) },
    { id: 'income', label: 'Income Ledger', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses Tracker', icon: TrendingDown },
    { id: 'reimbursements', label: 'Reimbursements Queue', icon: Receipt, badge: reimbursements.filter(r => r.status === 'PENDING').length },
    { id: 'transactions', label: 'Transactions Audit Log', icon: FileCheck2 },
    { id: 'reports', label: 'Compliance Reports', icon: FileSpreadsheet }
  ];

  return (
    <div className="min-h-screen bg-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Treasurer Banner Header */}


        {notification && (
          <div className="p-3.5 rounded bg-status-success-bg border border-status-success/30 text-status-success text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{notification}</span>
            </div>
          </div>
        )}



        {/* Tab 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Fiscal KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <span className="text-xs font-medium text-text-secondary">Total Allocated Budget</span>
                <p className="text-2xl font-bold text-text-primary mt-2">
                  ${TREASURY_DATA.totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-text-muted">Ratified by Student Affairs</span>
              </div>

              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <span className="text-xs font-medium text-text-secondary">Current Operating Balance</span>
                <p className="text-2xl font-bold text-status-success mt-2">
                  ${TREASURY_DATA.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-status-success font-medium">Available for Disbursement</span>
              </div>

              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <span className="text-xs font-medium text-text-secondary">Total Expenses Disbursed</span>
                <p className="text-2xl font-bold text-primary mt-2">
                  ${TREASURY_DATA.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-text-muted">4 verified invoices</span>
              </div>

              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <span className="text-xs font-medium text-text-secondary">Pending Reimbursements</span>
                <p className="text-2xl font-bold text-status-warning mt-2">
                  ${reimbursements.filter(r => r.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                </p>
                <span className="text-[10px] text-status-warning font-medium">
                  {reimbursements.filter(r => r.status === 'PENDING').length} claims awaiting review
                </span>
              </div>
            </div>

            {/* Budget Utilization Progress Bar */}
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-text-primary">Fiscal Year Budget Consumption</span>
                <span className="font-mono text-primary font-bold">51.0% Consumed</span>
              </div>
              <div className="w-full bg-ivory-300 h-3 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '51%' }} />
              </div>
              <div className="flex justify-between text-[11px] text-text-muted pt-1">
                <span>Disbursed: $7,404.50</span>
                <span>Remaining: $8,345.50</span>
                <span>Cap: $14,500.00</span>
              </div>
            </div>

            {/* Inflow vs Outflow preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-status-success" />
                    <h2 className="text-base font-bold text-text-primary">
                      Recent Inflow (Revenue & Grants)
                    </h2>
                  </div>
                  <button onClick={() => setActiveTab('income')} className="text-xs font-semibold text-primary hover:underline">
                    View All →
                  </button>
                </div>
                <div className="divide-y divide-border text-xs">
                  {TREASURY_DATA.incomes.slice(0, 3).map((inc) => (
                    <div key={inc.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-text-primary">{inc.source}</p>
                        <p className="text-[11px] text-text-muted">{inc.category} • {inc.date}</p>
                      </div>
                      <span className="font-bold text-status-success">+${inc.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4 text-primary" />
                    <h2 className="text-base font-bold text-text-primary">
                      Recent Outflow (Disbursements)
                    </h2>
                  </div>
                  <button onClick={() => setActiveTab('expenses')} className="text-xs font-semibold text-primary hover:underline">
                    View All →
                  </button>
                </div>
                <div className="divide-y divide-border text-xs">
                  {TREASURY_DATA.expenses.slice(0, 3).map((exp) => (
                    <div key={exp.id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-text-primary">{exp.vendor}</p>
                        <p className="text-[11px] text-text-muted">{exp.description}</p>
                      </div>
                      <span className="font-bold text-primary">-${exp.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: INCOME LEDGER */}
        {activeTab === 'income' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="pb-3 border-b border-border flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    Income & Grant Inflows Ledger
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Official ledger of institutional grants, membership dues, and event ticket sales
                  </p>
                </div>
                <span className="text-xs font-semibold text-status-success">
                  Total Income: ${TREASURY_DATA.totalIncome.toFixed(2)}
                </span>
              </div>

              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Reference ID</th>
                      <th className="py-2.5 px-3">Source / Payee</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {TREASURY_DATA.incomes.map((inc) => (
                      <tr key={inc.id} className="hover:bg-ivory-50 transition">
                        <td className="py-2.5 px-3 font-mono font-medium text-primary">{inc.id}</td>
                        <td className="py-2.5 px-3 font-semibold text-text-primary">{inc.source}</td>
                        <td className="py-2.5 px-3 text-text-secondary">{inc.category}</td>
                        <td className="py-2.5 px-3 font-bold text-status-success">+${inc.amount.toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-text-muted">{inc.date}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-status-success-bg text-status-success border border-status-success/30">
                            {inc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: EXPENSES TRACKER */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="pb-3 border-b border-border flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    Disbursements & Operational Expenses
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Audited payments for components, hospitality, print, and competition travel
                  </p>
                </div>
                <span className="text-xs font-semibold text-primary">
                  Total Expenses: ${TREASURY_DATA.totalExpenses.toFixed(2)}
                </span>
              </div>

              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Reference</th>
                      <th className="py-2.5 px-3">Vendor / Payee</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Receipt Document</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {TREASURY_DATA.expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-ivory-50 transition">
                        <td className="py-2.5 px-3 font-mono font-medium text-primary">{exp.id}</td>
                        <td className="py-2.5 px-3 font-semibold text-text-primary">{exp.vendor}</td>
                        <td className="py-2.5 px-3 text-text-secondary">{exp.description}</td>
                        <td className="py-2.5 px-3 text-text-muted">{exp.category}</td>
                        <td className="py-2.5 px-3 font-bold text-primary">-${exp.amount.toFixed(2)}</td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => alert(`Opening official university archived voucher: ${exp.receipt}`)}
                            className="font-mono text-accent hover:underline flex items-center gap-1"
                          >
                            <span>{exp.receipt}</span>
                            <Eye className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: REIMBURSEMENTS APPROVAL QUEUE */}
        {activeTab === 'reimbursements' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="pb-3 border-b border-border flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    Student & Officer Reimbursement Queue
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Review uploaded itemized receipts and approve direct deposit refunds
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-100 text-text-secondary font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-3">Claim ID</th>
                      <th className="py-2.5 px-3">Claimant</th>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Receipt Attachment</th>
                      <th className="py-2.5 px-3">Current Status</th>
                      <th className="py-2.5 px-3 text-right">Comptroller Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reimbursements.map((rmb) => (
                      <tr key={rmb.id} className="hover:bg-ivory-50 transition">
                        <td className="py-2.5 px-3 font-mono font-medium text-primary">{rmb.id}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-text-primary">{rmb.claimant}</p>
                          <p className="text-[10px] font-mono text-text-muted">{rmb.studentId}</p>
                        </td>
                        <td className="py-2.5 px-3 text-text-secondary">{rmb.item}</td>
                        <td className="py-2.5 px-3 font-bold text-text-primary">${rmb.amount.toFixed(2)}</td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => alert(`Reviewing attached receipt for ${rmb.claimant}: ${rmb.receipt}`)}
                            className="font-mono text-accent hover:underline flex items-center gap-1"
                          >
                            <span>{rmb.receipt}</span>
                            <Eye className="w-3 h-3" />
                          </button>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              rmb.status === 'APPROVED'
                                ? 'bg-status-success-bg text-status-success border border-status-success/30'
                                : rmb.status === 'REJECTED'
                                ? 'bg-status-error-bg text-status-error border border-status-error/30'
                                : 'bg-status-warning-bg text-status-warning border border-status-warning/30'
                            }`}
                          >
                            {rmb.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1.5">
                          {rmb.status === 'PENDING' ? (
                            <>
                              <button
                                onClick={() => handleAction(rmb.id, 'APPROVED')}
                                className="px-2.5 py-1 bg-status-success text-white hover:bg-status-success/90 rounded text-[11px] font-semibold transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(rmb.id, 'REJECTED')}
                                className="px-2.5 py-1 bg-surface border border-border text-status-error hover:bg-status-error-bg rounded text-[11px] font-semibold transition"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-text-muted italic">Audited</span>
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

        {/* Tab: MERCHANDISE REVENUE AUDIT */}
        {activeTab === 'merch' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Total Merch Revenue Collected
                </span>
                <p className="text-2xl font-bold text-status-success mt-1">
                  ${paidMerchRevenue.toFixed(2)}
                </p>
                <span className="text-[11px] text-text-muted">Cleared & recorded in Bursar account</span>
              </div>
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Pending Order Collections
                </span>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  ${pendingMerchRevenue.toFixed(2)}
                </p>
                <span className="text-[11px] text-amber-700 font-medium">To be collected upon counter pickup</span>
              </div>
              <div className="p-5 rounded-xl bg-surface border border-border shadow-subtle">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Total Orders Audited
                </span>
                <p className="text-2xl font-bold text-primary mt-1">
                  {orders.length} Orders
                </p>
                <span className="text-[11px] text-text-muted">Direct digital order logs</span>
              </div>
            </div>

            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="pb-3 border-b border-border flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
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
                        <td className="py-3.5 px-4 font-bold text-primary text-sm">
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

        {/* Tab 5: TRANSACTIONS AUDIT LOG */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="pb-3 border-b border-border">
                <h2 className="text-xl font-bold text-text-primary">
                  Cryptographic Transaction Ledger
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  Immutable university journal of all debits, credits, and officer sign-offs
                </p>
              </div>

              <div className="p-4 bg-ivory-100 rounded border border-border text-xs text-text-secondary space-y-2">
                <p className="font-mono text-primary font-bold">Ledger Integrity Hash: #SHA256-UNIV-TREAS-2026-9817</p>
                <p>All transactions are verified against the Bursar Student Organization account.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: COMPLIANCE REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="bg-surface rounded-xl border border-border p-6 shadow-subtle space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-border">
                <div>
                  <h2 className="text-xl font-bold text-text-primary">
                    Bursar & Audit Compliance Exports
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Official financial statements certified for semester tax exemption and grant renewals
                  </p>
                </div>
                <button
                  onClick={() => alert('Generating Fall 2026 Financial Audit Statement PDF...')}
                  className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Audited Statement (PDF)</span>
                </button>
              </div>

              <div className="p-4 bg-status-success-bg/40 border border-status-success/30 rounded text-xs text-status-success flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Audited by University Student Organization Comptroller on Oct 01, 2026. Zero discrepancies noted.</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TreasurerDashboard;
