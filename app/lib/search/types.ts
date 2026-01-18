
export type SearchContext =
    | { type: 'global' }
    | { type: 'saved'; userId: string }
    | { type: 'collection'; collectionId: string }

export type SearchScope = {
    query?: string // The text query
}

export type FilterState = {
    domain?: string // Linked to 'topic' or canonical 'domain'
    canonicalCategory?: string
    canonicalTag?: string // The specific tag value
    authorId?: string
    savedByUserId?: string // "Saved only" toggle for complex contexts
}

// Composed Input for the Orchestrator
export type SearchRequest = {
    context: SearchContext
    scope: SearchScope
    filters: FilterState
    cursor?: string // Encoded cursor
    limit?: number
}
