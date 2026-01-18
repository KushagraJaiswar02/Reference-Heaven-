export type ImageCardDTO = {
    id: string
    url: string
    title: string
    topic: string | null
    // Add aspect ratio or dimensions if available in DB, otherwise assume masonry handles it.
}

export type ImageDetailDTO = {
    image: {
        id: string
        url: string
        title: string
        description: string | null
        topic: string | null
        artist_id: string
        likes_count: number
        lighting_style: string | null
        perspective_angle: string | null
        color_palette: string[] | null
        created_at: string
        profiles: {
            username: string
            avatar_url: string
        } | null
    }
    canonicalTags: any[]
    authorTags: any[]
    communityTags: any[]
}

export type UserImageContextDTO = {
    isSaved: boolean
    userTags: any[]
}
