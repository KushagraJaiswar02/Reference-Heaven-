
import { createClient } from "@/utils/supabase/server"
import { MasonryGrid } from "@/components/gallery/MasonryGrid"
import { redirect } from "next/navigation"
import { X, Tag } from "lucide-react"
import Link from "next/link"
import { ImageCardDTO } from "@/app/data/dto"
import { getGridThumbnailUrl } from "@/lib/image-optim"

interface SavedPageProps {
    searchParams: Promise<{
        tag?: string
    }>
}

export default async function SavedPage({ searchParams }: SavedPageProps) {
    const { tag } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    let query = supabase
        .from('saves')
        .select(`
            image_id,
            images (
                id,
                url,
                title,
                topic,
                width,
                height,
                artist_id,
                likes_count,
                 profiles:artist_id (
                    username,
                    avatar_url
                 )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    // Filter by tag if present
    let imageIdsToKeep: string[] | null = null
    if (tag) {
        const { data: tagM } = await supabase
            .from('user_tags')
            .select('image_id')
            .eq('user_id', user.id)
            .eq('tag_text', tag)

        if (tagM) {
            imageIdsToKeep = tagM.map(t => t.image_id)
        }
    }

    // Apply filter if we successfully resolved IDs
    if (tag && imageIdsToKeep) {
        // If no images found for tag, force empty match
        if (imageIdsToKeep.length === 0) {
            query = query.in('image_id', ['00000000-0000-0000-0000-000000000000']) // Zero match
        } else {
            query = query.in('image_id', imageIdsToKeep)
        }
    }

    const { data: saves, error } = await query

    if (error) {
        console.error("Error fetching saved images:", error)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen pt-20">
                <p className="text-red-500">Failed to load saved images.</p>
            </div>
        )
    }

    const savedImages: ImageCardDTO[] = (saves || [])
        .map((save: any) => save.images)
        .filter((img: any) => img !== null)
        .map((img: any) => ({
            id: img.id,
            url: img.url,
            thumbnailUrl: getGridThumbnailUrl(img.url),
            aspectRatio: (img.width && img.height) ? (img.width / img.height) : 1,
            title: img.title,
            author: {
                id: img.profiles?.id || 'unknown',
                username: img.profiles?.username || 'Unknown',
                avatar_url: img.profiles?.avatar_url || ''
            },
            stats: { likes_count: img.likes_count || 0 }
        }))

    return (
        <div className="min-h-screen bg-zinc-950 text-white pt-24 px-4 md:px-8">
            <div className="max-w-[1920px] mx-auto">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold tracking-tight text-white">
                            Your Saved References
                        </h1>
                        {tag && (
                            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
                                <Tag className="w-3 h-3" />
                                <span className="text-sm font-medium">{tag}</span>
                                <Link href="/saved" className="ml-1 hover:text-white transition-colors">
                                    <X className="w-3 h-3" />
                                </Link>
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-zinc-600 font-mono">
                        {savedImages.length} ITEMS
                    </span>
                </div>

                {savedImages.length > 0 ? (
                    <MasonryGrid images={savedImages} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                        {tag ? (
                            <p>No saved images found with tag &quot;{tag}&quot;</p>
                        ) : (
                            <p className="text-lg">No saved images yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
