import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('CriticalError');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: (exception as any).message || 'Internal Server Error',
    };

    // Simulate Sentry/CloudWatch integration
    if (httpStatus >= 500) {
      this.logger.error(`[CRITICAL] Status: ${httpStatus} - Path: ${responseBody.path} - Error: ${responseBody.message}`);
      // Sentry.captureException(exception);
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
