"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { followUser, unfollowUser } from "@/app/actions/follow"
import { cn } from "@/lib/utils"

interface FollowButtonProps {
    authorId: string
    authorName: string
    initialIsFollowing: boolean
    isCurrentUser?: boolean
    className?: string
    variant?: "default" | "outline" | "ghost" | "secondary"
    size?: "default" | "sm" | "lg" | "icon"
}

export function FollowButton({
    authorId,
    authorName,
    initialIsFollowing,
    isCurrentUser,
    className,
    variant = "default",
    size = "default"
}: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [isPending, startTransition] = useTransition()

    if (isCurrentUser) return null

    const toggleFollow = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent navigation if inside a link
        e.stopPropagation()

        const nextState = !isFollowing
        setIsFollowing(nextState) // Optimistic update

        startTransition(async () => {
            if (nextState) {
                const result = await followUser(authorId)
                if (result.error) {
                    setIsFollowing(!nextState) // Revert
                    toast.error(result.error)
                } else {
                    toast.success(`You're now following ${authorName}`, {
                        duration: 3000,
                        dismissible: true,
                    })
                }
            } else {
                const result = await unfollowUser(authorId)
                if (result.error) {
                    setIsFollowing(!nextState) // Revert
                    toast.error(result.error)
                }
            }
        })
    }

    return (
        <Button
            onClick={toggleFollow}
            disabled={isPending}
            variant={isFollowing ? "outline" : variant}
            size={size}
            className={cn(
                "transition-all duration-300 font-medium",
                isFollowing
                    ? "text-muted-foreground hover:text-foreground border-border bg-transparent hover:bg-muted"
                    : "",
                className
            )}
        >
            {isFollowing ? "Following" : "Follow"}
        </Button>
    )
}
