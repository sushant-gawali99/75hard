import { Body, Controller, Get, Post, Query } from '@nestjs/common';

import { AnalyzeMealInput, SaveMealInput } from '@process/shared';
import { UserId } from '../auth/current-user.decorator';
import { ZodBody } from '../common/zod-validation.pipe';
import { MealsService } from './meals.service';

@Controller('meals')
export class MealsController {
  constructor(private readonly svc: MealsService) {}

  @Post('analyze')
  analyze(@UserId() userId: string, @Body(new ZodBody(AnalyzeMealInput)) input: AnalyzeMealInput) {
    return this.svc.analyze(userId, input);
  }

  @Post()
  save(@UserId() userId: string, @Body(new ZodBody(SaveMealInput)) input: SaveMealInput) {
    return this.svc.save(userId, input);
  }

  @Get()
  list(@UserId() userId: string, @Query('date') date?: string) {
    return this.svc.listByDate(userId, date ?? new Date().toISOString().slice(0, 10));
  }
}
