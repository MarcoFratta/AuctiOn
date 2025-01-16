import z from 'zod'

export const ItemSchema = z.enum(['square', 'triangle', 'circle'])

export type Item = z.infer<typeof ItemSchema>
