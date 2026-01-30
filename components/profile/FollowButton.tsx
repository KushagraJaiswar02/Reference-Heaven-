"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { followUser, unfollowUser } from "@/app/actions/follow"
import { cn } from "@/lib/utils"
import { showToast, TOAST_MESSAGES } from "@/lib/toast-messages"

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
                    showToast("error", result.error)
                } else {
                    showToast("success", TOAST_MESSAGES.FOLLOW.SUCCESS(authorName))
                }
            } else {
                const result = await unfollowUser(authorId)
                if (result.error) {
                    setIsFollowing(!nextState) // Revert
                    showToast("error", result.error)
                } else {
                    showToast("success", TOAST_MESSAGES.FOLLOW.UNFOLLOW(authorName))
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
