'use client';

import { FC, useRef } from 'react'
import UserAvatar from './UserAvatar';
import { Comment, CommentVote, User } from '@prisma/client';
import { formatTimeToNow } from '@/lib/utils';
import CommentVotes from './CommentVotes';


type ExtendedComment = Comment & {
    votes: CommentVote[],
    author: User
}


interface PostComment {
    comment: ExtendedComment,
    currentVote: CommentVote | undefined,
    votesAmount: number,
    postId: string
}

const PostComment: FC<PostComment> = ({
    comment,
    currentVote,
    votesAmount,
    postId }) => {
    const commentRef = useRef<HTMLDivElement>(null)
    return <div ref={commentRef} className='flex flex-col'>
        <div className='flex items-center'>
            <UserAvatar user={{
                name: comment.author.name || null,
                image: comment.author.image || null
            }}
                className='h-6 w-6'
            />
            <div className='ml-2 flex items-center gap-x-2'>
                <p className='text-sm font-medium text-gray-900'>u/{comment.author.username}</p>
                <p className='max-h-40 truncate text-xs text-zinc-500'>
                    {formatTimeToNow(new Date(comment.createdAt))}
                </p>
            </div>
        </div>

        <p className='text-sm text-zinc-900 mt-2'>
            {comment.text}
        </p>
        <div className="flex gap-2 items-center">
            <CommentVotes
                commentId={comment.id}
                initialVote={currentVote}
                initialVotesAmount={votesAmount}
            />
        </div>
    </div>
}

export default PostComment 