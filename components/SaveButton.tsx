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
                    showLabel && isSaved && "bg-black/50 text-white hover:bg-black/60", // Saved state (Dark pill)
                    showLabel && !isSaved && "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/20", // Unsaved state (Red pill)
                    className
                )}
            >
                <Bookmark
                    className={cn(
                        "w-5 h-5 transition-all duration-300",
                        isSaved ? "fill-white text-white" : "text-white fill-transparent", // Always white text/icon in pill mode usually
                        !showLabel && (isSaved ? "fill-red-600 text-red-600" : "text-zinc-600"), // Icon only mode
                        showLabel && "mr-2"
                    )}
                />
                {showLabel && (
                    <span className={cn(
                        "font-medium",
                        isSaved ? "text-white" : "text-white"
                    )}>
                        {isSaved ? "Saved" : "Save"}
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
