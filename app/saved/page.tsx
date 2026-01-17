import { createClient } from "@/utils/supabase/server"
import { MasonryGrid } from "@/components/gallery/MasonryGrid"
import { redirect } from "next/navigation"

export default async function SavedPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: saves, error } = await supabase
        .from('saves')
        .select(`
            image_id,
            images (
                *,
                profiles (
                    username,
                    avatar_url
                )
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching saved images:", error)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen pt-20">
                <p className="text-red-500">Failed to load saved images.</p>
            </div>
        )
    }

    // Transform data to match ImageType expected by MasonryGrid
    // The query returns { image_id, images: { ...image_data, profiles: {...} } }
    // We need to extract the 'images' object.
    const savedImages = saves
        ?.map(save => save.images)
        .filter(img => img !== null) as any[] || []

    return (
        <div className="min-h-screen bg-zinc-950 text-white pt-24 px-4 md:px-8">
            <div className="max-w-[1920px] mx-auto">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                        Your Saved References
                    </h1>
                    <span className="text-xs text-zinc-600 font-mono">
                        {savedImages.length} ITEMS
                    </span>
                </div>

                <MasonryGrid images={savedImages} />
            </div>
        </div>
    )
}
