import { Body, Controller, Get, Post } from '@nestjs/common';

import { CreateChallengeInput } from '@process/shared';
import { UserId } from '../auth/current-user.decorator';
import { ZodBody } from '../common/zod-validation.pipe';
import { ChallengeService } from './challenge.service';

@Controller('challenge')
export class ChallengeController {
  constructor(private readonly svc: ChallengeService) {}

  @Get()
  current(@UserId() userId: string) {
    return this.svc.current(userId);
  }

  @Post()
  create(@UserId() userId: string, @Body(new ZodBody(CreateChallengeInput)) input: CreateChallengeInput) {
    return this.svc.create(userId, input.days);
  }
}
