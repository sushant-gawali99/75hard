import { Body, Controller, Get, Post } from '@nestjs/common';

import { AddWeightInput } from '@process/shared';
import { UserId } from '../auth/current-user.decorator';
import { ZodBody } from '../common/zod-validation.pipe';
import { WeightsService } from './weights.service';

@Controller('weights')
export class WeightsController {
  constructor(private readonly svc: WeightsService) {}

  @Get()
  list(@UserId() userId: string) {
    return this.svc.list(userId);
  }

  @Post()
  add(@UserId() userId: string, @Body(new ZodBody(AddWeightInput)) input: AddWeightInput) {
    return this.svc.add(userId, input);
  }
}
