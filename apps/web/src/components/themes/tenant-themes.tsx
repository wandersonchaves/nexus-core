import { ReactNode } from 'react';
import { TenantConfig } from '@/lib/services/tenant.service';

interface ThemeProps {
  children: ReactNode;
  config: TenantConfig;
}

export function ChurchTheme({ children, config }: ThemeProps) {
  return (
    <div className="church-theme min-h-screen bg-stone-50 font-serif text-stone-900">
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-md p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {config.theme.logoUrl && (
              <img src={config.theme.logoUrl} alt={config.name} className="h-8 w-auto" />
            )}
            <span className="font-bold text-xl tracking-tight text-amber-900">{config.name}</span>
          </div>
          <div className="text-sm uppercase tracking-widest text-stone-500 font-medium">
            Comunidade & Fé
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}

export function ClinicTheme({ children, config }: ThemeProps) {
  return (
    <div className="clinic-theme min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="border-b border-slate-200 bg-white p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              {config.name.charAt(0)}
            </div>
            <span className="font-bold text-xl text-slate-800">{config.name}</span>
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold text-blue-600">
            <span>Área Médica</span>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  );
}
