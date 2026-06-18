import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { SetRuleStateInput } from '@process/shared';
import { ZodBody } from '../common/zod-validation.pipe';
import { RuleLogsService } from './rule-logs.service';

@Controller('rule-logs')
export class RuleLogsController {
  constructor(private readonly svc: RuleLogsService) {}

  @Get()
  list(@Query('date') date?: string) {
    const d = date ?? new Date().toISOString().slice(0, 10);
    return this.svc.listByDate(d);
  }

  @Post()
  set(@Body(new ZodBody(SetRuleStateInput)) input: SetRuleStateInput) {
    return this.svc.set(input);
  }
}
