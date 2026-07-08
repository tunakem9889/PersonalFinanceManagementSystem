import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Wallet, CreditCard, PiggyBank, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../../utils/cn";

interface WalletCardProps {
  name: string;
  type: string;
  balance: number;
  colorClass: string;
  monthlyChange: number;
}

export function WalletCard({ name, type, balance, colorClass, monthlyChange }: WalletCardProps) {
  let Icon = Wallet;
  if (type === "Credit") Icon = CreditCard;
  if (type === "Savings") Icon = PiggyBank;

  return (
    <Card className="overflow-hidden">
      <div className={cn("h-2 w-full", colorClass)} />
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-md bg-muted text-muted-foreground")}>
            <Icon className="h-4 w-4" />
          </div>
          <CardTitle className="text-base font-medium">{name}</CardTitle>
        </div>
        <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded-full">
          {type}
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">
          {balance.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
        </div>
        <div className="flex items-center gap-1 text-sm">
          {monthlyChange >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={monthlyChange >= 0 ? "text-green-500" : "text-red-500"}>
            {monthlyChange >= 0 ? "+" : ""}{monthlyChange}%
          </span>
          <span className="text-muted-foreground ml-1">this month</span>
        </div>
      </CardContent>
    </Card>
  );
}
