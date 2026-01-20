"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { MasonryGrid } from "./MasonryGrid"
import { ImageCardDTO } from "@/app/data/dto"
import { getPaginatedFeed } from "@/app/actions/getPaginatedFeed"
import { Skeleton } from "@/components/ui/skeleton"
import useSWRInfinite from "swr/infinite"

interface InfiniteFeedProps {
    initialItems: ImageCardDTO[]
    initialNextCursor: string | null
    // We ignore the passed fetchNextPage prop in favor of the direct import for SWR
    fetchNextPage?: any
}

// SWR Key Generator
const getKey = (pageIndex: number, previousPageData: any) => {
    // First page, we don't fetch here if we have initial data, 
    // BUT useSWRInfinite strategy with initialData is complex.
    // Simplest: Use SWR for *all* pages, but seed cache with initialData.
    // However, initialData in useSWRInfinite is for the *first* page.

    if (pageIndex === 0) return "feed_page_0" // Key for first page

    // Reached the end
    if (previousPageData && !previousPageData.hasMore) return null

    // Cursor for next page
    return `feed_cursor_${previousPageData.nextCursor}`
}

export function InfiniteFeed({ initialItems, initialNextCursor }: InfiniteFeedProps) {
    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: "600px", // Aggressive prefetch (3-4 screen lengths)
    })

    const { data, size, setSize, isValidating } = useSWRInfinite(
        (index, prev) => {
            if (index === 0) return null // Manual handling for first page to allow fallback? 
            // Actually, best practice for SWR Infinite + Server Actions:
            // Key: [CURSOR]

            // Let's stick to a simpler cursor key approach:
            if (index === 0) return ["feed", null] // First page cursor is null
            if (!prev?.hasMore) return null
            return ["feed", prev.nextCursor]
        },
        async ([_, cursor]) => {
            return await getPaginatedFeed(cursor ?? undefined, 20)
        },
        {
            revalidateFirstPage: false, // Don't refetch page 0 immediately if we trust SSR
            revalidateOnFocus: false,
            fallbackData: [{ items: initialItems, nextCursor: initialNextCursor, hasMore: !!initialNextCursor }] // Seed cache
        }
    )

    // Flatten items
    const allItems = data ? data.flatMap(page => page.items) : initialItems

    // Check if we can load more
    const isEnd = data ? !data[data.length - 1]?.hasMore : !initialNextCursor
    const isLoadingMore = isValidating && size > 1

    useEffect(() => {
        if (inView && !isEnd && !isValidating) {
            setSize(size + 1)
        }
    }, [inView, isEnd, isValidating, setSize, size])

    return (
        <div className="space-y-8">
            <MasonryGrid images={allItems} />

            {/* Loading Trigger & Skeletons */}
            {(!isEnd) && (
                <div ref={ref} className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 space-y-4 p-4">
                    {/* Consistent Skeleton Grid */}
                    <div className="space-y-2 break-inside-avoid">
                        <Skeleton className="h-[300px] w-full rounded-lg" />
                    </div>
                    <div className="space-y-2 break-inside-avoid">
                        <Skeleton className="h-[200px] w-full rounded-lg" />
                    </div>
                    <div className="space-y-2 break-inside-avoid">
                        <Skeleton className="h-[250px] w-full rounded-lg" />
                    </div>
                    <div className="space-y-2 break-inside-avoid">
                        <Skeleton className="h-[320px] w-full rounded-lg" />
                    </div>
                </div>
            )}

            {isEnd && allItems.length > 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm font-medium tracking-wide">
                    All caught up.
                </div>
            )}
        </div>
    )
}
