"use client"

import { useState, useOptimistic, startTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { AddToCollectionDialog } from "@/components/collections/AddToCollectionDialog"

interface SaveButtonProps {
    imageId: string
    initialIsSaved: boolean
    className?: string
}

export function SaveButton({ imageId, initialIsSaved, className, showLabel = false }: SaveButtonProps & { showLabel?: boolean }) {
    const [isSaved, setIsSaved] = useState(initialIsSaved)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    const handleGlobalSaveChange = (newState: boolean) => {
        setIsSaved(newState)
    }

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDialogOpen(true)
    }

    return (
        <>
            <Button
                variant={showLabel ? (isSaved ? "secondary" : "default") : "ghost"}
                size={showLabel ? "default" : "icon"}
                onClick={handleClick}
                className={cn(
                    "transition-all duration-300 group",
                    !showLabel && "hover:bg-transparent hover:scale-110",
                    showLabel && isSaved && "bg-violet-500/10 text-violet-400 hover:bg-violet-500/20",
                    showLabel && !isSaved && "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20",
                    className
                )}
            >
                <Bookmark
                    className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isSaved ? "fill-violet-500 text-violet-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" : "text-zinc-400 group-hover:text-white",
                        showLabel && !isSaved && "text-white group-hover:text-white",
                        showLabel && "mr-2"
                    )}
                />
                {showLabel && (
                    <span className={cn(
                        "font-medium",
                        isSaved ? "text-violet-400" : "text-white"
                    )}>
                        {isSaved ? "Saved" : "Save to Collection"}
                    </span>
                )}
                <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
            </Button>

            <AddToCollectionDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                imageId={imageId}
                initialIsSaved={isSaved}
                onGlobalSaveChange={handleGlobalSaveChange}
            />
        </>
    )
}
