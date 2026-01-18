
import { searchImages } from "@/app/actions/search/searchImages"
import { SearchRequest } from "@/app/lib/search/types"
import { InfiniteFeed } from "@/components/gallery/InfiniteFeed"
import { Separator } from "@/components/ui/separator"

export const dynamic = 'force-dynamic'

export default async function SearchPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams

    // 1. Parse Params
    const q = typeof searchParams.q === 'string' ? searchParams.q : undefined
    const domain = typeof searchParams.domain === 'string' ? searchParams.domain : undefined
    const authorId = typeof searchParams.author === 'string' ? searchParams.author : undefined

    // 2. Build Request
    const request: SearchRequest = {
        context: { type: 'global' }, // Default for /search page
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

            {/* TODO: Insert FilterBar here */}

            <InfiniteFeed
                key={`${q}-${domain}-${authorId}`} // Force reset on param change
                initialItems={items || []}
                initialNextCursor={nextCursor}
                fetchNextPage={fetchNextSearchPage}
            />
        </div>
    )
}
