'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthorizedApi } from '@/hooks/use-authorized-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FunnelData } from '@/lib/types/analytics';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

export function GrowthFunnelChart() {
  const { client } = useAuthorizedApi();

  const { data, isLoading } = useQuery({
    queryKey: ['growth-funnel'],
    queryFn: () => client<FunnelData[]>('/analytics/funnel'),
  });

  // Cores semânticas graduais para o funil
  const COLORS = ['#6366f1', '#8b5cf6', '#d946ef'];

  if (isLoading) {
    return (
      <Card className="col-span-2 border-slate-200/50">
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2 border-slate-200/50 bg-white/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Funil de Growth (Volume de Leads)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical" 
              margin={{ left: 0, right: 40, top: 10, bottom: 10 }}
              barGap={10}
            >
              <XAxis type="number" hide />
              <YAxis 
                dataKey="stage" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                width={100}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              />
              <Bar 
                dataKey="count" 
                radius={[0, 12, 12, 0]} 
                barSize={32}
              >
                {data?.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    fillOpacity={0.9} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
