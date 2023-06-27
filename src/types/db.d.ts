import { Comment, Subredit, User, Vote } from "@prisma/client"

export type ExtendedPosts = Post & {
    subredit: Subredit,
    votes: Vote[],
    author: User,
    comments: Comment[]
}