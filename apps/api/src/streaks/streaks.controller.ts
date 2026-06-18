import { Controller, Get } from '@nestjs/common';

import { UserId } from '../auth/current-user.decorator';
import { StreaksService } from './streaks.service';

@Controller('streaks')
export class StreaksController {
  constructor(private readonly svc: StreaksService) {}

  @Get()
  summary(@UserId() userId: string) {
    return this.svc.summary(userId);
  }
}
