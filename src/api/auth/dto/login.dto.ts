import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const loginSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid Email Format')
      .transform((value) => {
        return value.toLowerCase();
      }),
    password: z.string({ required_error: 'Password is required' }),
  })
  .strict();

export class loginDto extends createZodDto(loginSchema) {}
