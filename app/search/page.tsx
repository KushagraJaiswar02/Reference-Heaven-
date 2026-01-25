import { Suspense } from "react"
import { searchImages } from "@/app/actions/search/searchImages"
import { SearchRequest } from "@/app/lib/search/types"
import { InfiniteFeed } from "@/components/gallery/InfiniteFeed"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { FilterBar } from "@/components/search/FilterBar"

export const dynamic = 'force-dynamic'

export default async function SearchPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const searchParams = await props.searchParams

    // 1. Parse Params
    const q = typeof searchParams.q === 'string' ? searchParams.q : undefined
    const domain = typeof searchParams.domain === 'string' ? searchParams.domain : undefined
    const authorId = typeof searchParams.author === 'string' ? searchParams.author : undefined
    const isSaved = searchParams.saved === 'true'
    const type = typeof searchParams.type === 'string' ? searchParams.type : 'images'

    // 2. Build Request
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


    // 3. Initial Fetch (Images)
    let items: any[] = []
    let nextCursor: string | null = null
    let userResults: any[] = []

    if (type === 'images') {
        const res = await searchImages(request)
        items = res.items
        nextCursor = res.nextCursor
    } else if (type === 'accounts' && q) {
        // Fetch User Search
        const { searchUsers } = await import("@/app/actions/search/searchUsers")
        userResults = await searchUsers(q)
    }

    // 4. Bound Action for Infinite Scroll
    async function fetchNextSearchPage(cursor: string) {
        'use server'
        return searchImages({ ...request, cursor })
    }

    // Helper for Tabs
    // We need to keep other params when switching tabs
    const getTabLink = (newType: string) => {
        const sp = new URLSearchParams()
        if (q) sp.set('q', q)
        sp.set('type', newType)
        if (domain) sp.set('domain', domain)
        return `/search?${sp.toString()}`
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-col gap-2 px-4 md:px-0">
                <h1 className="text-2xl font-bold tracking-tight">
                    {q ? `Results for "${q}"` : "Explore"}
                </h1>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-border mt-4">
                    <Link
                        href={getTabLink('images')}
                        className={`pb-2 text-sm font-medium transition-colors border-b-2 ${type === 'images' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Images
                    </Link>
                    <Link
                        href={getTabLink('accounts')}
                        className={`pb-2 text-sm font-medium transition-colors border-b-2 ${type === 'accounts' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        Accounts
                    </Link>
                </div>
            </div>

            {type === 'images' ? (
                <>
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
                </>
            ) : (
                // Accounts View
                <div className="px-4 md:px-0">
                    {userResults.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {userResults.map((u: any) => (
                                <div key={u.id}>
                                    {/* Inline Card for now, or import ArtistCard */}
                                    <ArtistCardWrapper profile={u} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <p>No accounts found matching "{q}".</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function ArtistCardWrapper({ profile }: { profile: any }) {
    // Client wrapper to handle 'isFollowing'? 
    // Or just re-use ArtistCard but initialIsFollowing is tricky without fetching it.
    // For search, we might not know if we follow them efficiently without extra queries.
    // Let's import ArtistCard and pass false or fetch it?
    // For MVP, we pass false or use a simpler card.
    // Actually, let's use ArtistCard but we need 'isFollowing'.
    // We could fetch it in parallel in the server component above if we wanted perfection.
    // For now, let's import ArtistCard.
    const { ArtistCard } = require("@/components/profile/ArtistCard")
    return <ArtistCard profile={profile} isFollowing={false} />
}
