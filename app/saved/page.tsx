
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
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative pt-20 pb-12 md:pt-32 md:pb-20 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                            Saved <span className="text-indigo-600 dark:text-indigo-400">References</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Your personal vault of inspiration.
                        </p>
                    </div>
                </div>

                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-30 dark:opacity-20">
                    <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl transform translate-y-1/2"></div>
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-8 pb-20">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-semibold tracking-tight">Library</h2>
                        {tag && (
                            <div className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-800">
                                <Tag className="w-3.5 h-3.5" />
                                <span>{tag}</span>
                                <Link href="/saved" className="ml-1 hover:text-foreground transition-colors p-0.5 rounded-full hover:bg-white/50 dark:hover:bg-black/20">
                                    <X className="w-3 h-3" />
                                </Link>
                            </div>
                        )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {savedImages.length} ITEMS
                    </span>
                </div>

                {savedImages.length > 0 ? (
                    <MasonryGrid images={savedImages} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-muted rounded-3xl bg-muted/20">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                        </div>
                        {tag ? (
                            <>
                                <h3 className="text-xl font-semibold mb-2">No matches found</h3>
                                <p className="text-muted-foreground">No saved images found with tag &quot;{tag}&quot;</p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-xl font-semibold mb-2">Your library is empty</h3>
                                <p className="text-muted-foreground mb-6 max-w-sm">
                                    Save images from the gallery to build your personal reference collection.
                                </p>
                                <Link href="/">
                                    <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg shadow-indigo-500/20">
                                        Explore Gallery
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
