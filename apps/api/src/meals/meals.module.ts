import { Module } from '@nestjs/common';

import { FatSecretService } from './fatsecret.service';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';
import { VisionService } from './vision.service';

@Module({
  controllers: [MealsController],
  providers: [MealsService, VisionService, FatSecretService],
})
export class MealsModule {}
