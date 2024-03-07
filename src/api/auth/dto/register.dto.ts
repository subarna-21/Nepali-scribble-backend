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
    dob: z
      .string({ required_error: 'Date Of Birth is required' })
      .transform((value, ctx) => {
        const dob = new Date(value);

        if (isNaN(dob.getTime()))
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid Date',
          });

        dob.setHours(0);
        dob.setMinutes(0);
        dob.setSeconds(0);

        return dob;
      }),
  })
  .strict();

export class registerDto extends createZodDto(registerSchema) {}
