import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { ExpensePieChart } from "../features/report/components/ExpensePieChart";
import { CashflowLineChart } from "../features/report/components/CashflowLineChart";
import { useDashboardSummary, useDailyReport, useWeeklyReport } from "../hooks/useReports";
import { TrendingUp, TrendingDown, DollarSign, BarChart2, Calendar } from "lucide-react";
import { cn } from "../utils/cn";

const PERIODS = ["This Month", "Last Month", "This Year", "Last Year"] as const;
type Period = typeof PERIODS[number];
const PERIOD_MAP: Record<Period, string> = {
  "This Month": "month",
  "Last Month": "last_month",
  "This Year": "year",
  "Last Year": "last_year",
};

type ViewMode = "overview" | "daily" | "weekly";

function getDateRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

function DailyTable() {
  const { startDate, endDate } = getDateRange(30);
  const { data = [], isLoading } = useDailyReport(startDate, endDate);

  if (isLoading) return <div className="h-[300px] flex items-center justify-center text-muted-foreground animate-pulse">Loading...</div>;
  if (data.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No daily data available.</div>;

  return (
    <div className="overflow-x-auto max-h-[400px]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background border-b">
          <tr className="text-muted-foreground text-left">
            <th className="py-2 pr-4 font-medium">Date</th>
            <th className="py-2 pr-4 font-medium text-green-600">Income</th>
            <th className="py-2 pr-4 font-medium text-red-500">Expense</th>
            <th className="py-2 font-medium">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row) => (
            <tr key={row.date} className="hover:bg-muted/40">
              <td className="py-2 pr-4">{row.date}</td>
              <td className="py-2 pr-4 text-green-600">+{row.income.toLocaleString("vi-VN")} ₫</td>
              <td className="py-2 pr-4 text-red-500">-{row.expense.toLocaleString("vi-VN")} ₫</td>
              <td className={cn("py-2 font-medium", row.balance >= 0 ? "text-green-600" : "text-red-500")}>
                {row.balance.toLocaleString("vi-VN")} ₫
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WeeklyTable() {
  const { startDate, endDate } = getDateRange(90);
  const { data = [], isLoading } = useWeeklyReport(startDate, endDate);

  if (isLoading) return <div className="h-[300px] flex items-center justify-center text-muted-foreground animate-pulse">Loading...</div>;
  if (data.length === 0) return <div className="h-[300px] flex items-center justify-center text-muted-foreground">No weekly data available.</div>;

  return (
    <div className="overflow-x-auto max-h-[400px]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background border-b">
          <tr className="text-muted-foreground text-left">
            <th className="py-2 pr-4 font-medium">Week</th>
            <th className="py-2 pr-4 font-medium text-green-600">Income</th>
            <th className="py-2 pr-4 font-medium text-red-500">Expense</th>
            <th className="py-2 font-medium">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row) => (
            <tr key={row.weekStart} className="hover:bg-muted/40">
              <td className="py-2 pr-4 text-xs">{row.weekStart} → {row.weekEnd}</td>
              <td className="py-2 pr-4 text-green-600">+{row.income.toLocaleString("vi-VN")} ₫</td>
              <td className="py-2 pr-4 text-red-500">-{row.expense.toLocaleString("vi-VN")} ₫</td>
              <td className={cn("py-2 font-medium", row.balance >= 0 ? "text-green-600" : "text-red-500")}>
                {row.balance.toLocaleString("vi-VN")} ₫
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState<Period>("This Month");
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const { data: summary, isLoading } = useDashboardSummary();

  const fmt = (n: number) => n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>

        {/* View mode switcher */}
        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
          {([
            { id: "overview" as ViewMode, label: "Overview", Icon: BarChart2 },
            { id: "daily" as ViewMode, label: "Daily", Icon: Calendar },
            { id: "weekly" as ViewMode, label: "Weekly", Icon: TrendingUp },
          ]).map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-sm transition-colors",
                viewMode === id ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}><CardContent className="h-24 animate-pulse" /></Card>
        )) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Income</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{fmt(summary?.totalIncome ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">All time income</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{fmt(summary?.totalExpenses ?? 0)}</div>
                <p className="text-xs text-muted-foreground mt-1">All time expenses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Net Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", (summary?.totalSavings ?? 0) >= 0 ? "text-green-600" : "text-red-500")}>
                  {fmt(summary?.totalSavings ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Income minus expenses</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Overview Mode */}
      {viewMode === "overview" && (
        <>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Period:</span>
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "h-9 rounded-md px-3 text-sm transition-colors",
                  period === p ? "bg-primary text-primary-foreground" : "border border-input bg-background hover:bg-accent"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Income & Expenses Trend</CardTitle>
                <CardDescription>Visualize your cash flow over time (monthly)</CardDescription>
              </CardHeader>
              <CardContent>
                <CashflowLineChart period={PERIOD_MAP[period]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense by Category</CardTitle>
                <CardDescription>Breakdown of where your money went</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpensePieChart period={PERIOD_MAP[period]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income by Source</CardTitle>
                <CardDescription>Breakdown of your revenue streams</CardDescription>
              </CardHeader>
              <CardContent>
                <ExpensePieChart period={PERIOD_MAP[period]} />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Daily Mode */}
      {viewMode === "daily" && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Statistics</CardTitle>
            <CardDescription>Income, expense and balance per day (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <DailyTable />
          </CardContent>
        </Card>
      )}

      {/* Weekly Mode */}
      {viewMode === "weekly" && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Statistics</CardTitle>
            <CardDescription>Income, expense and balance per week (last 90 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyTable />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
