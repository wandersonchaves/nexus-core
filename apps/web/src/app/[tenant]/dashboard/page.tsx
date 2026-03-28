import { MetricCard } from '@/components/dashboard/metric-card';
import { ConnectionStatusCard } from '@/components/dashboard/connection-status-card';
import { GrowthFunnelChart } from '@/components/dashboard/growth-funnel-chart';

export default function TenantDashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Dashboard Executivo
        </h1>
        <p className="text-slate-500 font-medium">
          Monitoramento inteligente de leads, conexões e saúde da plataforma.
        </p>
      </header>

      {/* Grid de Métricas de Alto Nível */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
          label="Total de Leads" 
          value="2,482" 
          change={14.2} 
          trend="up" 
        />
        <MetricCard 
          label="Eficiência de IA" 
          value="98.2%" 
          change={2.1} 
          trend="up" 
        />
        <MetricCard 
          label="Engajamento" 
          value="412" 
          change={5.4} 
          trend="down" 
        />
        <MetricCard 
          label="ROI Estimado" 
          value="R$ 12k" 
          change={24.8} 
          trend="up" 
        />
      </div>

      {/* Grid de Analytics e Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico de Funil (Ocupa 2/3 no Desktop) */}
        <div className="lg:col-span-2">
          <GrowthFunnelChart />
        </div>

        {/* Sidebar de Status */}
        <div className="space-y-6">
           <ConnectionStatusCard />
           
           {/* Card de Quota de Uso */}
           <div className="p-5 rounded-xl border border-slate-200/50 bg-white/50 shadow-sm backdrop-blur-sm">
              <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest flex justify-between items-center">
                Quota de Processamento
                <span className="text-indigo-600">84%</span>
              </h4>
              <div className="space-y-3">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[84%] rounded-full transition-all duration-1000" />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                   <span>8.4k / 10k requisições</span>
                   <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">Mensal</span>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
