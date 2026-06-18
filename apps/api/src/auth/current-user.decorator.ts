import { createParamDecorator, type ExecutionContext } from '@nestjs/common';

/** Injects the resolved user id (set by AuthGuard). */
export const UserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest();
  return (req.userId as string | undefined) ?? 'dev-user';
});
