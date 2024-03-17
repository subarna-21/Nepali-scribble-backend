import {
  BadRequestException,
  ExecutionContext,
  createParamDecorator,
} from '@nestjs/common';
import * as z from 'zod';

export const ParamId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();

    const { id } = req.params;

    const idSchema = z.string().uuid();

    try {
      idSchema.parse(id);

      return id;
    } catch (error: unknown) {
      throw new BadRequestException('Invalid Id');
    }
  },
);
