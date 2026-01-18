"use client"

import { useState, useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { MasonryGrid } from "./MasonryGrid"
import { ImageCardDTO } from "@/app/data/dto"
import { getPaginatedFeed } from "@/app/actions/getPaginatedFeed"
import { Skeleton } from "@/components/ui/skeleton"

interface InfiniteFeedProps {
    initialItems: ImageCardDTO[]
    initialNextCursor: string | null
}

export function InfiniteFeed({ initialItems, initialNextCursor }: InfiniteFeedProps) {
    const [items, setItems] = useState<ImageCardDTO[]>(initialItems)
    const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(!!initialNextCursor)

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: "200px", // Load before reaching bottom
    })

    const loadMore = async () => {
        if (loading || !nextCursor) return

        setLoading(true)
        try {
            const res = await getPaginatedFeed(nextCursor)

            // Append new items
            setItems((prev) => [...prev, ...res.items])
            setNextCursor(res.nextCursor)
            setHasMore(res.hasMore)
        } catch (error) {
            console.error("Failed to load more images:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (inView && hasMore) {
            loadMore()
        }
    }, [inView, hasMore]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="space-y-8">
            <MasonryGrid images={items} />

            {/* Loading Trigger & Skeletons */}
            {(hasMore || loading) && (
                <div ref={ref} className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 space-y-4 p-4">
                    {/* Suggest 4 skeletons to match grid look */}
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2 break-inside-avoid">
                            <Skeleton className="h-[300px] w-full rounded-lg" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-5 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!hasMore && items.length > 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                    You've reached the end of the void.
                </div>
            )}
        </div>
    )
}
