
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
import { ImageEscapeHandler } from "@/components/gallery/ImageEscapeHandler"

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
        <div className="min-h-screen bg-black text-white">
            <ImageEscapeHandler />
            {/* Top Navigation (Back) - Absolute or sticky if needed, but absolute is fine for immersion */}
            <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white bg-black/50 backdrop-blur-md px-4 py-2 rounded-full transition-colors border border-white/10 hover:border-white/20">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Link>
                <div className="text-white/30 text-xs font-medium backdrop-blur-sm px-3 py-1.5 rounded-full bg-black/20 pointer-events-none select-none">
                    Press <span className="font-mono">Esc</span> to exit
                </div>
            </div>

            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* Left: Image Canvas (Scrollable vertically if tall, or constrained) 
                    For a Pinterest/ArtStation feel, usually we want the image to be fit-to-screen if acting as a lightbox, 
                    or scrollable if it's very tall. Let's go with a "Center Stage" approach.
                */}
                <div className="flex-1 bg-zinc-950 flex items-center justify-center p-4 lg:p-8 min-h-[50vh] lg:h-screen lg:sticky lg:top-0 overflow-hidden relative">
                    {/* 
                       Using h-screen + sticky on the image container makes the image stay put while you scroll down long specific details 
                       in the right panel (if the right panel is long). 
                       However, usually the *right* panel is the one that might be shorter than a very tall image? 
                       Actually, usually comments/tags make the *details* long. 
                       Let's make the *Right Panel* scrollable independently or naturally.
                       
                       Better Modern Pattern: 
                       - Left Side: Fixed centered image area (or scrollable for super tall images). 
                       - Right Side: Scrollable details. 
                     */}
                    <div className="relative w-full h-full max-h-[90vh] flex items-center justify-center">
                        <Image
                            src={image.url}
                            alt={image.title}
                            fill
                            className="object-contain drop-shadow-2xl"
                            priority
                            sizes="(max-width: 1024px) 100vw, 75vw"
                        />
                    </div>
                </div>

                {/* Right: Details Sidebar */}
                <div className="w-full lg:w-[450px] bg-zinc-900 border-l border-white/5 flex-shrink-0 relative z-20 shadow-2xl">
                    <ImageDetailsPanel
                        image={image}
                        currentUser={user}
                        currentUserId={user?.id}
                        isSaved={isSaved}
                        // Initial Data for SSR
                        initialCanonicalTags={canonicalTags}
                        initialAuthorTags={authorTags}
                        initialCommunityTags={communityTags}
                        initialUserTags={userTags}
                        initialIsFollowing={isFollowing}
                        className="h-full min-h-[50vh] lg:min-h-screen"
                    // Note: Internal details components should handle their scrolling/height if they want to be sticky, 
                    // or we let the window scroll. Let's let the window scroll for mobile, and maybe sticky scroll for desktop?
                    // Actually, simpler is best: The components inside just render content. 
                    // On desktop, if this right column is shorter than screen, fine. If longer, it scrolls.
                    // But wait, we set left side to sticky h-screen. So the page height is determined by the right side? 
                    // No, if image is sticky, page is at least 100vh.
                    />
                </div>
            </div>

            {/* Related Images Section - Below the split view */}
            <div className="bg-zinc-950 border-t border-white/5 relative z-30">
                <div className="container mx-auto px-4 py-12">
                    <h2 className="text-xl font-semibold mb-6">More like this</h2>
                    <Suspense fallback={<div className="w-full h-40 flex items-center justify-center text-zinc-500">Loading related images...</div>}>
                        <RelatedImages topic={image.topic} currentImageId={image.id} />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}
