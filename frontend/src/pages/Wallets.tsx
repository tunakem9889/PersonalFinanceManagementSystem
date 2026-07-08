import { useState } from "react";
import { useWallets, useCreateWallet, useDeleteWallet, useTransferFunds } from "../hooks/useWallets";
import { Plus, Trash2, ArrowRightLeft, Wallet as WalletIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../utils/cn";
// @ts-ignore
import { useForm } from "react-hook-form";

const COLOR_OPTIONS = [
  { label: "Blue", value: "bg-blue-500" },
  { label: "Green", value: "bg-green-500" },
  { label: "Red", value: "bg-red-500" },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Yellow", value: "bg-yellow-500" },
  { label: "Pink", value: "bg-pink-500" },
];

export default function Wallets() {
  const { data: wallets = [], isLoading } = useWallets();
  const { mutate: createWallet, isPending: isCreating } = useCreateWallet();
  const { mutate: deleteWallet } = useDeleteWallet();
  const { mutate: transfer, isPending: isTransferring } = useTransferFunds();
  const [showAddForm, setShowAddForm] = useState(false);
  
  const { register: regWallet, handleSubmit: handleWallet, reset: resetWallet } = useForm();
  const { register: regTransfer, handleSubmit: handleTransfer, reset: resetTransfer } = useForm();

  const onAddWallet = (data: any) => {
    createWallet({ name: data.name, type: data.type, balance: Number(data.balance), colorClass: data.colorClass }, {
      onSuccess: () => { resetWallet(); setShowAddForm(false); }
    });
  };

  const onTransfer = (data: any) => {
    transfer({ fromWalletId: data.fromWalletId, toWalletId: data.toWalletId, amount: Number(data.amount) }, {
      onSuccess: () => resetTransfer()
    });
  };

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Wallets</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Wallet
        </button>
      </div>

      {/* Summary */}
      <div className="rounded-xl border bg-card p-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Net Worth</p>
          <p className={cn("text-3xl font-bold mt-1", totalBalance >= 0 ? "text-foreground" : "text-red-500")}>
            {totalBalance.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
          </p>
        </div>
        <WalletIcon className="h-12 w-12 text-muted-foreground/30" />
      </div>

      {/* Add Wallet Form */}
      {showAddForm && (
        <div className="rounded-xl border bg-card p-6">
          <h3 className="text-base font-semibold mb-4">New Wallet</h3>
          <form onSubmit={handleWallet(onAddWallet)} className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <input {...regWallet("name", { required: true })} placeholder="My Wallet" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select {...regWallet("type")} defaultValue="CASH_WALLET" className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="CASH_WALLET">Cash</option>
                <option value="BANK_ACCOUNT">Bank Account</option>
                <option value="E_WALLET">E-Wallet</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Balance</label>
              <input {...regWallet("balance")} type="number" step="0.01" defaultValue="0" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <select {...regWallet("colorClass")} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {COLOR_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAddForm(false)} className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent h-9 px-4">Cancel</button>
              <button type="submit" disabled={isCreating} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 disabled:opacity-50">
                {isCreating ? "Creating..." : "Create Wallet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Wallets Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card h-40 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="rounded-xl border bg-card shadow-sm overflow-hidden group relative">
              <div className={cn("h-2 w-full", wallet.colorClass || "bg-primary")} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{wallet.type}</p>
                    <h3 className="font-semibold text-lg">{wallet.name}</h3>
                  </div>
                  <button
                    onClick={() => deleteWallet(wallet.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className={cn("text-2xl font-bold", wallet.balance < 0 ? "text-red-500" : "")}>
                  {wallet.balance.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                </p>
                {wallet.monthlyChange !== undefined && (
                  <p className={cn("text-xs mt-2 flex items-center gap-1", wallet.monthlyChange >= 0 ? "text-green-600" : "text-red-500")}>
                    {wallet.monthlyChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {wallet.monthlyChange >= 0 ? "+" : ""}{wallet.monthlyChange}% this month
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Transfer Section */}
      <div className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5" /> Quick Transfer
        </h3>
        <form onSubmit={handleTransfer(onTransfer)} className="flex gap-4 items-end flex-wrap">
          <div className="flex-1 min-w-[140px] space-y-2">
            <label className="text-sm font-medium">From</label>
            <select {...regTransfer("fromWalletId", { required: true })} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select...</option>
              {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px] space-y-2">
            <label className="text-sm font-medium">To</label>
            <select {...regTransfer("toWalletId", { required: true })} className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select...</option>
              {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[140px] space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <input {...regTransfer("amount", { required: true, min: 0.01 })} type="number" step="0.01" placeholder="0.00" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
          <button type="submit" disabled={isTransferring} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 disabled:opacity-50">
            {isTransferring ? "Transferring..." : "Transfer"}
          </button>
        </form>
      </div>
    </div>
  );
}
