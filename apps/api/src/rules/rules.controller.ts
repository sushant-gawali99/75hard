import { Body, Controller, Get, Post } from '@nestjs/common';

import { CreateRuleInput } from '@process/shared';
import { ZodBody } from '../common/zod-validation.pipe';
import { RulesService } from './rules.service';

@Controller('rules')
export class RulesController {
  constructor(private readonly rules: RulesService) {}

  @Get()
  list() {
    return this.rules.list();
  }

  @Post()
  create(@Body(new ZodBody(CreateRuleInput)) input: CreateRuleInput) {
    return this.rules.create(input);
  }
}
