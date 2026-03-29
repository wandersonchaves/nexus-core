import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const url = request.url;

    // Explicitly bypass health and root paths to avoid dependency errors on critical infra
    if (url === '/' || url === '/health') {
      return true;
    }

    return super.canActivate(context);
  }
}
