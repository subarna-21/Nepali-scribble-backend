import {
  CanActivate,
  ConsoleLogger,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PrismaService } from 'src/global/prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new ConsoleLogger(AuthGuard.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.isPublicRoute(context, this.reflector)) return true;

    const req = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(req);

    if (!token) return false;

    try {
      const payload = jwt.verify(
        token,
        this.configService.get<string>('JWT_SECRET') as string,
      ) as unknown as
        | jwt.JsonWebTokenError
        | {
            id: string;
            iat: number;
            exp: number;
          };

      if (payload instanceof jwt.JsonWebTokenError) return false;

      const user = await this.prisma.user.findUnique({
        where: {
          id: payload.id,
        },
      });

      if (!user) return false;

      req.user = user;

      return true;
    } catch (err) {
      this.logger.error(err);
      return false;
    }
  }

  private extractTokenFromHeader(req: Request): string | false {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : false;
  }

  private isPublicRoute(ctx: ExecutionContext, reflector: Reflector): boolean {
    const isPublic = reflector.getAllAndOverride('isPublic', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (isPublic) return true;

    return false;
  }
}
