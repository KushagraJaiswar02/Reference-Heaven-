"use client"

import Link from "next/link"
import Image from "next/image"
import { ImageCardDTO } from "@/app/data/dto"
import { useRouter } from "next/navigation"

interface PostCardProps {
    image: ImageCardDTO
}

export function PostCard({ image }: PostCardProps) {
    const router = useRouter()

    const handleMouseEnter = () => {
        // Explicit intent-based prefetch for faster desktop navigation
        router.prefetch(`/image/${image.id}`)
    }

    return (
        <Link
            href={`/image/${image.id}`}
            scroll={false}
            prefetch={true} // Next.js default viewport prefetching (Mobile/Desktop view)
            className="block group mb-4 break-inside-avoid relative"
            onMouseEnter={handleMouseEnter} // Hover prefetching (Desktop intent)
        >
            <div className="relative overflow-hidden rounded-lg backface-visibility-hidden transform-gpu transition-all duration-75 active:scale-95 active:opacity-80">
                {/* 
                   Layout Stability:
                   - Aspect ratio is determined by natural image dimensions + masonry layout.
                   - 'sizes' ensures correct resource selection.
                   - 'bg-muted' acts as immediate placeholder.
                */}
                <Image
                    src={image.url}
                    alt={image.title}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover rounded-lg bg-muted"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Overlay Feedback */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="w-full">
                        <p className="font-semibold text-white text-sm truncate">{image.title}</p>
                        {image.topic && <p className="text-xs text-white/80">{image.topic}</p>}
                    </div>
                </div>
            </div>
        </Link>
    )
}
