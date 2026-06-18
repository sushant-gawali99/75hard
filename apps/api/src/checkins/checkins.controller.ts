import { Body, Controller, Get, Put, Query } from '@nestjs/common';

import { UpsertCheckinInput } from '@process/shared';
import { UserId } from '../auth/current-user.decorator';
import { ZodBody } from '../common/zod-validation.pipe';
import { CheckinsService } from './checkins.service';

@Controller('checkins')
export class CheckinsController {
  constructor(private readonly svc: CheckinsService) {}

  @Get()
  get(@UserId() userId: string, @Query('date') date: string) {
    return this.svc.getByDate(userId, date);
  }

  @Put()
  upsert(@UserId() userId: string, @Body(new ZodBody(UpsertCheckinInput)) input: UpsertCheckinInput) {
    return this.svc.upsert(userId, input);
  }
}
