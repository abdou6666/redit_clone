import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentValidator } from "@/lib/validators/comment";
import { z } from "zod";

export async function PATCH(req: Request) {
    try {
        const sesion = await getAuthSession();
        const body = await req.json();
        const { postId, text, replyToId } = CommentValidator.parse(body);

        if (!sesion?.user) {
            return new Response('Unauthorized', { status: 401 })
        }

        await db.comment.create({
            data: {
                postId,
                text,
                replyToId,
                authorId: sesion.user.id
            }
        })

        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response("Invalid Comment data", { status: 422 })
        }

        return new Response('Could not create comment at this time, Please try again later', { status: 500 })

    }
}