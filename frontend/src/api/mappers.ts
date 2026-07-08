import type { Wallet, WalletTransfer } from "./wallet";
import type { Transaction } from "./transaction";
import type { Category } from "./category";
import type { UserProfile } from "./user";
import type { Budget } from "./budget";

const WALLET_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-pink-500",
];

const WALLET_TYPE_LABELS: Record<string, string> = {
  CASH_WALLET: "Cash",
  BANK_ACCOUNT: "Bank Account",
  E_WALLET: "E-Wallet",
};

const WALLET_TYPE_TO_BACKEND: Record<string, string> = {
  Cash: "CASH_WALLET",
  Savings: "BANK_ACCOUNT",
  Credit: "E_WALLET",
  Investment: "BANK_ACCOUNT",
  "Bank Account": "BANK_ACCOUNT",
  "E-Wallet": "E_WALLET",
  CASH_WALLET: "CASH_WALLET",
  BANK_ACCOUNT: "BANK_ACCOUNT",
  E_WALLET: "E_WALLET",
};

function toEnumType(value: string): "INCOME" | "EXPENSE" {
  return value.toUpperCase() as "INCOME" | "EXPENSE";
}

function fromEnumType(value: string): "income" | "expense" {
  return value.toLowerCase() as "income" | "expense";
}

function toLocalDate(value: string): string {
  return value.includes("T") ? value.split("T")[0] : value;
}

function walletColor(id: string | number): string {
  const numericId = Number(id);
  return WALLET_COLORS[Number.isNaN(numericId) ? 0 : numericId % WALLET_COLORS.length];
}

export function mapWalletFromApi(data: Record<string, unknown>): Wallet {
  const id = String(data.id ?? "");
  const backendType = String(data.type ?? "CASH_WALLET");

  return {
    id,
    name: String(data.name ?? ""),
    type: WALLET_TYPE_LABELS[backendType] ?? backendType,
    balance: Number(data.currentBalance ?? data.initialBalance ?? 0),
    colorClass: walletColor(id),
  };
}

export function mapWalletToApi(data: Partial<Wallet>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (data.name !== undefined) payload.name = data.name;
  if (data.type !== undefined) {
    payload.type = WALLET_TYPE_TO_BACKEND[data.type] ?? data.type;
  }
  if (data.balance !== undefined) payload.initialBalance = data.balance;

  return payload;
}

export function mapTransferToApi(data: WalletTransfer): Record<string, unknown> {
  return {
    fromWalletId: Number(data.fromWalletId),
    toWalletId: Number(data.toWalletId),
    amount: data.amount,
    description: data.notes,
  };
}

export function mapCategoryFromApi(data: Record<string, unknown>): Category {
  return {
    id: String(data.id ?? ""),
    name: String(data.name ?? ""),
    type: fromEnumType(String(data.type ?? "EXPENSE")),
    icon: data.icon ? String(data.icon) : undefined,
  };
}

export function mapCategoryToApi(data: Partial<Category>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (data.name !== undefined) payload.name = data.name;
  if (data.type !== undefined) payload.type = toEnumType(data.type);
  if (data.icon !== undefined) payload.icon = data.icon;

  return payload;
}

export function mapTransactionFromApi(data: Record<string, unknown>): Transaction {
  const transactionDate = data.transactionDate ?? data.date;

  return {
    id: String(data.id ?? ""),
    type: fromEnumType(String(data.type ?? "EXPENSE")),
    amount: Number(data.amount ?? 0),
    walletId: data.walletId != null ? String(data.walletId) : "",
    categoryId: String(data.categoryId ?? ""),
    categoryName: data.categoryName ? String(data.categoryName) : undefined,
    date: transactionDate ? new Date(String(transactionDate)).toISOString() : new Date().toISOString(),
    notes: String(data.description ?? data.title ?? data.notes ?? ""),
    warning: data.warning ? String(data.warning) : undefined,
  };
}

export function mapTransactionToApi(
  data: Omit<Transaction, "id" | "categoryName">
): Record<string, unknown> {
  const title = data.notes?.trim() || "Transaction";

  return {
    type: toEnumType(data.type),
    amount: data.amount,
    categoryId: Number(data.categoryId),
    walletId: data.walletId ? Number(data.walletId) : undefined,
    title,
    description: data.notes?.trim() || undefined,
    transactionDate: toLocalDate(data.date),
  };
}

export function mapBudgetFromApi(data: Record<string, unknown>): Budget {
  return {
    id: String(data.id ?? ""),
    categoryId: String(data.categoryId ?? ""),
    limitAmount: Number(data.limitAmount ?? 0),
    spentAmount: Number(data.spentAmount ?? 0),
    month: Number(data.month ?? new Date().getMonth() + 1),
    year: Number(data.year ?? new Date().getFullYear()),
  };
}

export function mapBudgetToApi(data: Partial<Budget>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (data.categoryId !== undefined) payload.categoryId = Number(data.categoryId);
  if (data.limitAmount !== undefined) payload.limitAmount = data.limitAmount;
  if (data.spentAmount !== undefined) payload.spentAmount = data.spentAmount;
  if (data.month !== undefined) payload.month = data.month;
  if (data.year !== undefined) payload.year = data.year;
  return payload;
}

export function mapUserFromApi(data: Record<string, unknown>): UserProfile {
  return {
    id: String(data.id ?? ""),
    username: String(data.fullName ?? data.username ?? ""),
    email: String(data.email ?? ""),
  };
}

export function mapUserToApi(data: Partial<UserProfile>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (data.username !== undefined) payload.fullName = data.username;
  if (data.email !== undefined) payload.email = data.email;

  return payload;
}
