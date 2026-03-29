import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // 1. Detectar Subdomínio (ex: clinica.nexus.com)
  // Ignorar localhost e domínios base como nexus.com
  const domainParts = hostname.split('.');
  const isSubdomain = domainParts.length > 2 && !hostname.includes('localhost');

  let tenantIdentifier = '';

  if (isSubdomain) {
    tenantIdentifier = domainParts[0];
  } else {
    // 2. Detectar Segmento de Path (ex: nexus.com/igreja-central)
    const pathSegments = url.pathname.split('/');
    const firstSegment = pathSegments[1];

    // Lista de paths reservados que não são tenants
    const reservedPaths = ['api', '_next', 'public', 'assets', 'login', 'signup'];

    if (firstSegment && !reservedPaths.includes(firstSegment)) {
      tenantIdentifier = firstSegment;
    }
  }

  // Adicionar x-tenant-id nos headers para facilitar consumo downstream
  const requestHeaders = new Headers(req.headers);
  if (tenantIdentifier) {
    requestHeaders.set('x-tenant-id', tenantIdentifier);
  }

  // Se for subdomínio, reescrever internamente para facilitar o roteamento dinâmico
  if (isSubdomain && tenantIdentifier) {
    return NextResponse.rewrite(
      new URL(`/${tenantIdentifier}${url.pathname}`, req.url),
      {
        request: {
          headers: requestHeaders,
        },
      }
    );
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
