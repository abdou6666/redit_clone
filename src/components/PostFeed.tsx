"use client"

import { ExtendedPosts } from '@/types/db'
import { FC, useEffect, useRef } from 'react'
import { useIntersection } from '@mantine/hooks'
import { useInfiniteQuery } from '@tanstack/react-query'
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from '@/config'
import axios from 'axios'
import { Vote } from '@prisma/client'
import { useSession } from 'next-auth/react'
import Post from './Post'

interface PostFeedProps {
    initialPosts: ExtendedPosts[],
    subredditName?: string
}

const PostFeed: FC<PostFeedProps> = ({ initialPosts, subredditName }) => {
    const lastPostRef = useRef<HTMLElement>(null);

    const { ref, entry } = useIntersection({
        root: lastPostRef.current,
        threshold: 1
    })
    const { data: session } = useSession();

    const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
        ['infinite-query'],
        async ({ pageParam = 1 }) => {
            const query = `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
                (!!subredditName ? `&subredditName=${subredditName}` : '')
            const { data } = await axios.get(query);

            return data as ExtendedPosts[]
        }, {
        getNextPageParam: (_, pages) => {
            return pages.length + 1;
        },
        initialData: { pages: [initialPosts], pageParams: [1] }
    });

    const posts: ExtendedPosts[] = data?.pages.flatMap((pages) => pages) ?? initialPosts;
    useEffect(() => {
        if (entry?.isIntersecting) {
            fetchNextPage()
        }
    }, [entry, fetchNextPage])
    return <ul className='flex flex-col col-span-2 space-y-6'>
        {posts.map((post: ExtendedPosts, index) => {

            const votesAmount = post.votes.reduce((acc: number, vote: Vote) => {
                if (vote.type === 'UP') return acc + 1;
                if (vote.type === 'DOWN') return acc - 1;
                return acc;
            }, 0);

            const currentVote: Vote = post.votes.find((vote: Vote) => vote.userId === session?.user.id);
            if (index === posts.length - 1) {
                return <li key={post.id} ref={ref}>
                    <Post
                        subredditName={post.subredit.name}
                        post={post}
                        commentsAmount={post.comments.length}
                        currentVote={currentVote}
                        votesAmount={votesAmount}

                    />
                </li>
            } else {
                return <li key={post.id}>
                    <Post
                        subredditName={post.subredit.name}
                        post={post}
                        commentsAmount={post.comments.length}
                        currentVote={currentVote}
                        votesAmount={votesAmount} />
                </li>
            }
        })}
    </ul>
}

export default PostFeed

