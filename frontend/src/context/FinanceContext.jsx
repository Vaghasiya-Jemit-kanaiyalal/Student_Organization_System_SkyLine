import React, { createContext, useContext, useState, useMemo } from 'react';
import { INITIAL_FINANCE_DATA } from '../data/financeData';

const FinanceContext = createContext(null);

export const FinanceProvider = ({ children }) => {
  const [academicYear, setAcademicYear] = useState('Academic Year 2026–2027');
  const [dateRange, setDateRange] = useState('This Academic Year');
  const [incomes, setIncomes] = useState(INITIAL_FINANCE_DATA.incomes);
  const [expenses, setExpenses] = useState(INITIAL_FINANCE_DATA.expenses);
  const [reimbursements, setReimbursements] = useState(INITIAL_FINANCE_DATA.reimbursements);
  const [budgets, setBudgets] = useState(INITIAL_FINANCE_DATA.budgets);
  const [alerts, setAlerts] = useState(INITIAL_FINANCE_DATA.alerts);
  const [openingBalance, setOpeningBalance] = useState(0);

  // Filter state for navigation drill-downs
  const [incomeCategoryFilter, setIncomeCategoryFilter] = useState('ALL');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('ALL');

  // Add Income Action
  const addIncome = (newIncome) => {
    const entry = {
      ...newIncome,
      id: `TXN-INC-${Date.now().toString().slice(-4)}`,
      displayDate: newIncome.displayDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Cleared'
    };
    setIncomes((prev) => [entry, ...prev]);
  };

  // Add Expense Action
  const addExpense = (newExpense) => {
    const entry = {
      ...newExpense,
      id: `TXN-EXP-${Date.now().toString().slice(-4)}`,
      displayDate: newExpense.displayDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Audited'
    };
    setExpenses((prev) => [entry, ...prev]);
  };

  // Approve Reimbursement
  const approveReimbursement = (id) => {
    setReimbursements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Approved' } : r))
    );
  };

  // Reject Reimbursement
  const rejectReimbursement = (id) => {
    setReimbursements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Rejected' } : r))
    );
  };

  // Dismiss Alert
  const dismissAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  // Calculations
  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [incomes]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [expenses]);

  const pendingReimbursements = useMemo(() => {
    return reimbursements.filter((r) => r.status === 'Pending');
  }, [reimbursements]);

  const pendingReimbursementsTotal = useMemo(() => {
    return pendingReimbursements.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [pendingReimbursements]);

  const paidReimbursements = useMemo(() => {
    return reimbursements.filter((r) => r.status === 'Approved');
  }, [reimbursements]);

  const paidReimbursementsTotal = useMemo(() => {
    return paidReimbursements.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [paidReimbursements]);

  // Current Balance formula: Total Income - Total Expenses - Approved/Paid Reimbursements
  const currentBalance = useMemo(() => {
    return openingBalance + totalIncome - totalExpenses - paidReimbursementsTotal;
  }, [openingBalance, totalIncome, totalExpenses, paidReimbursementsTotal]);

  const netIncome = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  // Income Breakdown Categories
  const incomeBreakdown = useMemo(() => {
    const categories = [
      'Membership Fees',
      'Event Ticket Sales',
      'Merchandise Sales',
      'Fundraisers',
      'Donations',
      'Other Income'
    ];
    return categories.map((cat) => {
      const catIncomes = incomes.filter((item) => item.category === cat);
      const amount = catIncomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const percentage = totalIncome > 0 ? Math.round((amount / totalIncome) * 100) : 0;
      return { category: cat, amount, percentage, count: catIncomes.length };
    }).filter((cat) => cat.amount > 0 || cat.category === 'Other Income');
  }, [incomes, totalIncome]);

  // Expense Breakdown Categories
  const expenseBreakdown = useMemo(() => {
    const categories = [
      'Venue',
      'Equipment',
      'Merchandise Expenses',
      'Marketing / Printing',
      'Fundraiser Expenses',
      'Event Expenses',
      'Other Expenses'
    ];
    return categories.map((cat) => {
      const catExpenses = expenses.filter((item) => item.category === cat);
      const amount = catExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
      const percentage = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
      return { category: cat, amount, percentage, count: catExpenses.length };
    }).filter((cat) => cat.amount > 0 || cat.category === 'Other Expenses');
  }, [expenses, totalExpenses]);

  // Combined Recent Transactions
  const recentTransactions = useMemo(() => {
    const incList = incomes.map((i) => ({
      ...i,
      type: 'Income',
      description: i.title,
      vendorOrSource: i.source,
      sign: '+'
    }));
    const expList = expenses.map((e) => ({
      ...e,
      type: 'Expense',
      vendorOrSource: e.vendor,
      sign: '-'
    }));
    const rmbList = reimbursements.map((r) => ({
      ...r,
      type: 'Reimbursement',
      vendorOrSource: r.claimant,
      displayDate: r.submittedDate,
      sign: '-'
    }));

    return [...incList, ...expList, ...rmbList]
      .sort((a, b) => new Date(b.date || b.submittedDate || 0) - new Date(a.date || a.submittedDate || 0))
      .slice(0, 10);
  }, [incomes, expenses, reimbursements]);

  return (
    <FinanceContext.Provider
      value={{
        academicYear,
        setAcademicYear,
        dateRange,
        setDateRange,
        incomes,
        expenses,
        reimbursements,
        budgets,
        setBudgets,
        alerts,
        openingBalance,
        totalIncome,
        totalExpenses,
        currentBalance,
        netIncome,
        pendingReimbursements,
        pendingReimbursementsTotal,
        paidReimbursementsTotal,
        incomeBreakdown,
        expenseBreakdown,
        recentTransactions,
        incomeCategoryFilter,
        setIncomeCategoryFilter,
        expenseCategoryFilter,
        setExpenseCategoryFilter,
        addIncome,
        addExpense,
        approveReimbursement,
        rejectReimbursement,
        dismissAlert
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
