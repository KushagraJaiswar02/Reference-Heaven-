import { createClient } from "@/utils/supabase/server"
import { MasonryGrid } from "@/components/gallery/MasonryGrid"
import { ImageCardDTO } from "@/app/data/dto"
import { notFound, redirect } from "next/navigation"
import { getGridThumbnailUrl } from "@/lib/image-optim"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { DeleteCollectionButton } from "@/components/collections/DeleteCollectionButton"

interface Props {
    params: Promise<{
        id: string
    }>
}

export default async function CollectionPage({ params }: Props) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    // Fetch collection info
    const { data: collection, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('id', id)
        .single()

    if (collectionError || !collection) {
        notFound()
    }

    // Fetch images in collection
    const { data: collectionImages, error: imagesError } = await supabase
        .from('collection_images')
        .select(`
            image_id,
            images (
                id,
                url,
                title,
                width,
                height,
                likes_count,
                profiles:artist_id (
                    id,
                    username,
                    avatar_url
                )
            )
        `)
        .eq('collection_id', id)
        .order('created_at', { ascending: false })

    const images = collectionImages
        ?.map((item: any) => {
            const img = item.images
            if (!img) return null

            return {
                id: img.id,
                url: img.url,
                thumbnailUrl: getGridThumbnailUrl(img.url),
                aspectRatio: (img.width && img.height) ? (img.width / img.height) : 1,
                title: img.title,
                author: {
                    id: img.profiles?.id || '',
                    username: img.profiles?.username || 'Unknown',
                    avatar_url: img.profiles?.avatar_url || ''
                },
                stats: {
                    likes_count: img.likes_count || 0
                }
            }
        })
        .filter((img: any) => img !== null) as unknown as ImageCardDTO[] || []

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header / Hero */}
            <div className="bg-muted/30 border-b border-border">
                <div className="container mx-auto px-4 py-12 md:py-20">
                    <div className="mb-8">
                        <Link
                            href="/collections"
                            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back to Collections
                        </Link>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                                {collection.name}
                            </h1>
                            <p className="text-muted-foreground max-w-xl text-lg">
                                A curated collection of references.
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="bg-muted px-3 py-1 rounded-full font-medium">
                                    {images.length} items
                                </span>
                                <span>
                                    Created {new Date(collection.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        {user.id === collection.user_id && (
                            <div className="flex items-center gap-2">
                                <DeleteCollectionButton
                                    collectionId={collection.id}
                                    collectionName={collection.name}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="container mx-auto px-4 py-8 md:py-12">
                {images.length > 0 ? (
                    <MasonryGrid images={images} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl border-2 border-dashed border-muted bg-muted/10">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Collection is empty</h3>
                        <p className="text-muted-foreground mb-6">
                            Start adding items to this collection from the gallery.
                        </p>
                        <Link href="/">
                            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg shadow-indigo-500/20">
                                Explore Images
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
