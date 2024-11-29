import {z} from '../utils/ZodWrapper'

const passwordMinLength = 8
const passwordRegex = new RegExp(
    '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{' + passwordMinLength + ',}$'
)
const passwordError =
    'Password must be at least 8 characters and ' +
    'contain an uppercase letter, ' +
    'lowercase letter, and number'

export const userSchema = z.object({
    id: z.string().optional(),
    email: z.string().email(),
    name: z.string().min(1),
})
export const registerSchema = userSchema
    .extend({
        password: z
            .string()
            .min(8)
            .regex(passwordRegex, {message: passwordError}),
    })
    .omit({id: true})

export const loginSchema = z.object({
    email: userSchema.shape.email,
    password: z.string().min(8),
})

export const registeredUser = userSchema.extend({
    pHash: z.string(),
    id: z.string(),
})
export const tokenSchema = z.object({
    token: z.string().min(0),
})
export const userOutputSchema = registeredUser.omit({pHash: true})

export type RegisterInputData = z.infer<typeof registerSchema>
export type LoginInputData = z.infer<typeof loginSchema>
export type User = z.infer<typeof registeredUser>
export type Token = z.infer<typeof tokenSchema>
export type UserOutput = z.infer<typeof userOutputSchema>
