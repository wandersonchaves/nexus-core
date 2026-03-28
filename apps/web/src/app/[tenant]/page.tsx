import { TenantService } from '@/lib/services/tenant.service';

export default async function TenantDashboard() {
  const config = await TenantService.getCurrentTenant();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Painel da {config?.name}
        </h1>
        <p className="text-lg opacity-80">
          Você está acessando o ambiente de {config?.segment.toLowerCase()} via NexusCore.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-stone-200/50">
          <h3 className="font-bold text-lg mb-2">Configurações Ativas</h3>
          <ul className="text-sm space-y-1 opacity-70">
            <li><strong>ID:</strong> {config?.id}</li>
            <li><strong>Slug:</strong> {config?.slug}</li>
            <li><strong>Segmento:</strong> {config?.segment}</li>
          </ul>
        </div>
        
        {/* Mock de funcionalidade segmentada */}
        <div className="p-6 bg-primary/5 rounded-xl border-2 border-primary/10">
          <h3 className="font-bold text-lg mb-2">
            {config?.segment === 'CHURCH' ? 'Gestão de Membros' : 'Agenda Médica'}
          </h3>
          <p className="text-sm opacity-80 mb-4">
            Acesse rapidamente as ferramentas de {config?.segment === 'CHURCH' ? 'comunidade' : 'clínica'}.
          </p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold transition-transform hover:scale-105">
            Acessar Módulo
          </button>
        </div>
      </div>
    </div>
  );
}
