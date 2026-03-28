'use client';

import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';

export function useAuthorizedApi() {
  const { getToken } = useAuth();
  const params = useParams();
  const tenantId = params?.tenant as string;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const client = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const token = await getToken();
    const finalHeaders = new Headers(options.headers);

    if (token) finalHeaders.set('Authorization', `Bearer ${token}`);
    if (tenantId) finalHeaders.set('x-tenant-id', tenantId);
    if (!finalHeaders.has('Content-Type')) finalHeaders.set('Content-Type', 'application/json');
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: finalHeaders,
    });

    if (!response.ok) {
       throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  };

  return { client };
}
