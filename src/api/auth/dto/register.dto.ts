import { createZodDto } from 'nestjs-zod';
import { z } from 'nestjs-zod/z';

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(4)
      .max(40)
      .transform((value) => {
        return value.toLowerCase();
      }),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid Email Format')
      .transform((value) => {
        return value.toLowerCase();
      }),
    password: z.string({ required_error: 'Password is required' }),
    cpassword: z.string({ required_error: 'Confirm password is required' }),
  })
  .strict()
  .refine((data) => data.password === data.cpassword, {
    message: 'Passwords do not match',
    path: ['cpassword'],
  });

export class registerDto extends createZodDto(registerSchema) {}
