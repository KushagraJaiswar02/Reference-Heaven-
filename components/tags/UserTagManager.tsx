"use client"

import { useState, useEffect } from "react"
import { manageUserTag, removeUserTag, getUserTags, getUserUniqueTags } from "@/app/actions/tagging/user"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tag, Plus, X, Lock, Globe, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface UserTagManagerProps {
    imageId: string
    initialTags: any[]
}

type UserTag = {
    id: string
    tag_text: string
    is_public: boolean
}

export function UserTagManager({ imageId, initialTags }: UserTagManagerProps) {
    const [tags, setTags] = useState<UserTag[]>(initialTags)
    // Removed loading state since we have initial data
    const [inputValue, setInputValue] = useState("")
    const [isPublic, setIsPublic] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [suggestions, setSuggestions] = useState<string[]>([])

    // Refetch logic remains for after-mutation sync
    const fetchTags = async () => {
        const data = await getUserTags(imageId)
        setTags(data)
    }

    const fetchSuggestions = async () => {
        const uniqueTags = await getUserUniqueTags()
        setSuggestions(uniqueTags || [])
    }

    useEffect(() => {
        // Only fetch suggestions on mount, tags are already here!
        fetchSuggestions()
    }, [])

    const handleAdd = async () => {
        const cleanVal = inputValue.trim().toLowerCase()
        if (!cleanVal) return

        if (tags.length >= 3) {
            // Visual feedback already handled by disabled state, but safety check
            return
        }

        setSubmitting(true)

        // Optimistic update
        const tempId = Math.random().toString()
        const newTag: UserTag = {
            id: tempId,
            tag_text: cleanVal,
            is_public: isPublic
        }
        setTags(prev => [...prev, newTag])
        setInputValue("")

        const res = await manageUserTag(imageId, newTag.tag_text, isPublic)

        if (res.error) {
            // Revert on error
            setTags(prev => prev.filter(t => t.id !== tempId))
            console.error(res.error)
        } else {
            await fetchTags() // Refresh true ID
            fetchSuggestions() // Update list
        }

        setSubmitting(false)
    }

    const handleRemove = async (tagId: string) => {
        setTags(prev => prev.filter(t => t.id !== tagId))
        const res = await removeUserTag(tagId, imageId)
        if (res.error) {
            console.error(res.error)
            fetchTags() // Revert
        }
    }

    const limitReached = tags.length >= 3

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    Your Tags <span className="text-[10px] uppercase font-normal text-muted-foreground ml-1">(Private)</span>
                </h4>
                <span className={cn("text-xs font-medium", limitReached ? "text-red-400" : "text-muted-foreground")}>
                    {tags.length} / 3
                </span>
            </div>

            <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        placeholder={limitReached ? "Limit reached (3 tags max)" : "Add private tag..."}
                        className="h-9 pr-8"
                        disabled={submitting || limitReached}
                        list="user-tags-suggestions"
                        suppressHydrationWarning
                    />
                    <datalist id="user-tags-suggestions">
                        {suggestions.map(s => <option key={s} value={s} />)}
                    </datalist>
                </div>

                <div className="flex items-center gap-2" title="Make tag public?">
                    <Switch
                        checked={isPublic}
                        onCheckedChange={setIsPublic}
                        id="public-mode"
                        className="scale-75"
                        disabled={limitReached}
                    />
                    <label htmlFor="public-mode" className="sr-only">Public</label>
                    {isPublic ? <Globe className="w-4 h-4 text-blue-400" /> : <Lock className="w-4 h-4 text-muted-foreground" />}
                </div>

                <Button size="sm" onClick={handleAdd} disabled={!inputValue.trim() || submitting || limitReached}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </Button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[2rem]">
                {tags.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">No personal tags yet.</span>
                ) : (
                    tags.map(tag => (
                        <Badge
                            key={tag.id}
                            variant="outline"
                            className={cn(
                                "pl-2.5 pr-1 py-0.5 text-xs font-normal flex items-center bg-background/50 backdrop-blur-sm transition-all hover:bg-background/80",
                                tag.is_public ? "border-blue-500/30 text-blue-500" : "border-border text-foreground"
                            )}
                        >
                            {tag.is_public && <Globe className="w-3 h-3 mr-1 opacity-70" />}
                            {tag.tag_text}
                            <button onClick={() => handleRemove(tag.id)} className="ml-1.5 p-0.5 hover:bg-destructive/10 hover:text-destructive rounded-full">
                                <X className="w-3 h-3" />
                                <span className="sr-only">Remove</span>
                            </button>
                        </Badge>
                    ))
                )}
            </div>
        </div>
    )
}
