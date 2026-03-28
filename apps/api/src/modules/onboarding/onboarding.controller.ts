import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { RegisterTenantSchema } from './dto/register-tenant.dto';
import type { RegisterTenantDto } from './dto/register-tenant.dto';
import { ZodValidationPipe } from '../../infrastructure/pipes/zod-validation.pipe';

@Controller('onboarding')
export class OnboardingController {
  private readonly logger = new Logger(OnboardingController.name);

  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('register')
  async register(@Body(new ZodValidationPipe(RegisterTenantSchema)) dto: RegisterTenantDto) {
    this.logger.log(`Received registration request for ${dto.name}`);
    return this.onboardingService.register(dto);
  }
}
