import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

@Injectable()
export class TenantContext {
  private readonly als = new AsyncLocalStorage<string>();

  get tenantId(): string | undefined {
    return this.als.getStore();
  }

  run<T>(tenantId: string, callback: () => T): T {
    return this.als.run(tenantId, callback);
  }
}
