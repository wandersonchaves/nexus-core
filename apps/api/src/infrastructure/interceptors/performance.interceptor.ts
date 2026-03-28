import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(PerformanceInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const tenantId = request.headers['x-tenant-id'] || 'no-tenant';
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        const logData = {
          duration: `${duration}ms`,
          method,
          url,
          tenantId,
          type: 'performance',
        };

        if (duration > 500) {
          this.logger.warn(logData, `[SLOW_QUERY] ${method} ${url} exceeded 500ms`);
        } else {
          this.logger.info(logData, `[LATENCY] ${method} ${url}`);
        }
      }),
    );
  }
}
