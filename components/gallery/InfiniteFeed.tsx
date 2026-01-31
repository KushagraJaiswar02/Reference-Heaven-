"use client"

import { useEffect, useLayoutEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { MasonryGrid } from "./MasonryGrid"
import { ImageCardDTO } from "@/app/data/dto"
import { getPaginatedFeed } from "@/app/actions/getPaginatedFeed"
import { Skeleton } from "@/components/ui/skeleton"
import useSWRInfinite from "swr/infinite"
import { usePathname, useSearchParams } from "next/navigation"

interface InfiniteFeedProps {
    initialItems: ImageCardDTO[]
    initialNextCursor: string | null
    fetchNextPage?: any
    searchParams?: {
        q?: string
        domain?: string
        authorId?: string
        context?: any
    }
}

export function InfiniteFeed({ initialItems, initialNextCursor, searchParams = {}, fetchNextPage }: InfiniteFeedProps) {
    const pathname = usePathname()
    // We still use useSearchParams for the persistence key generation to be safe, 
    // or we can use the passed props. using props is safer for synchronization.
    // actually, let's stick to the URL for persistence key as it's the source of truth.
    const urlSearchParams = useSearchParams()

    // Create a unique key for this feed's state based on URL
    const persistenceKey = `scroll_restore_${pathname}_${urlSearchParams.toString()}`

    // 1. Recover persisted size synchronously if possible
    let defaultInitialSize = 1
    if (typeof window !== "undefined") {
        const savedState = sessionStorage.getItem(persistenceKey)
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState)
                if (parsed.size) defaultInitialSize = parsed.size
            } catch (e) {
                // ignore
            }
        }
    }

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: "600px",
    })

    // SWR Key now includes the search params serialization
    // We use a stable string representation
    const swrKeyPrefix = `feed-${JSON.stringify(searchParams)}`

    const { data, size, setSize, isValidating } = useSWRInfinite(
        (index, prev) => {
            // First page cursor is null
            if (index === 0) return [swrKeyPrefix, null]
            // If previous page has no more items, stop
            if (!prev?.hasMore) return null
            // Otherwise use next cursor
            return [swrKeyPrefix, prev.nextCursor]
        },
        async ([_, cursor]) => {
            if (fetchNextPage) {
                return await fetchNextPage(cursor || undefined)
            }
            return await getPaginatedFeed(cursor ?? undefined, 20)
        },
        {
            revalidateFirstPage: false,
            revalidateOnFocus: false,
            fallbackData: [{ items: initialItems, nextCursor: initialNextCursor, hasMore: !!initialNextCursor }],
            initialSize: defaultInitialSize
        }
    )

    // Flatten items
    const allItems = data ? data.flatMap(page => page.items) : initialItems

    // Check if we can load more
    const isEnd = data ? !data[data.length - 1]?.hasMore : !initialNextCursor

    // 2. Persist State (Size + Scroll)
    useEffect(() => {
        if (typeof window === "undefined") return

        const saveState = () => {
            // Only save if we have data (avoid overwriting with empty state on quick unmounts)
            if (size > 0) {
                const state = {
                    size: size,
                    scrollY: window.scrollY
                }
                sessionStorage.setItem(persistenceKey, JSON.stringify(state))
            }
        }

        // Throttle scroll save slightly or just save on clean up?
        // Saving on unmount is risky on mobile/back-swipe sometimes. 
        // Better: Save regularly on scroll end or visibility change, AND on unmount (navigation)
        // For simplicity and robustness in this specific "Pinterest" use case, saving on scroll is good.

        const onScroll = () => {
            // We use a timeout to debounce
            if ((window as any)._scrollSaveTimeout) clearTimeout((window as any)._scrollSaveTimeout)
                ; (window as any)._scrollSaveTimeout = setTimeout(saveState, 100)
        }

        window.addEventListener("scroll", onScroll)

        // Also save when clicking a link (optional, but scroll listener covers it)
        return () => {
            window.removeEventListener("scroll", onScroll)
            saveState() // Ensure final state is saved
        }
    }, [persistenceKey, size])

    // 3. Restore Scroll Position
    // We use useLayoutEffect to try and jump before paint if possible, though with async data it might happen after.
    const hasRestored = useRef(false)

    useLayoutEffect(() => {
        if (hasRestored.current) return
        if (typeof window === "undefined") return

        const savedState = sessionStorage.getItem(persistenceKey)
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState)
                if (parsed.scrollY && data && data.length >= (parsed.size || 1)) {
                    // Only restore if we have loaded enough pages to likely reach that scroll position
                    // OR if we assume layout is ready. 
                    window.scrollTo(0, parsed.scrollY)
                    hasRestored.current = true
                }
            } catch (e) {
                // ignore
            }
        }
    }, [persistenceKey, data]) // Re-run when data changes (e.g. initial load vs fetched hydration)


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
