import { Body, Controller, Get, Post } from '@nestjs/common';

import { CreateRuleInput } from '@process/shared';
import { UserId } from '../auth/current-user.decorator';
import { ZodBody } from '../common/zod-validation.pipe';
import { RulesService } from './rules.service';

@Controller('rules')
export class RulesController {
  constructor(private readonly rules: RulesService) {}

  @Get()
  list(@UserId() userId: string) {
    return this.rules.list(userId);
  }

  @Post()
  create(@UserId() userId: string, @Body(new ZodBody(CreateRuleInput)) input: CreateRuleInput) {
    return this.rules.create(userId, input);
  }
}
