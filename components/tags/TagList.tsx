"use client"

import { Badge } from "@/components/ui/badge"
import { removeTagFromImage } from "@/app/actions/tags" // Assuming this action exists
import { X } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Tag {
    id: string // The Relationship ID (image_tag id)
    tagId: string
    name: string
    category: string
    userId: string
}

interface TagListProps {
    tags: Tag[]
    currentUserId?: string
    imageOwnerId: string
}

export function TagList({ tags, currentUserId, imageOwnerId }: TagListProps) {
    const router = useRouter()

    const handleRemove = async (tagId: string) => {
        const result = await removeTagFromImage(tagId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Tag removed")
            router.refresh()
        }
    }

    // Group tags by category
    const groupedTags = tags.reduce((acc, tag) => {
        if (!acc[tag.category]) acc[tag.category] = []
        acc[tag.category].push(tag)
        return acc
    }, {} as Record<string, Tag[]>)

    return (
        <div className="space-y-4">
            {Object.entries(groupedTags).map(([category, categoryTags]) => (
                <div key={category} className="space-y-2">
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                        {categoryTags.map(tag => {
                            const canDelete = currentUserId && (currentUserId === tag.userId || currentUserId === imageOwnerId)

                            return (
                                <Badge
                                    key={tag.id}
                                    variant="secondary"
                                    className="bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-colors py-1 px-3 gap-1 group"
                                >
                                    {tag.name}
                                    {canDelete && (
                                        <button
                                            onClick={() => handleRemove(tag.id)}
                                            className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-zinc-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 focus:outline-none"
                                        >
                                            <X className="w-3 h-3" />
                                            <span className="sr-only">Remove tag</span>
                                        </button>
                                    )}
                                </Badge>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}
