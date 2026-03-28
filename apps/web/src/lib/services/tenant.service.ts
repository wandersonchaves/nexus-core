import { headers } from 'next/headers';

export type TenantSegment = 'CHURCH' | 'CLINIC';

export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  segment: TenantSegment;
  theme: {
    primaryColor: string;
    logoUrl: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const TenantService = {
  async getCurrentTenant(): Promise<TenantConfig | null> {
    const headersList = await headers();
    const tenantIdentifier = headersList.get('x-tenant-id');

    if (!tenantIdentifier) return null;

    try {
      // Fetch server-to-server para a API NestJS
      const response = await fetch(`${API_URL}/tenants/config/${tenantIdentifier}`, {
        headers: {
          'x-tenant-id': tenantIdentifier,
        },
        next: { 
          revalidate: 3600, // Cache de 1 hora para configs de tenant
          tags: [`tenant-${tenantIdentifier}`] 
        },
      });

      if (!response.ok) return null;

      return response.json();
    } catch (error) {
      console.error('Failed to fetch tenant config:', error);
      return null;
    }
  },
};
