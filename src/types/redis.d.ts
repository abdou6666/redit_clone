import { Vote } from "@prisma/client";

export type CachedPost = {
    id: string;
    title: string;
    authorUsername: string;
    content: string;
    currentVote: Vote['type']; //VoteType
    createdAt: Date
}