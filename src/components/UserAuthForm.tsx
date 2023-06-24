"use client"

import { FC, useState } from 'react'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'
import { signIn } from 'next-auth/react';
import { Icons } from './icons';
import { useToast } from '@/hooks/use-toast';


interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {

}

const UserAuthForm: FC<UserAuthFormProps> = ({ className, ...props }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { toast } = useToast();

    const loginWithGoogle = async () => {
        setIsLoading(true);
        try {
            await signIn('google')
        } catch (error) {
            console.log("toast")
            toast({
                title: 'There was a problem.',
                description: 'There was an error logging in with Google',
                variant: 'destructive'
            })
        } finally {
            setIsLoading(false);
        }
    }
    return (
        <div className={cn('flex justify-center', className)} {...props}>
            <Button size="sm" className='w-full' isLoading={isLoading} onClick={loginWithGoogle}>

                {isLoading ? null : <Icons.google className='h-4 w-4 mr-2' />}
                Google
            </Button>
        </div >
    )
}

export default UserAuthForm  