'use server'

import { createClient } from "@/utils/supabase/server"
import { ImageCardDTO } from "@/app/data/dto"

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
            topic,
            likes_count,
            created_at,
            profiles (
                id,
                username,
                avatar_url
            )
        `)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(limit + 1) // Fetch one extra to check hasMore

    // 2. Apply Cursor
    if (cursor) {
        const decoded = decodeCursor(cursor)
        if (decoded) {
            // WHERE (created_at < t) OR (created_at = t AND id < id)
            // Supabase/Postgrest syntax for row-value comparison is tricky in JS client
            // Easier simplifiction for simple sort:
            // .lt('created_at', decoded.timestamp) 
            // BUT that fails on duplicate timestamps (rare but possible).
            // Robust way: Filter strictly less than the composite cursor.

            // Using logic: created_at <= timestamp 
            // If created_at == timestamp, then id < id

            // PostgREST doesn't support tuple comparison (a,b) < (x,y) directly in JS builder easily yet?
            // Actually it does via .lt('(created_at,id)', `('${decoded.timestamp}','${decoded.id}')`)
            // Let's try the robust tuple filter if supported, or the "lte" filter + client side filter? NO.
            // Let's use the explicit string filter method.

            const timestamp = decoded.timestamp
            const id = decoded.id

            // Using standard SQL logic translated to Supabase Filter
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
    const mappedItems: ImageCardDTO[] = items.map((img: any) => ({
        id: img.id,
        url: img.url,
        title: img.title,
        topic: img.topic,
        author: {
            id: img.profiles?.id || 'unknown',
            username: img.profiles?.username || 'Unknown',
            avatar_url: img.profiles?.avatar_url || ''
        },
        stats: {
            likes_count: img.likes_count || 0
        }
    }))

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
