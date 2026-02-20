import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  trend?: string;
  alert?: boolean;
}

export default function StatCard({ title, value, trend, alert }: StatCardProps) {
  return (
    <Card className={alert ? 'border-l-4 border-l-destructive' : 'border-l-4 border-l-primary'}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {alert && <AlertCircle className="w-4 h-4 text-destructive" />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
