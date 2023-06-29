import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export async function PATCH(req: Request) {
    try {
        const session = await getAuthSession();
        if (!session?.user)
            return new Response('Unauthorized', { status: 401 })

        const body = await req.json();

        const { name } = UsernameValidator.parse(body);

        const user = await db.user.findFirst({
            where: {
                username: name
            }
        })
        if (user) {
            return new Response('Username taken', { status: 409 });
        }

        await db.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                username: name
            }
        })
        return new Response('OK')
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new Response('Invalid Request data', { status: 422 })
        }
        return new Response('Could not update username. Please try again later.', { status: 500 })
    }
}