import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';

import { auth } from './auth';

/**
 * Resolves the Better Auth session and attaches `req.userId`.
 * Falls back to 'dev-user' when there's no session (transitional until sign-in is live).
 * Never blocks — it only resolves identity.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    try {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
      req.userId = session?.user?.id ?? 'dev-user';
    } catch {
      req.userId = 'dev-user';
    }
    return true;
  }
}
