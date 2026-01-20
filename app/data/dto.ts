// GRID DTO (Lightweight, <1KB ideal)
export type ImageCardDTO = {
    id: string
    thumbnailUrl: string // Optimized/Small URL
    aspectRatio: number // For Masonry layout
    title: string // Alt text / Minimal display
    author: {
        id: string
        username: string // For "By [Name]"
        avatar_url: string
    }
    stats: {
        likes_count: number
    }
    // No canonical tags, no heavy descriptions
}

// DETAIL DTO (Full payload, lazy loaded)
export type ImageDetailDTO = {
    image: {
        id: string
        url: string // Full Resolution / "Best" quality
        title: string
        description: string | null
        topic: string | null
        artist_id: string

        width: number
        height: number
        aspect_ratio: number

        likes_count: number
        created_at: string

        color_palette: string[] | null
        profiles: {
            username: string
            avatar_url: string
        } | null
    }

    // Metadata split
    canonicalTags: any[]
    authorTags: any[]
    communityTags: any[]
}

export type UserImageContextDTO = {
    isSaved: boolean
    userTags: any[]
}
