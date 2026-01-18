'use client'

import { useState, useEffect } from "react"
import { getCanonicalTags, type CanonicalTag } from "@/app/actions/tagging/canonical"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface CanonicalTagPickerProps {
    domain: string | null
    selectedTagIds: Set<string>
    onToggle: (tagId: string) => void
}

export function CanonicalTagPicker({ domain, selectedTagIds, onToggle }: CanonicalTagPickerProps) {
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<Record<string, CanonicalTag[]>>({})

    useEffect(() => {
        if (!domain) {
            setCategories({})
            return
        }

        let mounted = true
        setLoading(true)

        getCanonicalTags(domain)
            .then((data) => {
                if (mounted) setCategories(data)
            })
            .finally(() => {
                if (mounted) setLoading(false)
            })

        return () => { mounted = false }
    }, [domain])

    if (!domain) return null

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                </div>
            </div>
        )
    }

    const categoryKeys = Object.keys(categories)

    if (categoryKeys.length === 0) {
        return (
            <div className="p-4 border border-dashed rounded-lg text-sm text-center text-muted-foreground">
                No tags available for this domain yet.
            </div>
        )
    }

    return (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <label className="text-sm font-medium text-muted-foreground">
                2. What does this image show? (Canonical)
            </label>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categoryKeys.map(cat => (
                    <div key={cat} className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary" />
                            {cat}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {categories[cat].map(tag => {
                                const isSelected = selectedTagIds.has(tag.id)
                                return (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => onToggle(tag.id)}
                                        className={cn(
                                            "group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                                            isSelected
                                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                : "bg-secondary/50 text-secondary-foreground border-transparent hover:bg-secondary hover:border-primary/20"
                                        )}
                                    >
                                        {isSelected && <Check className="w-3 h-3" />}
                                        {tag.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
