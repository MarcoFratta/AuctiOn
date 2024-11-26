import {z} from "../utils/ZodWrapper";


export const UserID = z.object({
    id: z.string().length(24)
});

export const UserSchema = z.object({
    id: z.string().length(24).optional().openapi({example: '60f1b3b3f3f3f3f3f3f3f3f3'}),
    name: z.string().min(1).openapi({example: 'John Doe'}),
    email: z.string().email().openapi({example: 'john@doe.com'})
});

export type User = z.infer<typeof UserSchema>;