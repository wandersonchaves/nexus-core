'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthorizedApi } from '@/hooks/use-authorized-api';
import { ApiHealth } from '@/lib/types/analytics';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HealthIndicator() {
  const { client } = useAuthorizedApi();

  const { data: health } = useQuery({
    queryKey: ['api-health'],
    queryFn: () => client<ApiHealth>('/health'),
    refetchInterval: 30000,
  });

  const isDegraded = health?.status === 'DEGRADED' || health?.status === 'DOWN';

  if (!health) return null;

  return (
    <div className="flex items-center gap-4 px-3 py-1.5 rounded-full bg-slate-100/30 border border-slate-200/50 backdrop-blur-sm transition-all hover:bg-slate-100/50">
      <div className="flex items-center gap-2">
        {isDegraded ? (
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        )}
        <span className={cn(
          "text-[10px] font-black uppercase tracking-tighter",
          isDegraded ? "text-amber-600" : "text-slate-500"
        )}>
          {isDegraded ? 'Modo de Manutenção' : 'Nexus Engine Active'}
        </span>
      </div>
      
      <div className="h-3 w-[1px] bg-slate-300/50" />
      
      <div className="flex gap-1.5">
         <div 
           title={`Database: ${health.services.database ? 'UP' : 'DOWN'}`} 
           className={cn("h-1.5 w-1.5 rounded-full shadow-sm", health.services.database ? "bg-emerald-400" : "bg-red-400")} 
         />
         <div 
           title={`Redis: ${health.services.redis ? 'UP' : 'DOWN'}`} 
           className={cn("h-1.5 w-1.5 rounded-full shadow-sm", health.services.redis ? "bg-emerald-400" : "bg-red-400")} 
         />
         <div 
           title={`Worker: ${health.services.worker ? 'UP' : 'DOWN'}`} 
           className={cn("h-1.5 w-1.5 rounded-full shadow-sm", health.services.worker ? "bg-emerald-400" : "bg-red-400")} 
         />
      </div>
    </div>
  );
}
