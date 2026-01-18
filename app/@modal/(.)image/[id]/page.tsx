import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { ImageModalClient } from "@/components/gallery/ImageModalClient"
import { getPublicImageDetails, getUserImageContext } from "@/app/data/image"

export default async function ImageModalPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Server-side parallel fetching!
    const [publicData, userContext] = await Promise.all([
        getPublicImageDetails(id),
        getUserImageContext(id)
    ])

    if (!publicData) {
        return notFound()
    }

    const { image, canonicalTags, authorTags, communityTags } = publicData
    const { isSaved, userTags } = userContext

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <ImageModalClient
            image={image}
            currentUser={user}
            isSaved={isSaved}
            initialCanonicalTags={canonicalTags}
            initialAuthorTags={authorTags}
            initialCommunityTags={communityTags}
            initialUserTags={userTags}
        />
    )
}
