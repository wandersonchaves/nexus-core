import { Controller, Get, Inject, Logger, BadRequestException } from '@nestjs/common';
import { DRIZZLE } from '../../infrastructure/database/database.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../infrastructure/database/schema';
import { eq, and } from 'drizzle-orm';
import { TenantContext } from '../../infrastructure/database/tenant-context.service';

@Controller('tenants')
export class TenantsController {
  private readonly logger = new Logger(TenantsController.name);

  constructor(
    @Inject(DRIZZLE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly tenantContext: TenantContext,
  ) {}

  @Get('me/status')
  async getMyStatus() {
    const tenantId = this.tenantContext.tenantId;

    if (!tenantId) {
      throw new BadRequestException('Tenant context is required');
    }

    // Recover first WhatsApp instance for this tenant
    const [instance] = await this.db
      .select({
        id: schema.whatsappInstances.id,
        name: schema.whatsappInstances.name,
        status: schema.whatsappInstances.status,
      })
      .from(schema.whatsappInstances)
      .where(eq(schema.whatsappInstances.tenantId, tenantId))
      .limit(1);

    if (!instance) {
      return {
        tenantId,
        whatsappConnected: false,
        status: 'DISCONNECTED',
        message: 'No WhatsApp instance configured for this tenant.',
      };
    }

    return {
      tenantId,
      instanceId: instance.id,
      instanceName: instance.name,
      whatsappConnected: instance.status === 'CONNECTED',
      status: instance.status,
    };
  }
}
