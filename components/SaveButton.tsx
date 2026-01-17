"use client"

import { useState, useOptimistic, startTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { toggleSave } from "@/app/actions/toggleSave"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface SaveButtonProps {
    imageId: string
    initialIsSaved: boolean
    className?: string
}

export function SaveButton({ imageId, initialIsSaved, className, showLabel = false }: SaveButtonProps & { showLabel?: boolean }) {
    const [isSaved, setIsSaved] = useState(initialIsSaved)
    const router = useRouter()

    // Optimistic UI
    const [optimisticIsSaved, setOptimisticIsSaved] = useOptimistic(
        isSaved,
        (_state, newState: boolean) => newState
    )

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const newState = !optimisticIsSaved

        startTransition(() => {
            setOptimisticIsSaved(newState)
        })

        try {
            // Optimistically update local state immediately
            setIsSaved(newState)

            const result = await toggleSave(imageId)

            if (result.error) {
                setIsSaved(!newState) // Revert
                toast.error(result.error)
                return
            }

            if (result.isSaved) {
                toast.success("Saved to your collection", {
                    action: {
                        label: "View Saved",
                        onClick: () => router.push('/saved')
                    }
                })
            } else {
                toast.success("Removed from saves")
            }

            // Sync with server result just in case
            if (typeof result.isSaved === 'boolean') {
                setIsSaved(result.isSaved)
            }

            router.refresh()
        } catch (error) {
            setIsSaved(!newState) // Revert
            toast.error("Something went wrong")
        }
    }

    return (
        <Button
            variant={showLabel ? (optimisticIsSaved ? "secondary" : "default") : "ghost"}
            size={showLabel ? "default" : "icon"}
            onClick={handleToggle}
            className={cn(
                "transition-all duration-300 group",
                !showLabel && "hover:bg-transparent hover:scale-110",
                showLabel && optimisticIsSaved && "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20",
                showLabel && !optimisticIsSaved && "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20",
                className
            )}
        >
            <Bookmark
                className={cn(
                    "w-5 h-5 transition-all duration-300",
                    optimisticIsSaved ? "fill-violet-500 text-violet-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : "text-zinc-400 group-hover:text-white",
                    showLabel && !optimisticIsSaved && "text-white group-hover:text-white",
                    showLabel && "mr-2"
                )}
            />
            {showLabel && (
                <span className={cn(
                    "font-medium",
                    optimisticIsSaved ? "text-violet-400" : "text-white"
                )}>
                    {optimisticIsSaved ? "Saved" : "Save to Collection"}
                </span>
            )}
            <span className="sr-only">{optimisticIsSaved ? "Unsave" : "Save"}</span>
        </Button>
    )
}
