import { ImageCardDTO } from "@/app/data/dto"
import { PostCard } from "./PostCard"

interface MasonryGridProps {
    images: ImageCardDTO[]
}

export function MasonryGrid({ images }: MasonryGridProps) {
    if (!images || images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
                <p>No images found.</p>
                <p className="text-sm">Be the first to upload one!</p>
            </div>
        )
    }

    return (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 space-y-4 p-4">
            {images.map((image) => (
                <PostCard key={image.id} image={image} />
            ))}
        </div>
    )
}
