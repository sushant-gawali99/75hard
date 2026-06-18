import { Controller, Get, Query } from '@nestjs/common';

import { UserId } from '../auth/current-user.decorator';
import { StreaksService } from './streaks.service';

@Controller('streaks')
export class StreaksController {
  constructor(private readonly svc: StreaksService) {}

  @Get()
  summary(@UserId() userId: string) {
    return this.svc.summary(userId);
  }

  @Get('calendar')
  calendar(@UserId() userId: string, @Query('month') month?: string) {
    return this.svc.calendar(userId, month ?? new Date().toISOString().slice(0, 7));
  }
}
