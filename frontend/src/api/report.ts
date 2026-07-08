import api from "../services/axios";

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  incomeExpenseRatio: number;
}

export interface CashflowPoint {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface DailyPoint {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface WeeklyPoint {
  weekStart: string;
  weekEnd: string;
  income: number;
  expense: number;
  balance: number;
}

export interface ExpenseByCategory {
  name: string;
  value: number;
  color: string;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Colors for category chart
const COLORS = ["#3B82F6", "#6B7280", "#EC4899", "#F97316", "#8B5CF6", "#10B981", "#F43F5E", "#EAB308"];

export const reportApi = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await api.get('/api/reports/summary');
    const data = response.data;
    return {
      totalBalance: data.totalAssets ?? 0,
      totalIncome: data.totalIncome ?? 0,
      totalExpenses: data.totalExpense ?? 0,
      totalSavings: data.netBalance ?? 0,
      incomeExpenseRatio: data.incomeExpenseRatio ?? 0,
    };
  },

  getCashflow: async (period?: string): Promise<CashflowPoint[]> => {
    const now = new Date();
    let year = now.getFullYear();
    if (period === "last_year") year -= 1;

    const response = await api.get('/api/reports/trend', { params: { year } });
    const trend = response.data.monthlyTrend || [];

    return trend.map((t: Record<string, unknown>) => ({
      month: MONTH_NAMES[(t.month as number) - 1] ?? String(t.month),
      income: (t.income as number) ?? 0,
      expenses: (t.expense as number) ?? 0,  // backend field is "expense" not "expenses"
      balance: (t.balance as number) ?? 0,
    }));
  },

  getExpenseByCategory: async (period?: string): Promise<ExpenseByCategory[]> => {
    const now = new Date();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    if (period === "last_month") {
      month -= 1;
      if (month === 0) { month = 12; year -= 1; }
    } else if (period === "last_year") {
      year -= 1;
    }

    const response = await api.get('/api/reports/category', { params: { month, year } });
    const expensesByCategory = response.data.expensesByCategory || {};

    return Object.keys(expensesByCategory).map((name, index) => ({
      name,
      value: expensesByCategory[name] as number,
      color: COLORS[index % COLORS.length],
    }));
  },

  getMonthlyReport: async (month: number, year: number): Promise<{ totalIncome: number; totalExpense: number; balance: number }> => {
    const response = await api.get('/api/reports/monthly', { params: { month, year } });
    return {
      totalIncome: response.data.totalIncome ?? 0,
      totalExpense: response.data.totalExpense ?? 0,
      balance: response.data.balance ?? 0,
    };
  },

  getDailyReport: async (startDate: string, endDate: string): Promise<DailyPoint[]> => {
    const response = await api.get('/api/reports/daily', { params: { startDate, endDate } });
    return (response.data.dailyStatistics || []) as DailyPoint[];
  },

  getWeeklyReport: async (startDate: string, endDate: string): Promise<WeeklyPoint[]> => {
    const response = await api.get('/api/reports/weekly', { params: { startDate, endDate } });
    return (response.data.weeklyStatistics || []) as WeeklyPoint[];
  },
};
