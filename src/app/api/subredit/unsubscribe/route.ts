import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { subredditSubscriptionValidator } from "@/lib/validators/subredit";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }
        const body = await req.json();

        const { subredditId } = subredditSubscriptionValidator.parse(body);

        const subscription = await db.subscription.findFirst({
            where: {
                subreditId: subredditId,
                userId: session.user.id
            }
        })
        if (!subscription) {
            return new Response('You are not subscribed to this subreddit', { status: 400 })
        }

        // check if the user is the creator of subreddit
        const subreddit = await db.subredit.findFirst({
            where: {
                id: subredditId,
                creatorId: session.user.id,
            }
        })
        if (subreddit) {
            return new Response('You cannot unsubscribe from your own subreddit', { status: 400 })
        }
        await db.subscription.delete({
            where: {
                userId_subreditId: {
                    subreditId: subredditId,
                    userId: session.user.id
                }
            }
        })
        return new Response(subredditId)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request data", { status: 422 })
        }

        return new Response('Could not unsubscribe', { status: 500 })
    }
}