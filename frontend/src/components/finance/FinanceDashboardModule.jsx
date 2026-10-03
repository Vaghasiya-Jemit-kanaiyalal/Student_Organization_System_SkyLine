import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { FinanceHeader } from './FinanceHeader';
import { FinancialSummaryCards } from './FinancialSummaryCards';
import { IncomeExpenseChart } from './IncomeExpenseChart';
import { BalanceOverviewWidget } from './BalanceOverviewWidget';
import { IncomeBreakdownCard } from './IncomeBreakdownCard';
import { ExpenseBreakdownCard } from './ExpenseBreakdownCard';
import { PendingReimbursementsSection } from './PendingReimbursementsSection';
import { RecentTransactionsSection } from './RecentTransactionsSection';
import { FinancialAlertsSection } from './FinancialAlertsSection';
import { BudgetOverviewSection } from './BudgetOverviewSection';
import { PeriodSummaryFooter } from './PeriodSummaryFooter';

// Modals
import { AddIncomeModal } from './AddIncomeModal';
import { AddExpenseModal } from './AddExpenseModal';
import { ReimbursementReviewModal } from './ReimbursementReviewModal';
import { GenerateReportModal } from './GenerateReportModal';
import { ConfigureBudgetModal } from './ConfigureBudgetModal';

// Sub Views
import { IncomeManagementView } from './views/IncomeManagementView';
import { ExpenseManagementView } from './views/ExpenseManagementView';
import { ReimbursementsView } from './views/ReimbursementsView';
import { FinanceReportsView } from './views/FinanceReportsView';

export const FinanceDashboardModule = ({ activeSubView = 'dashboard', setActiveSubView }) => {
  const { setIncomeCategoryFilter, setExpenseCategoryFilter } = useFinance();

  // Modals state
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isConfigureBudgetOpen, setIsConfigureBudgetOpen] = useState(false);
  const [reviewRequest, setReviewRequest] = useState(null);

  // Drilldown to category filtered income view
  const handleNavigateToIncomeCategory = (category) => {
    setIncomeCategoryFilter(category);
    setActiveSubView('income');
  };

  // Drilldown to category filtered expense view
  const handleNavigateToExpenseCategory = (category) => {
    setExpenseCategoryFilter(category);
    setActiveSubView('expenses');
  };

  const handleReviewRequest = (req) => {
    setReviewRequest(req);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View 1: Main Finance Dashboard */}
      {activeSubView === 'dashboard' && (
        <div className="space-y-6">
          {/* Page Header with Quick Actions & Period Controls */}
          <FinanceHeader
            onOpenAddIncome={() => setIsAddIncomeOpen(true)}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
            onOpenReport={() => setIsReportOpen(true)}
            onNavigateToReimbursements={() => setActiveSubView('reimbursements')}
          />

          {/* Attention & Financial Alerts Section */}
          <FinancialAlertsSection
            onTriggerAlertAction={(tab) => {
              if (tab === 'reimbursements') setActiveSubView('reimbursements');
              else if (tab === 'expenses') setActiveSubView('expenses');
              else if (tab === 'income') setActiveSubView('income');
            }}
          />

          {/* 1. Financial Summary KPI Cards */}
          <FinancialSummaryCards onNavigate={(view) => setActiveSubView(view)} />

          {/* 2 & 3. Income vs Expense Chart & Balance Overview Waterfall */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeExpenseChart />
            <BalanceOverviewWidget />
          </div>

          {/* 4 & 5. Income Streams & Expense Allocations Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeBreakdownCard onNavigateToIncomeCategory={handleNavigateToIncomeCategory} />
            <ExpenseBreakdownCard onNavigateToExpenseCategory={handleNavigateToExpenseCategory} />
          </div>

          {/* 6. Pending Reimbursements Section */}
          <PendingReimbursementsSection
            onReviewRequest={handleReviewRequest}
            onNavigateToReimbursements={() => setActiveSubView('reimbursements')}
          />

          {/* 7. Recent Transactions Table */}
          <RecentTransactionsSection onNavigateToLedger={(view) => setActiveSubView(view)} />

          {/* 9. Institutional Budget Allocation Overview */}
          <BudgetOverviewSection onOpenConfigureBudget={() => setIsConfigureBudgetOpen(true)} />

          {/* 10. Financial Period Summary Equation */}
          <PeriodSummaryFooter />
        </div>
      )}

      {/* View 2: Income Management */}
      {activeSubView === 'income' && (
        <IncomeManagementView
          onBack={() => setActiveSubView('dashboard')}
          onOpenAddIncome={() => setIsAddIncomeOpen(true)}
        />
      )}

      {/* View 3: Expense Management */}
      {activeSubView === 'expenses' && (
        <ExpenseManagementView
          onBack={() => setActiveSubView('dashboard')}
          onOpenAddExpense={() => setIsAddExpenseOpen(true)}
        />
      )}

      {/* View 4: Reimbursement Requests Queue */}
      {activeSubView === 'reimbursements' && (
        <ReimbursementsView
          onBack={() => setActiveSubView('dashboard')}
          onReviewRequest={handleReviewRequest}
        />
      )}

      {/* View 5: Reports & Analytics */}
      {activeSubView === 'reports' && (
        <FinanceReportsView
          onBack={() => setActiveSubView('dashboard')}
          onOpenReportModal={() => setIsReportOpen(true)}
        />
      )}

      {/* Global Modals */}
      <AddIncomeModal isOpen={isAddIncomeOpen} onClose={() => setIsAddIncomeOpen(false)} />
      <AddExpenseModal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} />
      <ReimbursementReviewModal
        isOpen={!!reviewRequest}
        request={reviewRequest}
        onClose={() => setReviewRequest(null)}
      />
      <GenerateReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <ConfigureBudgetModal
        isOpen={isConfigureBudgetOpen}
        onClose={() => setIsConfigureBudgetOpen(false)}
      />
    </div>
  );
};
