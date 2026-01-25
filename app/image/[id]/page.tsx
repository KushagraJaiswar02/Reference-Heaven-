
import { createClient } from "@/utils/supabase/server"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ImageDetailsPanel } from "@/components/gallery/ImageDetailsPanel"
import { getPublicImageDetails, getUserImageContext } from "@/app/data/image"
import { getFollowStatus } from "@/app/actions/follow"
import { RelatedImages } from "@/components/gallery/RelatedImages"
import { Suspense } from "react"

export default async function ImagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Fetch Data in Parallel (SSR)
    const [publicData, userContext] = await Promise.all([
        getPublicImageDetails(id),
        getUserImageContext(id)
    ])

    if (!publicData) {
        return notFound()
    }

    const { image, canonicalTags, authorTags, communityTags } = publicData
    const { isSaved, userTags } = userContext

    // Get current user for ID passing & Follow check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isFollowing = user ? await getFollowStatus(image.artist_id) : false

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center">
            {/* Back Nav */}
            <div className="w-full max-w-7xl mb-4">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Gallery
                </Link>
            </div>

            <div className="bg-card rounded-3xl overflow-hidden shadow-2xl max-w-7xl w-full flex flex-col md:flex-row min-h-[80vh]">

                {/* Image Section */}
                <div className="md:w-3/4 bg-black flex items-center justify-center p-4">
                    <div className="relative w-full h-[70vh] md:h-[80vh]">
                        <Image
                            src={image.url}
                            alt={image.title}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <ImageDetailsPanel
                    image={image}
                    currentUser={user}
                    currentUserId={user?.id}
                    isSaved={isSaved}
                    // Initial Data for SSR (No waterfalls)
                    initialCanonicalTags={canonicalTags}
                    initialAuthorTags={authorTags}
                    initialCommunityTags={communityTags}
                    initialUserTags={userTags}
                    initialIsFollowing={isFollowing}
                    className="w-full md:w-[400px] bg-zinc-900 border-l border-white/5 h-full flex-shrink-0"
                />
            </div>

            {/* Related Images / Rabbit Hole */}
            <Suspense fallback={<div className="w-full h-40 mt-12 flex items-center justify-center text-zinc-500">Loading related images...</div>}>
                <RelatedImages topic={image.topic} currentImageId={image.id} />
            </Suspense>
        </div>
    )
}
