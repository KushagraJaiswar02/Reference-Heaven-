import { createClient } from "@/utils/supabase/server"
import { MasonryGrid } from "@/components/gallery/MasonryGrid"
import { redirect } from "next/navigation"
import { X, Tag } from "lucide-react"
import Link from "next/link"
import { ImageCardDTO } from "@/app/data/dto"
import { getGridThumbnailUrl } from "@/lib/image-optim"

interface TaggedPageProps {
    searchParams: Promise<{
        tag?: string
    }>
}

export default async function TaggedPage({ searchParams }: TaggedPageProps) {
    const { tag } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    if (!tag) {
        // If no tag provided, redirect back to profile or show empty? 
        // Better to list all tagged images? Or just redirect to profile.
        redirect(`/profile/${user.user_metadata.username || ''}`)
    }

    // 1. Fetch filtered tag records first
    const { data: tagRecords, error: tagError } = await supabase
        .from('user_tags')
        .select('image_id')
        .eq('user_id', user.id)
        .eq('tag_text', tag.toLowerCase())
        .order('created_at', { ascending: false })

    if (tagError) {
        console.error("Error fetching tags:", tagError)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen pt-20">
                <p className="text-red-500">Failed to load tags.</p>
            </div>
        )
    }

    if (!tagRecords || tagRecords.length === 0) {
        // Return empty state immediately
        return <TaggedPageContent tag={tag} user={user} images={[]} />
    }

    const imageIds = tagRecords.map((r: any) => r.image_id)

    // 2. Fetch images for these IDs
    const { data: imagesData, error: imagesError } = await supabase
        .from('images')
        .select(`
            id,
            url,
            title,
            topic,
            width,
            height,
            likes_count,
            profiles:artist_id (
                id,
                username,
                avatar_url
            )
        `)
        .in('id', imageIds)

    if (imagesError) {
        console.error("Error fetching images:", imagesError)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen pt-20">
                <p className="text-red-500">Failed to load images.</p>
            </div>
        )
    }

    // Transform to DTO
    const images: ImageCardDTO[] = (imagesData || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        thumbnailUrl: getGridThumbnailUrl(img.url),
        aspectRatio: (img.width && img.height) ? (img.width / img.height) : 1,
        title: img.title,
        topic: img.topic || '', // topic can be null
        author: {
            id: img.profiles?.id || 'unknown',
            username: img.profiles?.username || 'Unknown',
            avatar_url: img.profiles?.avatar_url || ''
        },
        stats: {
            likes_count: img.likes_count || 0
        }
    }))

    return <TaggedPageContent tag={tag} user={user} images={images} />
}

// Extracted UI Component for cleaner file structure
function TaggedPageContent({ tag, user, images }: { tag: string, user: any, images: ImageCardDTO[] }) {
    return (
        <div className="min-h-screen bg-zinc-950 text-white pt-24 px-4 md:px-8">
            <div className="max-w-[1920px] mx-auto">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                            <Tag className="w-6 h-6 text-zinc-400" />
                            Tagged: <span className="text-primary">{tag}</span>
                        </h1>
                        <Link href={`/profile/${user.user_metadata.username || user.id}`} className="p-2 hover:bg-white/10 rounded-full transition-colors ml-2" title="Back to Profile">
                            <X className="w-5 h-5 text-zinc-400 hover:text-white" />
                        </Link>
                    </div>
                    <span className="text-xs text-zinc-600 font-mono">
                        {images.length} RESULTS
                    </span>
                </div>

                {images.length > 0 ? (
                    <MasonryGrid images={images} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                        <p>No images found for this tag.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
