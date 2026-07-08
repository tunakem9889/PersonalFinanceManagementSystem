import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useExpenseByCategory } from '../../../hooks/useReports';

interface Props {
  period?: string;
}

export function ExpensePieChart({ period }: Props) {
  const { data, isLoading } = useExpenseByCategory(period);

  if (isLoading) {
    return <div className="h-[300px] w-full flex items-center justify-center"><div className="h-36 w-36 rounded-full bg-muted animate-pulse" /></div>;
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {(data ?? []).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => [`${Number(value).toLocaleString("vi-VN")} ₫`]}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
