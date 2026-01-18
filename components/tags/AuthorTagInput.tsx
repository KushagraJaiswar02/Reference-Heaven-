'use client'

import { useState, KeyboardEvent } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Plus, Sparkles } from "lucide-react"

interface AuthorTagInputProps {
    tags: string[]
    onChange: (tags: string[]) => void
    disabled?: boolean
}

export function AuthorTagInput({ tags, onChange, disabled }: AuthorTagInputProps) {
    const [inputValue, setInputValue] = useState("")
    const MAX_TAGS = 7

    const handleAdd = () => {
        const trimmed = inputValue.trim().toLowerCase()
        if (!trimmed) return
        if (tags.includes(trimmed)) {
            setInputValue("")
            return
        }
        if (tags.length >= MAX_TAGS) return

        onChange([...tags, trimmed])
        setInputValue("")
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd()
        }
    }

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(t => t !== tagToRemove))
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    3. Creator Intent (Optional)
                </label>
                <span className="text-xs text-muted-foreground">
                    {tags.length}/{MAX_TAGS}
                </span>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={disabled || tags.length >= MAX_TAGS}
                        placeholder={tags.length >= MAX_TAGS ? "Max tags reached" : "e.g., gesture practice, lighting study..."}
                        className="pr-10 bg-background/50"
                    />
                </div>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAdd}
                    disabled={!inputValue.trim() || tags.length >= MAX_TAGS || disabled}
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            <p className="text-[11px] text-muted-foreground">
                How should this image be used? (Max 7)
            </p>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map(tag => (
                        <Badge
                            key={tag}
                            variant="outline"
                            className="pl-3 pr-1 py-1 h-7 flex items-center gap-1 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/20 text-foreground"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 p-0.5 hover:bg-amber-500/20 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-3 h-3" />
                                <span className="sr-only">Remove</span>
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}
