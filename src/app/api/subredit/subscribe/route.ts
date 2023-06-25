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
        if (subscription) {
            return new Response('You are already subscribed', { status: 400 })
        }

        await db.subscription.create({
            data: {
                subreditId: subredditId,
                userId: session.user.id
            }
        })
        return new Response(subredditId)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid request data", { status: 422 })
        }

        return new Response('Could not subscribe', { status: 500 })
    }
}