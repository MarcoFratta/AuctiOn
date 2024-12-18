import { z } from '../utils/ZodWrapper'

export const userSchema = z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().min(1),
})

export type User = z.infer<typeof userSchema>;