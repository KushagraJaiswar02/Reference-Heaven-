
export interface Image {
    id: string
    created_at: string
    title: string
    description?: string | null
    url: string
    width?: number | null
    height?: number | null
    artist_id: string
    topic?: string | null
    likes_count: number

    color_palette?: string[] | null
    profiles?: {
        username: string
        avatar_url: string
    } | null
}
