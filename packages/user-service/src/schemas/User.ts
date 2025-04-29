import { z } from '@auction/common/zod'

export const userId = z.object({
  id: z.string(),
})

export const userEmail = z.object({
  email: z.string().email(),
})

export const userSchema = z.object({
  id: userId.shape.id,
  name: z.string().min(1),
  email: userEmail.shape.email,
})

export type User = z.infer<typeof userSchema>
