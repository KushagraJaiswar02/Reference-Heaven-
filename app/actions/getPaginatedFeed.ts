'use server'

import { createClient } from "@/utils/supabase/server"
import { ImageCardDTO } from "@/app/data/dto"
import { getGridThumbnailUrl } from "@/lib/image-optim"

// Rule: Opaque cursor encoded in Base64
// Format: "timestamp,id"
function encodeCursor(timestamp: string, id: string): string {
    return Buffer.from(`${timestamp},${id}`).toString('base64')
}

function decodeCursor(cursor: string): { timestamp: string, id: string } | null {
    try {
        const decoded = Buffer.from(cursor, 'base64').toString('utf-8')
        const [timestamp, id] = decoded.split(',')
        if (!timestamp || !id) return null
        return { timestamp, id }
    } catch (e) {
        return null
    }
}

interface PaginatedFeedResponse {
    items: ImageCardDTO[]
    nextCursor: string | null
    hasMore: boolean
}

export async function getPaginatedFeed(cursor?: string, limit: number = 20): Promise<PaginatedFeedResponse> {
    const supabase = await createClient()

    // 1. Base Query
    let query = supabase
        .from('images')
        .select(`
            id,
            url,
            title,
            width,
            height,
            likes_count,
            created_at,
            profiles (
                id,
                username,
                avatar_url
            )
        `) // removed 'topic', 'description'
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit + 1)

    // 2. Apply Cursor
    if (cursor) {
        const decoded = decodeCursor(cursor)
        if (decoded) {
            const timestamp = decoded.timestamp
            const id = decoded.id

            // (created_at < timestamp) OR (created_at = timestamp AND id < id)
            query = query.or(`created_at.lt.${timestamp},and(created_at.eq.${timestamp},id.lt.${id})`)
        }
    }

    const { data, error } = await query

    if (error) {
        console.error("Feed fetch error:", error)
        return { items: [], nextCursor: null, hasMore: false }
    }

    // 3. Process Result
    const hasMore = data.length > limit
    const items = hasMore ? data.slice(0, limit) : data

    // 4. Map to DTO
    const mappedItems: ImageCardDTO[] = items.map((img: any) => {
        // Calculate Aspect Ratio (Default to 1 if missing)
        const width = img.width || 1000
        const height = img.height || 1000
        const aspectRatio = width / height

        return {
            id: img.id,
            thumbnailUrl: getGridThumbnailUrl(img.url),
            aspectRatio: aspectRatio,
            title: img.title,
            author: {
                id: img.profiles?.id || 'unknown',
                username: img.profiles?.username || 'Unknown',
                avatar_url: img.profiles?.avatar_url || ''
            },
            stats: {
                likes_count: img.likes_count || 0
            }
        }
    })

    // 5. Generate Next Cursor
    let nextCursor = null
    if (hasMore && items.length > 0) {
        const lastItem = items[items.length - 1]
        nextCursor = encodeCursor(lastItem.created_at, lastItem.id)
    }

    return {
        items: mappedItems,
        nextCursor,
        hasMore
    }
}
