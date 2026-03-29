import { Module, Global, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { TenantContext } from './tenant-context.service';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';
export const DRIZZLE_SINGLETON = 'DRIZZLE_SINGLETON';
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
      provide: DRIZZLE_SINGLETON,
      useFactory: (sql: postgres.Sql): PostgresJsDatabase<typeof schema> => {
        return drizzle(sql, { schema });
      },
      inject: [POSTGRES_POOL],
    },
    {
      provide: DRIZZLE,
      scope: Scope.REQUEST,
      useFactory: async (
        tenantContext: TenantContext,
        sql: postgres.Sql,
      ): Promise<PostgresJsDatabase<typeof schema>> => {
        const tenantId = tenantContext.tenantId;

        if (tenantId) {
          await sql`SET app.current_tenant = ${tenantId}`;
        }

        return drizzle(sql, { schema });
      },
      inject: [TenantContext, POSTGRES_POOL],
    },
  ],
  exports: [DRIZZLE, DRIZZLE_SINGLETON, TenantContext],
})
export class DatabaseModule {}
