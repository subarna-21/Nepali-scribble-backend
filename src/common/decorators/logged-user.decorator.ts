import {
  ExecutionContext,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
// import { AdminUser } from '../interface/admin.interface';

export const LoggedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): LoggedUser => {
    const req = ctx.switchToHttp().getRequest();

    const user = req.user as LoggedUser;

    if (!user) throw new UnauthorizedException('User not found');

    if (!user.id) throw new UnauthorizedException('User not found');

    return user;
  },
);
