import { Module, Global } from '@nestjs/common';
import { UsageTrackerService } from './usage-tracker.service';
import { QuotaGuard } from './quota.guard';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    UsageTrackerService,
    QuotaGuard,
  ],
  exports: [UsageTrackerService, QuotaGuard],
})
export class QuotaModule {}
