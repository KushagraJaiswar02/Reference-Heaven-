'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import Link from 'next/link'
import { revalidateAll } from './actions'

export function LoginForm({ searchParams }: { searchParams: { message?: string, error?: string } }) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(searchParams.error || null)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                setError(error.message)
                return
            }

            // Toast is handled globally by Navbar's onAuthStateChange listener

            await revalidateAll()
            router.refresh()
            router.push('/')

        } catch (err) {
            setError('An unexpected error occurred')
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {searchParams.message && (
                <Alert className="bg-blue-500/15 text-blue-500 border-blue-500/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Notice</AlertTitle>
                    <AlertDescription>{searchParams.message}</AlertDescription>
                </Alert>
            )}
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isLoading}
                />
            </div>
            <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing In...
                        </>
                    ) : (
                        "Sign In"
                    )}
                </Button>
            </div>
            <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="underline">
                    Sign up
                </Link>
            </div>
        </form>
    )
}
