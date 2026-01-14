import { Image as ImageType } from "@/types"
import Image from "next/image"

import Link from "next/link"

interface MasonryGridProps {
    images: ImageType[]
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
                <Link key={image.id} href={`/image/${image.id}`} scroll={false}>
                    <div className="relative overflow-hidden rounded-lg hover:opacity-90 transition-opacity cursor-pointer break-inside-avoid group mb-4">
                        <Image
                            src={image.url}
                            alt={image.title}
                            width={600}
                            height={400}
                            className="w-full h-auto object-cover rounded-lg bg-muted"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <div>
                                <p className="font-semibold text-white text-sm truncate">{image.title}</p>
                                {image.topic && <p className="text-xs text-white/80">{image.topic}</p>}
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
