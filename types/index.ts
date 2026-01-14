
export interface Image {
    id: string
    created_at: string
    title: string
    description?: string
    url: string
    width?: number
    height?: number
    artist_id: string
    topic?: string
    likes_count: number
    lighting_style?: string
    perspective_angle?: string
    color_palette?: string[]
    profiles?: {
        username: string
        avatar_url: string
    }
}
