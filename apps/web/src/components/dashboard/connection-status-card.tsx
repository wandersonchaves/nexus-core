'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthorizedApi } from '@/hooks/use-authorized-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TenantStatus } from '@/lib/types/analytics';
import { RefreshCcw, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export function ConnectionStatusCard() {
  const { client } = useAuthorizedApi();

  const { data: status, isLoading } = useQuery({
    queryKey: ['tenant-status'],
    queryFn: () => client<TenantStatus>('/tenants/me/status'),
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <Card className="border-slate-200/50">
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isConnected = status?.whatsapp.status === 'CONNECTED';

  return (
    <Card className="border-slate-200/50 overflow-hidden">
      <CardHeader className="pb-2 bg-slate-50/30">
        <CardTitle className="text-xs font-bold flex items-center justify-between uppercase tracking-widest text-slate-500">
          Status de Conexão
          <div className="flex items-center gap-2">
             <span className={cn(
               "h-2 w-2 rounded-full",
               isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]",
               "animate-pulse"
             )} />
             <span className={cn(
               "text-[10px] font-black uppercase",
               isConnected ? "text-emerald-600" : "text-red-600"
             )}>
               {status?.whatsapp.status || 'Offline'}
             </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
             <div className={cn(
               "p-2.5 rounded-xl transition-colors",
               isConnected ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
             )}>
                {isConnected ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
             </div>
             <div>
                <p className="text-sm font-black text-slate-900 leading-tight">
                  {isConnected ? 'WhatsApp Business' : 'API Desconectada'}
                </p>
                <p className="text-[11px] font-medium text-slate-400">
                  {status?.whatsapp.phoneNumber || 'Nenhum número pareado'}
                </p>
             </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs font-bold gap-2 hover:bg-slate-50 border-slate-200 shadow-sm"
            onClick={() => console.log('Mock: Iniciar pareamento QR Code')}
          >
            <RefreshCcw className="w-3 h-3" />
            Gerenciar Conexão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
