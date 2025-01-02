import { z } from '../utils/ZodWrapper';

const passwordMinLength = 8;
const passwordRegex = new RegExp(
  '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{' + passwordMinLength + ',}$',
);
const passwordError =
  'Password must be at least 8 characters and ' +
  'contain an uppercase letter, ' +
  'lowercase letter, and number';
export const idSchema = z.string().length(24);

export const userSchema = z.object({
  id: idSchema,
  email: z.string().email(),
  name: z.string().min(1),
});
export const registerSchema = userSchema
  .extend({
    password: z
      .string()
      .min(8)
      .regex(passwordRegex, { message: passwordError }),
  })
  .omit({ id: true });

export const loginSchema = z.object({
  email: userSchema.shape.email,
  password: z.string().min(8),
});
export const accountSchema = z.object({
  id: idSchema,
  pHash: z.string(),
});

export const tokenSchema = z.object({
  token: z.string().min(0),
});
export const registerOutput = tokenSchema.merge(userSchema);

export type Account = z.infer<typeof accountSchema>;
export type RegisterInputData = z.infer<typeof registerSchema>;
export type LoginInputData = z.infer<typeof loginSchema>;
export type User = z.infer<typeof userSchema>;
export type Token = z.infer<typeof tokenSchema>;
export type RegisterOutput = z.infer<typeof registerOutput>;
