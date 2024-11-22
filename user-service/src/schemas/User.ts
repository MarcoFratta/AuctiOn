import { z } from 'zod';

export const UserSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;