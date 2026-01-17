import { createClient } from "@/utils/supabase/server"
import { MasonryGrid } from "@/components/gallery/MasonryGrid"
import { notFound, redirect } from "next/navigation"

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
                *,
                profiles:artist_id (
                    username,
                    avatar_url
                )
            )
        `)
        .eq('collection_id', id)
        .order('created_at', { ascending: false })

    const images = collectionImages
        ?.map((item: any) => item.images)
        .filter((img: any) => img !== null) || []

    return (
        <div className="min-h-screen bg-zinc-950 text-white pt-24 px-4 md:px-8">
            <div className="max-w-[1920px] mx-auto">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">{collection.name}</h1>
                        <p className="text-zinc-500 text-sm mt-1">Collection</p>
                    </div>
                    <span className="text-xs text-zinc-600 font-mono">
                        {images.length} ITEMS
                    </span>
                </div>

                {images.length > 0 ? (
                    <MasonryGrid images={images} />
                ) : (
                    <div className="py-20 text-center text-zinc-500">
                        <p>No images in this collection yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
