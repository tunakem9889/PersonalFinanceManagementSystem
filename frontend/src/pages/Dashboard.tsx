import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { ExpensePieChart } from "../features/report/components/ExpensePieChart";
import { CashflowLineChart } from "../features/report/components/CashflowLineChart";
import { TransactionTimeline } from "../features/transaction/components/TransactionTimeline";
import { useDashboardSummary } from "../hooks/useReports";
import { useBudgets } from "../hooks/useBudgets";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from "lucide-react";
import { cn } from "../utils/cn";

function StatCard({ title, value, change, icon: Icon, valueColor }: {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  valueColor?: string;
}) {
  const positive = change !== undefined && change >= 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueColor)}>{value}</div>
        {change !== undefined && (
          <p className={cn("text-xs mt-1 flex items-center gap-1", positive ? "text-green-600" : "text-red-500")}>
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? "+" : ""}{change}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: budgets } = useBudgets();

  const fmt = (n: number) => n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="h-24 flex items-center justify-center">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardContent></Card>
          ))
        ) : (
          <>
            <StatCard title="Total Balance" value={fmt(summary?.totalBalance ?? 0)} icon={DollarSign} />
            <StatCard title="Income" value={`+${fmt(summary?.totalIncome ?? 0)}`} icon={TrendingUp} valueColor="text-green-600" />
            <StatCard title="Expenses" value={`-${fmt(summary?.totalExpenses ?? 0)}`} icon={TrendingDown} valueColor="text-red-600" />
            <StatCard title="Net Savings" value={fmt(summary?.totalSavings ?? 0)} icon={PiggyBank} />
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Cashflow Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Cashflow Overview</CardTitle>
            <CardDescription>Income vs Expenses over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <CashflowLineChart />
          </CardContent>
        </Card>

        {/* Expense Pie Chart */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>Where your money goes</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpensePieChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionTimeline />
          </CardContent>
        </Card>

        {/* Budget Status */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Status</CardTitle>
            <CardDescription>Monthly spending limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(budgets ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No budgets set.</p>
              ) : (budgets ?? []).slice(0, 4).map((budget) => {
                const pct = Math.min((budget.spentAmount / budget.limitAmount) * 100, 100);
                const overBudget = budget.spentAmount > budget.limitAmount;
                return (
                  <div key={budget.id}>
                    <div className="flex items-center justify-between mb-1.5 text-sm">
                      <span className="font-medium flex items-center gap-2">
                        <span>{`Category ${budget.categoryId}`}</span>
                      </span>
                      <span className={cn("text-muted-foreground", overBudget && "text-red-500 font-semibold")}>
                        {budget.spentAmount.toLocaleString("vi-VN")} ₫ / {budget.limitAmount.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", overBudget ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-blue-500")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
