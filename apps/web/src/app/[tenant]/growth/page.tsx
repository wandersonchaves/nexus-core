'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthorizedApi } from '@/hooks/use-authorized-api';
import { Lead } from '@/lib/types/growth';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BrainCircuit, Loader2, Search, ExternalLink } from 'lucide-react';

export default function GrowthEnginePage() {
  const { client } = useAuthorizedApi();
  const queryClient = useQueryClient();

  // Fetch de Leads com polling para refletir o progresso do Worker
  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => client<Lead[]>('/growth/leads'),
    refetchInterval: (query) => {
       // Se houver algum lead sendo analisado, faz polling mais rápido
       return query.state.data?.some(l => l.status === 'ANALYZING') ? 3000 : 15000;
    },
  });

  // Mutação para Analisar com IA
  const { mutate: analyze, variables: activeLeadId } = useMutation({
    mutationFn: (leadId: string) => client(`/growth/leads/${leadId}/analyze`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const getScoreBadge = (score: number | null) => {
    if (score === null) return <Badge variant="secondary" className="opacity-50">N/A</Badge>;
    if (score <= 4) return <Badge className="bg-red-500 hover:bg-red-600 text-white border-none">{score}/10</Badge>;
    if (score <= 7) return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none">{score}/10</Badge>;
    return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">{score}/10</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ANALYZING':
        return <Badge variant="outline" className="animate-pulse border-blue-400 text-blue-600">Analisando...</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="border-emerald-400 text-emerald-600">Concluído</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) return <GrowthSkeleton />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Growth Engine</h1>
          <p className="text-muted-foreground mt-1">
            Inteligência artificial aplicada à prospecção de leads qualificados.
          </p>
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105">
          <Search className="w-4 h-4" />
          Minerar Leads
        </Button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="font-semibold text-slate-900">Empresa / Lead</TableHead>
              <TableHead className="font-semibold text-slate-900">Website</TableHead>
              <TableHead className="font-semibold text-slate-900">Score IA</TableHead>
              <TableHead className="font-semibold text-slate-900">Status</TableHead>
              <TableHead className="text-right font-semibold text-slate-900">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads?.length === 0 && (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                   Nenhum lead encontrado. Inicie uma mineração para começar.
                 </TableCell>
               </TableRow>
            )}
            {leads?.map((lead) => (
              <TableRow key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>
                  <a 
                    href={lead.website} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {lead.website.replace(/https?:\/\//, '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </TableCell>
                <TableCell>{getScoreBadge(lead.aiScore)}</TableCell>
                <TableCell>{getStatusBadge(lead.status)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 border-primary/20 hover:bg-primary/5 text-primary"
                    onClick={() => analyze(lead.id)}
                    disabled={activeLeadId === lead.id || lead.status === 'ANALYZING'}
                  >
                    {lead.status === 'ANALYZING' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <BrainCircuit className="w-4 h-4" />
                    )}
                    Analisar com IA
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function GrowthSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border rounded-xl">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border-b last:border-0">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-5 w-[100px]" />
            <div className="ml-auto">
              <Skeleton className="h-9 w-[120px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
