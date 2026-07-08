import { useState } from "react";
import { useBudgets, useCreateBudget, useDeleteBudget } from "../hooks/useBudgets";
import { useCategories } from "../hooks/useCategories";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "../utils/cn";
// @ts-ignore
import { useForm } from "react-hook-form";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Budgets() {
  const { data: budgets = [], isLoading } = useBudgets();
  const { data: categories = [] } = useCategories();
  const { mutate: createBudget, isPending } = useCreateBudget();
  const { mutate: deleteBudget } = useDeleteBudget();
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const now = new Date();
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const onSubmit = (data: any) => {
    createBudget(
      {
        categoryId: data.categoryId,
        limitAmount: Number(data.limitAmount),
        month: Number(data.month),
        year: Number(data.year),
      },
      { onSuccess: () => { reset(); setShowForm(false); } }
    );
  };

  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalLimit = budgets.reduce((sum, b) => sum + b.limitAmount, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + Math.max(0, b.limitAmount - b.spentAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Budgets</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Budget
        </button>
      </div>

      {/* Create Budget Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Budget</CardTitle>
            <CardDescription>Set a spending limit for a category by month/year</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select
                  {...register("categoryId", { required: true })}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select...</option>
                  {expenseCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Limit (đ)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("limitAmount", { required: true, min: 1 })}
                  placeholder="500000"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <select
                  {...register("month", { required: true })}
                  defaultValue={now.getMonth() + 1}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {MONTH_NAMES.map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <input
                  type="number"
                  {...register("year", { required: true })}
                  defaultValue={now.getFullYear()}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="col-span-2 md:col-span-4 flex gap-2 justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="inline-flex items-center justify-center rounded-md text-sm border border-input bg-background hover:bg-accent h-9 px-4">Cancel</button>
                <button type="submit" disabled={isPending} className="inline-flex items-center justify-center rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 disabled:opacity-50">
                  {isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>Track your spending limits by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2 animate-pulse">
                  <div className="flex justify-between">
                    <div className="h-3 bg-muted rounded w-28" />
                    <div className="h-3 bg-muted rounded w-16" />
                  </div>
                  <div className="h-2 bg-muted rounded-full" />
                </div>
              ))
            ) : budgets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No budgets yet. Create one above!</p>
            ) : budgets.map((budget) => {
              const pct = Math.min((budget.spentAmount / budget.limitAmount) * 100, 100);
              const over = budget.spentAmount > budget.limitAmount;
              const barColor = over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-blue-500";
              const categoryName = categories.find(c => c.id === budget.categoryId)?.name ?? `Category ${budget.categoryId}`;
              const categoryIcon = categories.find(c => c.id === budget.categoryId)?.icon ?? "📂";
              return (
                <div key={budget.id} className="group">
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="font-medium flex items-center gap-2">
                      <span>{categoryIcon}</span>
                      <span>{categoryName}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {MONTH_NAMES[budget.month - 1]}/{budget.year}
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-muted-foreground", over && "text-red-500 font-semibold")}>
                        {budget.spentAmount.toLocaleString("vi-VN")} ₫ / {budget.limitAmount.toLocaleString("vi-VN")} ₫
                        {over && " ⚠️"}
                      </span>
                      <button onClick={() => deleteBudget(budget.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-destructive transition-all">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Summary</CardTitle>
            <CardDescription>Overview of your budget health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative w-36 h-36 mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9155" fill="none"
                    stroke={totalLimit > 0 && totalSpent / totalLimit > 1 ? "#ef4444" : "#3b82f6"}
                    strokeWidth="3" strokeDasharray={`${Math.min((totalSpent / totalLimit) * 100, 100)} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0}%</span>
                  <span className="text-xs text-muted-foreground">used</span>
                </div>
              </div>

              <div className="w-full space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Total Limit</span>
                  <span className="font-semibold">{totalLimit.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="text-sm font-medium text-muted-foreground">Total Spent</span>
                  <span className="font-semibold text-red-500">{totalSpent.toLocaleString("vi-VN")} ₫</span>
                </div>
                <div className="flex justify-between items-center p-3 border rounded-lg bg-green-500/10 text-green-600">
                  <span className="text-sm font-medium">Remaining</span>
                  <span className="font-semibold">{Math.max(0, totalRemaining).toLocaleString("vi-VN")} ₫</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
