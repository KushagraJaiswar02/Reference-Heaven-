import { Image as ImageType } from "@/types"
import { VisitorImageDetails } from "./VisitorImageDetails"
import { OwnerImageDetails } from "./OwnerImageDetails"

interface ImageDetailsPanelProps {
    image: ImageType & { profiles: any }
    currentUser: any
    currentUserId?: string
    isSaved: boolean
    // SSR Data
    initialCanonicalTags: any[]
    initialAuthorTags: any[]
    initialCommunityTags: any[]
    initialUserTags: any[]
    className?: string
}

/**
 * Server Component Switcher
 * Decides whether to render the optimized Visitor view (Server Component)
 * or the heavy Interactive Owner view (Client Component).
 */
export function ImageDetailsPanel({
    image,
    currentUser,
    currentUserId,
    isSaved,
    initialCanonicalTags,
    initialAuthorTags,
    initialCommunityTags,
    initialUserTags,
    className
}: ImageDetailsPanelProps) {
    const isOwner = currentUserId && image.artist_id === currentUserId

    if (isOwner) {
        return (
            <OwnerImageDetails
                image={image}
                currentUserId={currentUserId}
                initialCanonicalTags={initialCanonicalTags}
                initialAuthorTags={initialAuthorTags}
                initialCommunityTags={initialCommunityTags}
                initialUserTags={initialUserTags}
                className={className}
            />
        )
    }

    return (
        <VisitorImageDetails
            image={image}
            currentUser={currentUser}
            isSaved={isSaved}
            initialCanonicalTags={initialCanonicalTags}
            initialAuthorTags={initialAuthorTags}
            initialCommunityTags={initialCommunityTags}
            initialUserTags={initialUserTags}
            className={className}
        />
    )
}
