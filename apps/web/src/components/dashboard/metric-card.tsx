'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { DashboardMetric } from '@/lib/types/analytics';
import { cn } from '@/lib/utils';

interface MetricCardProps extends Partial<DashboardMetric> {
  isLoading?: boolean;
}

export function MetricCard({ label, value, change, trend, isLoading }: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className="border-slate-200/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  return (
    <Card className="transition-all hover:shadow-md border-slate-200/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black tracking-tight">{value}</div>
        <p className={cn(
          "flex items-center gap-1 text-[11px] mt-1 font-bold",
          trend === 'up' ? "text-emerald-600" : trend === 'down' ? "text-red-600" : "text-slate-500"
        )}>
          <TrendIcon className="w-3 h-3" />
          {change}% vs. período anterior
        </p>
      </CardContent>
    </Card>
  );
}
