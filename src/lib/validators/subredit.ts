import { z } from 'zod';

export const subredditValidator = z.object({
    name: z.string().min(3).max(21)
})

export const subredditSubscriptionValidator = z.object({
    subreditEdit: z.string()
})

export type CreateSubredditPayload = z.infer<typeof subredditValidator>
export type SubscribeToSubredditPayload = z.infer<typeof subredditSubscriptionValidator>