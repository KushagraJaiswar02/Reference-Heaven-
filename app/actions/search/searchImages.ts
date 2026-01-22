'use server'

import { createClient } from "@/utils/supabase/server"
import { SearchRequest } from "@/app/lib/search/types"
import { ImageCardDTO } from "@/app/data/dto"

// Opaque cursor utils
function encodeCursor(partA: string | number, partB: string): string {
    return Buffer.from(`${partA},${partB}`).toString('base64')
}
function decodeCursor(cursor: string): { partA: string, partB: string } | null {
    try {
        const decoded = Buffer.from(cursor, 'base64').toString('utf-8')
        const [partA, partB] = decoded.split(',')
        if (!partA || !partB) return null
        return { partA, partB }
    } catch (e) {
        return null
    }
}

export async function searchImages(request: SearchRequest): Promise<{ items: ImageCardDTO[], nextCursor: string | null, hasMore: boolean }> {
    const supabase = await createClient()
    const { context, scope, filters, cursor, limit = 20 } = request

    // --- MODE 1: GLOBAL FEED (No Search Query) ---
    if (!scope.query || scope.query.trim().length === 0) {
        // Base Query (Typed as any to allow dynamic shape changes)
        let query: any = supabase.from('images').select(`
            id, url, title, topic, likes_count, created_at,
            profiles!inner (id, username, avatar_url),
            saves (user_id)
        `)

        // Context: Saved Only
        if (context.type === 'saved') {
            // Inner join on saves to filter by user
            // We use the trick: select existing saves relation with filter? 
            // Better: use the specific `!inner` alias if we set it up, or filter on the relation
            // `saves!inner(user_id)` ensures only images with this relation are returned.
            query = supabase.from('images').select(`
                id, url, title, topic, likes_count, created_at,
                profiles (id, username, avatar_url),
                saves!inner (user_id)
            `).eq('saves.user_id', context.userId)
        }

        // Context: Collection
        if (context.type === 'collection') {
            query = supabase.from('images').select(`
                id, url, title, topic, likes_count, created_at,
                profiles (id, username, avatar_url),
                collection_images!inner (collection_id)
            `).eq('collection_images.collection_id', context.collectionId)
        }

        // Filters (Domain, Author)
        if (filters.domain) query = query.eq('topic', filters.domain)
        if (filters.authorId) query = query.eq('artist_id', filters.authorId)

        // Cursor (created_at, id)
        query = query.order('created_at', { ascending: false })
            .order('id', { ascending: false })

        if (cursor) {
            const dec = decodeCursor(cursor)
            if (dec) {
                // created_at <= partA, id < partB
                query = query.or(`created_at.lt.${dec.partA},and(created_at.eq.${dec.partA},id.lt.${dec.partB})`)
            }
        }

        const { data, error } = await query.limit(limit + 1)

        if (error || !data) {
            console.error("Feed Error:", error)
            return { items: [], nextCursor: null, hasMore: false }
        }

        const hasMore = data.length > limit
        const items = hasMore ? data.slice(0, limit) : data

        return {
            items: items.map((img: any) => ({
                id: img.id,
                url: img.url,
                title: img.title,
                topic: img.topic,
                author: {
                    id: img.profiles?.id,
                    username: img.profiles?.username,
                    avatar_url: img.profiles?.avatar_url
                },
                stats: { likes_count: img.likes_count }
            })),
            nextCursor: (hasMore && items.length > 0)
                ? encodeCursor(items[items.length - 1].created_at, items[items.length - 1].id)
                : null,
            hasMore
        }
    }

    // --- MODE 2: SEARCH QUERY (Text Search) ---
    // Uses RPC for relevance sorting (Rank > Recency)
    // For V1, we implement a simpler flow: Fetch Ranked IDs -> Filter -> Return.
    // Ideally, we'd update the RPC to accept filters for performance.

    // Call RPC
    const { data: searchResults, error: rpcError } = await supabase
        .rpc('search_images_scored', {
            query_text: scope.query,
            input_limit: 100 // Hard cap for V1 search depth
        })

    if (rpcError || !searchResults) {
        return { items: [], nextCursor: null, hasMore: false }
    }

    let resultIds = searchResults.map((r: any) => r.id)

    if (resultIds.length === 0) return { items: [], nextCursor: null, hasMore: false }

    // Fetch Details for these IDs (preserving order?? In map we can)
    // Fetch Details for these IDs (preserving order?? In map we can)
    // Dynamic Select based on context
    let selectString = `
        id, url, title, topic, likes_count, created_at,
        profiles (id, username, avatar_url)
    `

    if (context.type === 'saved') {
        selectString += `, saves!inner(user_id)`
    }

    let detailsQuery: any = supabase.from('images').select(selectString).in('id', resultIds)

    // Apply Context Filter
    if (context.type === 'saved') {
        detailsQuery = detailsQuery.eq('saves.user_id', context.userId)
    }

    // Apply Filters (Post-Search constraint)
    if (filters.domain) detailsQuery = detailsQuery.eq('topic', filters.domain)

    const { data: details } = await detailsQuery;

    if (!details) return { items: [], nextCursor: null, hasMore: false }

    // Re-sort in memory based on Search Rank (since 'IN' query destroys order)
    const detailsMap = new Map(details.map((d: any) => [d.id, d]))
    const sortedItems = resultIds
        .map((id: string) => detailsMap.get(id))
        .filter((item: any) => item !== undefined) // Filter kept only matching items

    // Pagination for Search (Client-side slicing of the top 100 for now?)
    // Real search pagination requires Cursor on Rank. 
    // For V1, we just return the top N matches.

    return {
        items: sortedItems.map((img: any) => ({
            id: img.id,
            url: img.url,
            title: img.title,
            topic: img.topic,
            author: {
                id: img.profiles?.id,
                username: img.profiles?.username,
                avatar_url: img.profiles?.avatar_url
            },
            stats: { likes_count: img.likes_count }
        })),
        nextCursor: null, // V1 Search allows single page of most relevant
        hasMore: false
    }
}
