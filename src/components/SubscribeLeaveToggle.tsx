"use client"
import { FC, startTransition } from 'react'
import { Button } from './ui/Button';
import { useMutation } from '@tanstack/react-query';
import { SubscribeToSubredditPayload } from '@/lib/validators/subredit';
import axios, { AxiosError } from 'axios';
import useCustomToast from '@/hooks/useCustomToast';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface SubscribeLeaveToggleProps {
    subredditId: string;
    subredditName: string;
    isSubscribed: boolean;
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({ subredditId, subredditName, isSubscribed }) => {
    const { loginToast } = useCustomToast();
    const router = useRouter();

    const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToSubredditPayload = {
                subredditId,
            }
            const { data } = await axios.post('/api/subredit/subscribe', payload);
            return data as string;
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast();
                }
            }
            return toast({
                title: 'There was a problem',
                description: 'Something went wrong.Please try again',
                variant: 'destructive'
            })
        },
        onSuccess: () => {
            startTransition(() => {
                router.refresh();
            })

            return toast({
                title: 'Subscribed',
                description: `You are now subscribed to ${subredditName}`
            })
        }
    })

    const { mutate: unSubscribe, isLoading: isUnsubscribing } = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToSubredditPayload = {
                subredditId,
            }
            const { data } = await axios.post('/api/subredit/unsubscribe', payload);
            return data as string;
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) {
                    return loginToast();
                }
            }
            return toast({
                title: 'There was a problem',
                description: 'Something went wrong.Please try again',
                variant: 'destructive'
            })
        },
        onSuccess: () => {
            startTransition(() => {
                router.refresh();
            })

            return toast({
                title: 'Unsubscribed',
                description: `You are now unsubscribed to ${subredditName}`
            })
        }
    })


    if (isSubscribed) {
        return <Button
            isLoading={isUnsubscribing}
            onClick={() => unSubscribe()}
            className='w-full mt-1 mb-4'
        >
            Leave Community
        </Button>
    } else {
        return <Button
            isLoading={isSubLoading}
            onClick={() => subscribe()}
            className='w-full mt-1 mb-4'>
            Join to post
        </Button>
    }

}

export default SubscribeLeaveToggle