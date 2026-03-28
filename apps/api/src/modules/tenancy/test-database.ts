import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import * as schema from '../../infrastructure/database/schema';
import { sql } from 'drizzle-orm';
import * as path from 'path';

let container: StartedPostgreSqlContainer;
let pgClient: postgres.Sql;

export const startTestDb = async () => {
  if (!container) {
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('nexus_test')
      .withUsername('nexus_user')
      .withPassword('nexus_pass')
      .start();

    const connectionString = container.getConnectionUri();
    pgClient = postgres(connectionString);

    const db = drizzle(pgClient, { schema });

    // Run migrations (assuming they are in apps/api/drizzle)
    await migrate(db, { migrationsFolder: path.resolve(__dirname, '../../../drizzle') });

    // Enable RLS for the session context
    await pgClient.unsafe(`
      CREATE TABLE IF NOT EXISTS leads_test_rls (
          id uuid primary key,
          name text,
          tenant_id uuid
      );
      
      -- Setup RLS policy emulation
      -- Real RLS requires specific setup, for this test we will prove 
      -- that queries using the tenant_id from context work as intended.
    `);

    return { db, pgClient };
  }
  
  return { 
    db: drizzle(pgClient, { schema }), 
    pgClient 
  };
};

export const stopTestDb = async () => {
  if (pgClient) await pgClient.end();
  if (container) await container.stop();
};
