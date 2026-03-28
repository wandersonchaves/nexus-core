import { auth } from '@clerk/nextjs/server';
import { headers } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function serverFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();
  
  const headersList = await headers();
  const tenantId = headersList.get('x-tenant-id');

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
}
