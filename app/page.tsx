import { InfiniteFeed } from "@/components/gallery/InfiniteFeed"
import { getPaginatedFeed } from "@/app/actions/getPaginatedFeed"

export const dynamic = 'force-dynamic' // Ensure new content on refresh

export default async function Home() {
  // Initial SSR fetch (Cursor is undefined for first page)
  const { items, nextCursor } = await getPaginatedFeed(undefined, 20)

  return (
    <div className="container mx-auto py-8">
      <InfiniteFeed
        initialItems={items || []}
        initialNextCursor={nextCursor}

      />
    </div>
  )
}
