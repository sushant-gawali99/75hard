import { Body, Controller, Get, Put } from '@nestjs/common';

import { UpsertProfileInput } from '@process/shared';
import { UserId } from '../auth/current-user.decorator';
import { ZodBody } from '../common/zod-validation.pipe';
import { ProfileService } from './profile.service';

@Controller()
export class ProfileController {
  constructor(private readonly svc: ProfileService) {}

  @Get('profile')
  get(@UserId() userId: string) {
    return this.svc.get(userId);
  }

  @Put('profile')
  upsert(@UserId() userId: string, @Body(new ZodBody(UpsertProfileInput)) input: UpsertProfileInput) {
    return this.svc.upsert(userId, input);
  }

  @Get('nutrition-targets')
  targets(@UserId() userId: string) {
    return this.svc.getTargets(userId);
  }
}
