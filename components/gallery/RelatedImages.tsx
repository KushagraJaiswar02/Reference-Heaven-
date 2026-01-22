
import { searchImages } from "@/app/actions/search/searchImages"
import { MasonryGrid } from "./MasonryGrid"

interface RelatedImagesProps {
    topic: string | null
    currentImageId: string
}

export async function RelatedImages({ topic, currentImageId }: RelatedImagesProps) {
    if (!topic) return null

    // Fetch related images by topic
    const { items } = await searchImages({
        context: { type: 'global' },
        scope: { query: undefined },
        filters: { domain: topic },
        limit: 12 // Fetch enough to fill a few rows
    })

    // Filter out current image
    const related = items.filter(img => img.id !== currentImageId)

    if (related.length === 0) return null

    return (
        <div className="w-full max-w-[1920px] mt-12 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="text-xl font-bold text-white mb-6 px-4">More like this</h3>
            <MasonryGrid images={related} />
        </div>
    )
}
