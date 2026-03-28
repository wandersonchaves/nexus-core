import { Module, Global, Scope, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { TenantContext } from './tenant-context.service';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';
export const POSTGRES_POOL = 'POSTGRES_POOL';

@Global()
@Module({
  providers: [
    TenantContext,
    {
      provide: POSTGRES_POOL,
      useFactory: (configService: ConfigService) => {
        const url = configService.getOrThrow<string>('DATABASE_URL');
        return postgres(url);
      },
      inject: [ConfigService],
    },
    {
      provide: DRIZZLE,
      scope: Scope.REQUEST,
      useFactory: async (
        tenantContext: TenantContext,
        sql: postgres.Sql,
      ): Promise<PostgresJsDatabase<typeof schema>> => {
        const tenantId = tenantContext.tenantId;

        // Ao usar SET LOCAL no postgres.js, precisamos garantir que as queries 
        // rodem na mesma conexão. O Drizzle no factory aqui apenas injeta o contexto.
        // Se houver tenantId, definimos o parâmetro na sessão do postgres.
        if (tenantId) {
          await sql`SET app.current_tenant = ${tenantId}`;
        }

        return drizzle(sql, { schema });
      },
      inject: [TenantContext, POSTGRES_POOL],
    },
  ],
  exports: [DRIZZLE, TenantContext],
})
export class DatabaseModule {}
