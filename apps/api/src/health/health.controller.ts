import { Controller, Get } from '@nestjs/common';
import { APP_NAME } from '@process/shared';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'process-api',
      app: APP_NAME,
      timestamp: new Date().toISOString(),
    };
  }
}
