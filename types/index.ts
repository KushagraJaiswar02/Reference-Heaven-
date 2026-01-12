
export interface ReferenceImage {
    id: string
    url: string
    title: string
    artist_name: string
    source_url?: string
    technical_tags: string[]
    created_at?: string
}

export type ReferenceImageInput = Omit<ReferenceImage, 'id' | 'created_at'>
