import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { subredditValidator } from "@/lib/validators/subredit";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        const body = await req.json();
        const { name } = subredditValidator.parse(body); // throws error
        const subreditExists = await db.subredit.findFirst({
            where: {
                name
            }
        })
        if (subreditExists) {
            return new Response('Subreddit already exist', { status: 409 })
        }
        const subredit = await db.subredit.create({
            data:
            {
                name,
                creatorId: session.user.id
            }
        });
        await db.subscription.create({
            data: {
                subreditId: subredit.id,
                userId: session.user.id
            }
        })

        return new Response(subredit.name)

    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response(error.message, { status: 422 })
        }

        return new Response('Could not create subreddit', { status: 500 })
    }
}