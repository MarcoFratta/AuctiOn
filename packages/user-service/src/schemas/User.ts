import { z } from '../utils/ZodWrapper';

export const userId = z.object({
  id: z.string(),
});

export const userEmail = z.object({
  email: z.string().email().openapi({ example: 'john@doe.com' }),
});

export const userSchema = z.object({
  id: userId.shape.id,
  name: z.string().min(1).openapi({ example: 'John Doe' }),
  email: userEmail.shape.email,
});

export type User = z.infer<typeof userSchema>;
