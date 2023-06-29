import { Post, Vote, VoteType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import PostVoteClient from './PostVoteClient';

interface PostVoteServerProps {
    postId: string;
    initialVotesAmount?: number;
    initialVote?: VoteType | null
    getData?: () => Promise<(Post & { votes: Vote[] }) | null>
}

// const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))
const PostVoteServer = async ({
    postId,
    initialVotesAmount,
    initialVote,
    getData }: PostVoteServerProps) => {
    const session = await getServerSession();

    let _votesAmt = 0;
    let _currentVotes: VoteType | null | undefined = undefined;

    if (getData) {
        // await wait(1000);
        const post = await getData();
        if (!post) return notFound();

        _votesAmt = post.votes.reduce((acc, vote) => {
            if (vote.type === 'UP') return acc + 1;
            if (vote.type === 'DOWN') return acc - 1;

            return acc;
        }, 0)

        _currentVotes = post.votes.find((vote) => vote.userId === session?.user?.id)?.type;
    } else {
        _votesAmt = initialVotesAmount!;
        _currentVotes = initialVote;
    }
    return <PostVoteClient
        postId={postId}
        initialVotesAmount={_votesAmt}
        initialVote={_currentVotes}
    />
}

export default PostVoteServer