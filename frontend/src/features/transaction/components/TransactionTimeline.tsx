import { format } from "date-fns";
import { Coffee, Car, Utensils, ArrowRightLeft, Trash2 } from "lucide-react";
import { cn } from "../../../utils/cn";
import { useTransactions, useDeleteTransaction } from "../../../hooks/useTransactions";
import { useCategories } from "../../../hooks/useCategories";

interface Props {
  search?: string;
  filterType?: "all" | "income" | "expense";
}

export function TransactionTimeline({ search = "", filterType = "all" }: Props) {
  const { data: transactions, isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { mutate: deleteTransaction } = useDeleteTransaction();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="h-9 w-9 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-1/3" />
              <div className="h-2 bg-muted rounded w-1/4" />
            </div>
            <div className="h-4 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  const filtered = (transactions ?? []).filter((t) => {
    const categoryName = categories.find(c => c.id === t.categoryId)?.name ?? t.categoryName ?? "";
    const matchSearch =
      search === "" ||
      (t.notes?.toLowerCase().includes(search.toLowerCase())) ||
      categoryName.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || t.type === filterType;
    return matchSearch && matchType;
  });

  if (filtered.length === 0) {
    return <div className="p-8 text-center text-muted-foreground">No transactions found.</div>;
  }

  return (
    <div className="space-y-1">
      {filtered.map((transaction) => {
        const categoryName = categories.find(c => c.id === transaction.categoryId)?.name ?? transaction.categoryName ?? "";
        const categoryIcon = categories.find(c => c.id === transaction.categoryId)?.icon;

        let Icon = ArrowRightLeft;
        let iconBg = "bg-gray-100";
        let iconColor = "text-gray-600";

        if (transaction.type === 'income') {
          Icon = Coffee;
          iconBg = "bg-green-100";
          iconColor = "text-green-600";
        } else {
          if (categoryName.toLowerCase().includes("food")) { Icon = Utensils; iconBg = "bg-blue-100"; iconColor = "text-blue-600"; }
          if (categoryName.toLowerCase().includes("transport")) { Icon = Car; iconBg = "bg-pink-100"; iconColor = "text-pink-600"; }
        }

        return (
          <div key={transaction.id} className="group flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
            <div className="flex items-center gap-4">
              <div className={cn("p-2 rounded-full flex-shrink-0", iconBg, iconColor)}>
                {categoryIcon ? <span className="text-base leading-none">{categoryIcon}</span> : <Icon className="h-4 w-4" />}
              </div>
              <div>
                <p className="font-medium text-sm">{transaction.notes || categoryName || "Transaction"}</p>
                <div className="flex items-center text-xs text-muted-foreground gap-2 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-muted">{categoryName}</span>
                  <span>•</span>
                  <span>{format(new Date(transaction.date), "MMM dd, yyyy")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={cn(
                "font-semibold text-sm",
                transaction.type === "income" ? "text-green-600" : "text-red-500"
              )}>
                {transaction.type === "income" ? "+" : "-"}{Math.abs(transaction.amount).toLocaleString("vi-VN")} ₫
              </div>
              <button
                onClick={() => {
                  if (window.confirm("Delete this transaction?")) {
                    deleteTransaction(transaction.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-destructive transition-all"
                title="Delete transaction"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
