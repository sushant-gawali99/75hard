import { Body, Controller, Get, Post } from '@nestjs/common';

import { AddWeightInput } from '@process/shared';
import { ZodBody } from '../common/zod-validation.pipe';
import { WeightsService } from './weights.service';

@Controller('weights')
export class WeightsController {
  constructor(private readonly svc: WeightsService) {}

  @Get()
  list() {
    return this.svc.list();
  }

  @Post()
  add(@Body(new ZodBody(AddWeightInput)) input: AddWeightInput) {
    return this.svc.add(input);
  }
}
