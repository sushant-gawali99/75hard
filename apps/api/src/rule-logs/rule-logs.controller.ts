import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { SetRuleStateInput } from '@process/shared';
import { UserId } from '../auth/current-user.decorator';
import { ZodBody } from '../common/zod-validation.pipe';
import { RuleLogsService } from './rule-logs.service';

@Controller('rule-logs')
export class RuleLogsController {
  constructor(private readonly svc: RuleLogsService) {}

  @Get()
  list(@UserId() userId: string, @Query('date') date?: string) {
    return this.svc.listByDate(userId, date ?? new Date().toISOString().slice(0, 10));
  }

  @Post()
  set(@UserId() userId: string, @Body(new ZodBody(SetRuleStateInput)) input: SetRuleStateInput) {
    return this.svc.set(userId, input);
  }
}
