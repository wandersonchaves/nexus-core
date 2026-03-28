import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { DatabaseModule } from '../../infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TenantsController],
  exports: [],
})
export class TenantsModule {}
