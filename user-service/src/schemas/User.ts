import { z } from 'zod';

export const UserID = z.object({
    id: z.string().length(24)
});

export const UserSchema = z.object({
    id: z.string().length(24).optional(),
    name: z.string().min(1),
    email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;