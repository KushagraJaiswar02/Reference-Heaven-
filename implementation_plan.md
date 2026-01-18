# Search & Filter Architecture (V1)

## 1. Domain Models (`app/lib/search/types.ts`)

Define the separate contracts for Search and Filters.

```typescript
export type SearchContext = 
  | { type: 'global' }
  | { type: 'saved'; userId: string }
  | { type: 'collection'; collectionId: string }

export type SearchScope = {
  query?: string // The text query
}

export type FilterState = {
  domain?: string
  canonicalCategory?: string
  canonicalTag?: string // The specific tag value
  authorId?: string
  savedByUserId?: string // "Saved only" toggle
}

// Composed Input for the Orchestrator
export type SearchRequest = {
  context: SearchContext
  scope: SearchScope
  filters: FilterState
  cursor?: string
  limit?: number
}
```

## 2. Part 1: Search System (`app/lib/search/searchLogic.ts`)

Responsible for **Relevance**.

- **Input**: `SupabaseClient`, `QueryBuilder`, `SearchScope`
- **Logic**: 
    - If `query` is empty -> Result is "All items" (Recency sort).
    - If `query` exists:
        - Must construct a relevance match using SQL search features.
        - **Strategy**: We will use a dedicated RPC function `search_images_scored` to handle the weighted ranking (Canonical > Author > Title) which is impossible to do efficiently with just Supabase JS `or()` filters.

## 3. Part 2: Filter System (`app/lib/search/filterLogic.ts`)

Responsible for **Constraints**.

- **Input**: `SupabaseClient`, `QueryBuilder`, `FilterState`
- **Logic**:
    - Applies boolean constraints (likely via `!inner` joins for tag associations).
    - Returns the modified QueryBuilder.

## 4. Part 3: Composition (`app/actions/search/searchImages.ts`)

The Orchestrator.

1.  **Context**: Initialize
2.  **Search**: call logic
3.  **Filter**: call logic
4.  **Pagination**: cursors
5.  **Execute**: output DTOs.
