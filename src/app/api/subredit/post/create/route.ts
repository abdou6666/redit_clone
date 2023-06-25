import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { subredditSubscriptionValidator } from "@/lib/validators/subredit";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }
        const body = await req.json();

        const { subredditId, title, content } = PostValidator.parse(body);

        const subscription = await db.subscription.findFirst({
            where: {
                subreditId: subredditId,
                userId: session.user.id
            }
        })
        if (!subscription) {
            return new Response('Subscribe to post', { status: 400 })
        }

        await db.post.create({
            data: {
                subreditId: subredditId,
                authorId: session.user.id,
                title,
                content
            }
        })
        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid POST request data passed", { status: 422 })
        }

        return new Response('Could not post to subreddit at this time, Please try again later', { status: 500 })
    }
}