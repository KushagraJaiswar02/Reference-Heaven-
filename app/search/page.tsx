import { Suspense } from "react"
import { searchImages } from "@/app/actions/search/searchImages"
import { SearchRequest } from "@/app/lib/search/types"
import { InfiniteFeed } from "@/components/gallery/InfiniteFeed"
import { Separator } from "@/components/ui/separator"
import { FilterBar } from "@/components/search/FilterBar"

export const dynamic = 'force-dynamic'

export default async function SearchPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams

    // 1. Parse Params
    const q = typeof searchParams.q === 'string' ? searchParams.q : undefined
    const domain = typeof searchParams.domain === 'string' ? searchParams.domain : undefined
    const authorId = typeof searchParams.author === 'string' ? searchParams.author : undefined
    const isSaved = searchParams.saved === 'true'

    // 2. Build Request
    // TODO: Verify userId for 'saved' context.
    // Since this is a server wrapper, we'd need auth().getUser().
    // But 'searchImages' action usually gets its own Supabase client which handles auth?
    // Use `createClient` here to get the user ID if context is 'saved'.
    // Or, pass 'saved' as a filter and let the Action decide context?
    // The architecture defined Context as 'saved' | 'global'.
    // We should resolve User ID here or in the action.
    // Ideally Action resolves it using `supabase.auth.getUser()`.
    // Let's pass `userId` if we can, or let Action handle "me".
    // For now, let's assume Action handles "current user" if userId is missing, or we pass it.
    // Checking `searchImages.ts`: it expects `context.userId` string.

    // We need to fetch user here to pass it, OR update types to allow 'me'?
    // Let's fetch user simply.

    const { createClient } = await import("@/utils/supabase/server")
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const request: SearchRequest = {
        context: isSaved && user ? { type: 'saved', userId: user.id } : { type: 'global' },
        scope: { query: q },
        filters: {
            domain,
            authorId,
        }
    }

    // 3. Initial Fetch
    const { items, nextCursor, hasMore } = await searchImages(request)

    // 4. Bound Action for Infinite Scroll
    async function fetchNextSearchPage(cursor: string) {
        'use server'
        return searchImages({ ...request, cursor })
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-col gap-2 px-4 md:px-0">
                <h1 className="text-2xl font-bold tracking-tight">
                    {q ? `Results for "${q}"` : "Explore"}
                </h1>
                <p className="text-muted-foreground text-sm">
                    {items.length === 0 ? "No matches found." : "Showing relevant results based on your query."}
                </p>
            </div>

            <Separator />

            <div className="px-4 md:px-0">
                <Suspense fallback={<div className="h-20 bg-muted/20 animate-pulse rounded-lg" />}>
                    <FilterBar />
                </Suspense>
            </div>

            <InfiniteFeed
                key={`${q}-${domain}-${authorId}-${isSaved}`} // Force reset on param change
                initialItems={items || []}
                initialNextCursor={nextCursor}
                fetchNextPage={fetchNextSearchPage}
            />
        </div>
    )
}
