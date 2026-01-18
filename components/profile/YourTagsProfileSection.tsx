"use client"

import { Badge } from "@/components/ui/badge"
import { Tag } from "lucide-react"

interface YourTagsProfileSectionProps {
    tags: { tag: string, count: number }[]
}

export function YourTagsProfileSection({ tags }: YourTagsProfileSectionProps) {
    // Removed early return to ensure visibility

    return (
        <div className="w-full mt-6 bg-zinc-900/50 rounded-xl p-6 border border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Your Private Tags
            </h3>

            {tags.length === 0 ? (
                <div className="text-sm text-zinc-600 italic">
                    You haven't created any personal tags yet.
                    <br />
                    Add them to images to organize your workflow.
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {tags.map(({ tag, count }) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-black/40 hover:bg-black/60 text-zinc-300 border border-white/5 px-3 py-1 cursor-pointer transition-colors"
                            onClick={() => window.location.href = `/tagged?tag=${encodeURIComponent(tag)}`}
                        >
                            {tag}
                            <span className="ml-2 text-[10px] bg-white/10 px-1.5 rounded-full text-zinc-500">
                                {count}
                            </span>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}
