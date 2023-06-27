import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
    const url = new URL(req.url);

    const session = await getAuthSession();

    let followedCommunitiesIds: string[] = []

    if (session) {
        const followedCommunities = await db.subscription.findMany({
            where: {
                userId: session.user.id
            },
            include: {
                subredit: true
            }
        })

        followedCommunitiesIds = followedCommunities.map(({ subredit }) => subredit.id)

        try {
            const { limit, page, subredditName } = z.object({
                limit: z.string(),
                page: z.string(),
                subredditName: z.string().nullish().optional()
            }).parse({
                subredditName: url.searchParams.get('subredditName'),
                page: url.searchParams.get('page'),
                limit: url.searchParams.get('limit'),
            });

            let whereClause = {}

            if (subredditName) {
                whereClause = {
                    subredit: {
                        name: subredditName
                    }
                }
            } else if (session) {
                whereClause = {
                    id: {
                        in: followedCommunitiesIds
                    }
                }
            }
            // todo : fix skiping formule when scrolling sometimes it refetchs the same data causing re render of the same component with same key
            const posts = await db.post.findMany({
                take: parseInt(limit),
                skip: parseInt(page) - 1 + parseInt(limit),
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    subredit: true,
                    votes: true,
                    author: true,
                    comments: true
                },
                where: whereClause
            })


            return new Response(JSON.stringify(posts));
        } catch (error) {
            if (error instanceof z.ZodError) {
                return new Response("Invalid request data", { status: 422 })
            }
            return new Response('Could not fetch more posts', { status: 500 })
        }
    }
}