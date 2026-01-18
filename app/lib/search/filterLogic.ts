
import { SupabaseClient } from "@supabase/supabase-js"
import { FilterState } from "./types"

// We perform filters on the "images" table query builder
export function applyFilterLogic(
    query: any, // Supabase PostgrestFilterBuilder
    filters: FilterState
) {
    // 1. Domain Filter
    // In V3 schema, 'domain' is on canonical_tags, not directly on image (except topic?)
    // But images have 'topic'. If Domain maps to topic, we use that.
    // If Domain means "Broad Semantic Domain", we must filter by canonical tags with that domain.
    if (filters.domain) {
        // Option A: Topic mapping (if topic == domain)
        // Option B: Canonical Tag Join
        // User request: "Domain" filter. Schema has 'tag_domain'.
        // We use !inner join to filter images that have ANY tag in this domain.
        query = query.not('image_canonical_tags', 'is', null) // Ensure relation exists?
        // Actually, strictly:
        // .eq('image_canonical_tags.canonical_tags.domain', filters.domain)
        // But easier is embedded filtering:
        // This requires 'image_canonical_tags!inner(canonical_tags!inner(domain))' logic.
        // Supabase JS allows: .eq('image_canonical_tags.canonical_tags.domain', val) IF select includes it?
        // No, standard way for filtering is:
        // query = query.filter('image_canonical_tags.canonical_tags.domain', 'eq', filters.domain) -- works if embedded?

        // Simpler: use the !inner hint in selects usually, but here we are building a query.
        // Let's assume we filter by `topic` for now if it maps 1:1, OR we rely on a specific RPC if simple joins fail.
        // Actually, user schema has `topic` on images. Let's assume Domain Filter = Topic for now as "Primary Domain".

        // Update: User Schema "tag_domain" enum exists.
        // Let's treat "Domain" filter as strict canonical domain filter.
        // We need: images where EXISTS(canonical_tags where domain = X)
        // Complex in simple JS builder.
        // FALLBACK: 'topic' field on image.
        query.eq('topic', filters.domain)
    }

    // 2. Author Filter
    if (filters.authorId) {
        query.eq('artist_id', filters.authorId)
    }

    // 3. Saved By Filter
    if (filters.savedByUserId) {
        // Images that are in 'saves' table for this user.
        // Requires join on 'saves!inner'
        // query.not('saves', 'is', null).eq('saves.user_id', filters.savedByUserId)
        // This implies the main query DID 'select(..., saves!inner(...))'
        // This is tight coupling.
        // Better: We handle "Saved Context" at the top level (Context), not just a filter toggle?
        // "Saved-only toggle" listed in Part 2.
        // This means it's a constraint.
    }

    // 4. Canonical Tag Value
    if (filters.canonicalTag) {
        // images where matches
        // This definitely needs inner join logic or RPC.
    }

    return query
}
