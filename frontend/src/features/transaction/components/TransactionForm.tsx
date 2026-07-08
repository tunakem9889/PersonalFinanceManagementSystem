// @ts-ignore
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/Card";
import { useCreateTransaction } from "../../../hooks/useTransactions";
import { useWallets } from "../../../hooks/useWallets";
import { useCategories } from "../../../hooks/useCategories";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  onSuccess?: () => void;
}

type FormData = {
  type: 'income' | 'expense';
  amount: number;
  walletId: string;
  categoryId: string;
  date: string;
  notes: string;
};

export function TransactionForm({ onSuccess }: Props) {
  const { register, handleSubmit, reset, watch } = useForm<FormData>({
    defaultValues: { type: 'expense', date: new Date().toISOString().split('T')[0] }
  });
  const { mutate, isPending } = useCreateTransaction();
  const { data: wallets = [] } = useWallets();
  const { data: categories = [] } = useCategories();
  const [warning, setWarning] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const transactionType = watch("type");
  const filteredCategories = categories.filter(c => c.type === transactionType);

  const onSubmit = (data: FormData) => {
    setWarning(null);
    setSuccessMsg(null);
    mutate(
      {
        type: data.type,
        amount: Number(data.amount),
        walletId: data.walletId,
        categoryId: data.categoryId,
        date: new Date(data.date).toISOString(),
        notes: data.notes
      },
      {
        onSuccess: (result) => {
          if (result.warning) {
            setWarning(result.warning);
          } else {
            setSuccessMsg("Transaction saved successfully!");
          }
          reset();
          onSuccess?.();
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message ?? err?.message ?? "An error occurred.";
          setWarning(msg);
        }
      }
    );
  };

  const inputCls = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
  const selectCls = "w-full flex h-10 items-center rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
        <CardDescription>Record a new income or expense</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Warning / Success Alert */}
          {warning && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{warning}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-green-50 border border-green-200 text-green-800 text-sm">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Type toggle */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex items-center justify-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${transactionType === 'expense' ? 'bg-red-500/10 border-red-400 text-red-600 font-semibold' : 'border-input hover:bg-muted'}`}>
                <input type="radio" {...register("type")} value="expense" className="sr-only" />
                Expense
              </label>
              <label className={`flex items-center justify-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${transactionType === 'income' ? 'bg-green-500/10 border-green-400 text-green-600 font-semibold' : 'border-input hover:bg-muted'}`}>
                <input type="radio" {...register("type")} value="income" className="sr-only" />
                Income
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <input
              type="number"
              step="0.01"
              {...register("amount", { required: true, min: 0.01 })}
              className={inputCls}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Wallet <span className="text-red-500">*</span></label>
            <select {...register("walletId", { required: true })} className={selectCls}>
              <option value="">Select wallet...</option>
              {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({w.type}) – {w.balance.toLocaleString("vi-VN")} ₫</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <select {...register("categoryId", { required: true })} className={selectCls}>
              <option value="">Select category...</option>
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <input
              type="date"
              {...register("date", { required: true })}
              className={inputCls}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Notes <span className="text-muted-foreground">(optional)</span></label>
            <input
              type="text"
              {...register("notes")}
              className={inputCls}
              placeholder="Add a note..."
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
          >
            {isPending ? "Saving..." : "Save Transaction"}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
