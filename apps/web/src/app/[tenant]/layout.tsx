import { notFound } from 'next/navigation';
import { TenantService } from '@/lib/services/tenant.service';
import { ChurchTheme, ClinicTheme } from '@/components/themes/tenant-themes';
import type { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant } = await params;
  const config = await TenantService.getCurrentTenant();

  if (!config) return { title: 'NexusCore' };

  return {
    title: {
      default: config.name,
      template: `%s | ${config.name}`,
    },
    description: `Portal oficial da ${config.name} - Gerenciado por NexusCore`,
    icons: {
      icon: config.theme.logoUrl || '/favicon.ico',
    }
  };
}

export default async function TenantLayout({
  children,
  params,
}: Props) {
  const { tenant } = await params;
  const config = await TenantService.getCurrentTenant();

  if (!config) {
    notFound();
  }

  // Padrão de Layouts Dinâmicos baseado no Segmento
  const ThemeLayout = config.segment === 'CHURCH' ? ChurchTheme : ClinicTheme;

  return (
    <ThemeLayout config={config}>
      {children}
    </ThemeLayout>
  );
}
