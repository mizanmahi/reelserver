import { z } from 'zod';

const userRegistrationSchema = z.object({
   body: z.object({
      name: z
         .string()
         .min(3, 'Name must have at least 3 characters.')
         .max(40, 'Name cannot exceed 50 characters.'),
      email: z.string().email('Enter a valid email address.'),
      password: z
         .string()
         .min(8, 'Password must be at least 8 characters long.'),
   }),
});

const userAuthenticationSchema = z.object({
   body: z.object({
      email: z.string().email('Enter a valid email address.'),
      password: z.string(),
   }),
});

const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

const jwtTokenSchema = z.object({
   cookies: z.object({
      refreshToken: z.string().regex(jwtRegex, {
         message: 'Invalid Refresh Token',
      }),
   }),
});

const changePasswordSchema = z.object({
   body: z
      .object({
         oldPassword: z
            .string()
            .min(8, 'Old password must be at least 8 characters long.')
            .regex(
               /[a-zA-Z]/,
               'Old password must include at least one letter.'
            ),
         newPassword: z
            .string()
            .min(8, 'New password must be at least 8 characters long.')
            .regex(
               /[a-zA-Z]/,
               'New password must include at least one letter.'
            ),
      })
      .strict()
      .superRefine(({ oldPassword, newPassword }, ctx) => {
         if (oldPassword === newPassword) {
            ctx.addIssue({
               code: z.ZodIssueCode.custom,
               message: 'New password must be different from the old password.',
               path: ['newPassword'],
            });
         }
      }),
});

export const AuthValidationSchemas = {
   userRegistrationSchema,
   userAuthenticationSchema,
   jwtTokenSchema,
   changePasswordSchema,
};
