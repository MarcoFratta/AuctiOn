import { z } from 'zod'

const passwordMinLength = 8
const passwordRegex = new RegExp(
  '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{' + passwordMinLength + ',}$',
)

export const baseSignUpSchema = z.object({
  name: z.coerce
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Za-zÀ-ÿ]+$/, 'Name can only contain letters (no spaces or special characters)'),
  email: z.string().trim().toLowerCase().email().max(50),
  password: z
    .string()
    .min(8)
    .max(30)
    .regex(passwordRegex, {
      message:
        'Password must be at least 8 characters and contain ' +
        'an uppercase letter, ' +
        'lowercase letter, ' +
        'and number',
    }),
  repeatPassword: z.string().min(8).max(30),
})

// Keep `baseSignUpSchema` as a `ZodObject`, then apply `refine()` separately
export const signUpSchema = baseSignUpSchema.refine(
  (data) => data.password === data.repeatPassword,
  { message: 'Passwords do not match', path: ['repeatPassword'] },
)

export const signInSchema = z.object({
  email: baseSignUpSchema.shape.email,
  password: z.string().nonempty().max(30),
})
