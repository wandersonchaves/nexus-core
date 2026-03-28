import { Module } from '@nestjs/common';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { OnboardingProcessor } from './onboarding.processor';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'events',
    }),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingProcessor],
})
export class OnboardingModule {}
