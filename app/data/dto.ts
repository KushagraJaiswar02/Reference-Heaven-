export type ImageCardDTO = {
    id: string
    url: string
    title: string
    topic: string | null
    author: {
        id: string
        username: string
        avatar_url: string
    }
    stats: {
        likes_count: number
    }
    // Minimal for list view
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
