import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedRequest, JwtPayload } from './jwt-payload.interface.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    return context.switchToHttp().getRequest<AuthenticatedRequest>().user;
  },
);
