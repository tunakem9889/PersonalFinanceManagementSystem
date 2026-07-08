import { cn } from "../../../utils/cn";

interface BudgetProgressBarProps {
  category: string;
  spent: number;
  limit: number;
  icon?: React.ReactNode;
}

export function BudgetProgressBar({ category, spent, limit, icon }: BudgetProgressBarProps) {
  const percentage = Math.min((spent / limit) * 100, 100);
  
  let colorClass = "bg-green-500";
  if (percentage >= 90) {
    colorClass = "bg-red-500";
  } else if (percentage >= 70) {
    colorClass = "bg-yellow-500";
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="font-medium">{category}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-medium">${spent.toFixed(2)} / ${limit.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground">
            ${(limit - spent > 0 ? limit - spent : 0).toFixed(2)} remaining
          </span>
        </div>
      </div>
      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", colorClass)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage >= 90 && (
        <p className="text-xs text-red-500 mt-1">Warning: You have reached or exceeded 90% of your budget!</p>
      )}
    </div>
  );
}
