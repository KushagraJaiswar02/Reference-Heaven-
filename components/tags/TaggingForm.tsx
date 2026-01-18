'use client'

import { useState } from "react"
import { DomainSelector, type TagDomain } from "./DomainSelector"
import { CanonicalTagPicker } from "./CanonicalTagPicker"
import { AuthorTagInput } from "./AuthorTagInput"
import { Separator } from "@/components/ui/separator"

export interface TaggingData {
    domain: string | null
    canonicalTagIds: string[]
    authorTags: string[]
}

interface TaggingFormProps {
    initialData?: TaggingData
    onChange: (data: TaggingData) => void
}

export function TaggingForm({ initialData, onChange }: TaggingFormProps) {
    const [domain, setDomain] = useState<TagDomain | null>((initialData?.domain as TagDomain) || null)
    const [canonicalIds, setCanonicalIds] = useState<Set<string>>(new Set(initialData?.canonicalTagIds || []))
    const [authorTags, setAuthorTags] = useState<string[]>(initialData?.authorTags || [])

    const updateParent = (
        newDomain: TagDomain | null,
        newCanonical: Set<string>,
        newAuthor: string[]
    ) => {
        onChange({
            domain: newDomain,
            canonicalTagIds: Array.from(newCanonical),
            authorTags: newAuthor
        })
    }

    const handleDomainSelect = (d: TagDomain) => {
        // If domain changes, we strictly should clear canonical tags as they are domain specific
        // unless we want to keep them if they exist in new domain (unlikely/complex)
        // For now, clear them to enforce consistency.
        const isNew = d !== domain
        const nextCanonical = isNew ? new Set<string>() : canonicalIds

        setDomain(d)
        setCanonicalIds(nextCanonical)
        updateParent(d, nextCanonical, authorTags)
    }

    const handleCanonicalToggle = (id: string) => {
        const next = new Set(canonicalIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)

        setCanonicalIds(next)
        updateParent(domain, next, authorTags)
    }

    const handleAuthorTagsChange = (tags: string[]) => {
        setAuthorTags(tags)
        updateParent(domain, canonicalIds, tags)
    }

    return (
        <div className="space-y-8 p-6 rounded-xl border bg-card/30 backdrop-blur-sm">
            <div>
                <h3 className="text-lg font-semibold mb-1">Image Tagging</h3>
                <p className="text-sm text-muted-foreground">Categorize your image to help others find it.</p>
            </div>

            <DomainSelector
                selected={domain}
                onSelect={handleDomainSelect}
            />

            {domain && (
                <>
                    <Separator className="bg-border/50" />

                    <CanonicalTagPicker
                        domain={domain}
                        selectedTagIds={canonicalIds}
                        onToggle={handleCanonicalToggle}
                    />
                </>
            )}

            <Separator className="bg-border/50" />

            <AuthorTagInput
                tags={authorTags}
                onChange={handleAuthorTagsChange}
            />
        </div>
    )
}
