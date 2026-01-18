import { getImageCanonicalTags } from "@/app/actions/tagging/canonical"
import { getAuthorTags } from "@/app/actions/tagging/author"
import { getPublicCommunityTags } from "@/app/actions/tagging/user"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { UserTagManager } from "@/components/tags/UserTagManager"
import { Skeleton } from "@/components/ui/skeleton"
import { Sparkles, Globe, ShieldCheck } from "lucide-react"

interface ImageTagsDisplayProps {
    imageId: string
    artistId: string
    currentUserId?: string
    // SSR Props
    initialCanonicalTags: any[]
    initialAuthorTags: any[]
    initialCommunityTags: any[]
    initialUserTags: any[]
}

export function ImageTagsDisplay({
    imageId,
    artistId,
    currentUserId,
    initialCanonicalTags,
    initialAuthorTags,
    initialCommunityTags,
    initialUserTags
}: ImageTagsDisplayProps) {
    // We can use state if we want to support updates, or just use props if read-only
    // But since UserTagManager handles updates, passing initial data down is key.

    // For this refactor, we remove the client-side fetch entirely!
    const canonicalTags = initialCanonicalTags
    const authorTags = initialAuthorTags
    const communityTags = initialCommunityTags

    // No useEffect fetching! 
    // Data is ready on mount.


    return (
        <div className="space-y-6 pt-4">

            {/* 1. Canonical Tags (Platform Truth) */}
            {canonicalTags.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Properties
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {canonicalTags.map((tag: any) => (
                            <Badge key={tag.id} variant="secondary" className="px-2.5 py-1 text-xs font-medium bg-secondary/50 hover:bg-secondary">
                                <span className="opacity-50 mr-1.5 font-normal capitalize">{tag.category}:</span>
                                {tag.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            {/* 2. Author Tags (Intent) */}
            {authorTags.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Author Intent
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {authorTags.map((tag: any) => (
                            <span key={tag.id} className="text-sm text-foreground/90 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-md">
                                {tag.tag_text}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <Separator />

            {/* 3. User Personal Tags (Private) */}
            <UserTagManager imageId={imageId} initialTags={initialUserTags} />

            {/* 4. Community Tags (Public Aggregate) */}
            {communityTags.length > 0 && (
                <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        Community Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {communityTags.map((tag: any) => (
                            <Badge key={tag.tag_text} variant="outline" className="text-xs text-muted-foreground border-dashed">
                                {tag.tag_text}
                                <span className="ml-1.5 text-[10px] bg-muted px-1 rounded-full">
                                    {tag.count}
                                </span>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
