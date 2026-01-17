"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { addTagToImage } from "@/app/actions/tags" // Assuming this action exists
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const CATEGORIES = [
    "Pose",
    "Angle",
    "Lighting",
    "Mood",
    "Anatomy",
    "Clothing",
    "Color"
]

interface TagInputProps {
    imageId: string
    onTagAdded?: () => void
}

export function TagInput({ imageId, onTagAdded }: TagInputProps) {
    const [tag, setTag] = useState("")
    const [category, setCategory] = useState(CATEGORIES[0])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddTag()
        }
    }

    const handleAddTag = async () => {
        if (!tag.trim()) return

        setIsSubmitting(true)
        const result = await addTagToImage(imageId, tag, category)
        setIsSubmitting(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Tag added")
            setTag("")
            router.refresh()
            onTagAdded?.()
        }
    }

    return (
        <div className="flex gap-2 items-center">
            <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[110px] bg-zinc-900 border-zinc-700 h-9 text-xs">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                    {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c} className="focus:bg-zinc-800 focus:text-white cursor-pointer text-xs">
                            {c}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Input
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add tag..."
                className="bg-zinc-900 border-zinc-700 h-9 text-sm focus-visible:ring-indigo-500"
                disabled={isSubmitting}
            />

            <Button
                size="icon"
                variant="ghost"
                onClick={handleAddTag}
                disabled={!tag.trim() || isSubmitting}
                className="h-9 w-9 shrink-0 hover:bg-zinc-800"
            >
                {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                ) : (
                    <Plus className="w-4 h-4 text-zinc-400" />
                )}
            </Button>
        </div>
    )
}
