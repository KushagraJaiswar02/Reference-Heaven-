"use client"

import Link from "next/link"
import Image from "next/image"
import { ImageCardDTO } from "@/app/data/dto"
import { useRouter } from "next/navigation"

interface PostCardProps {
    image: ImageCardDTO
}

// ... imports
// ... interface

export function PostCard({ image }: PostCardProps) {
    const router = useRouter()

    const handleMouseEnter = () => {
        router.prefetch(`/image/${image.id}`)
    }

    // Pass thumbnail and dimensions to modal for instant open
    const href = `/image/${image.id}?thumb=${encodeURIComponent(image.thumbnailUrl)}&ar=${image.aspectRatio}`

    return (
        <Link
            href={href}
            scroll={false}
            prefetch={true}
            className="block group mb-4 break-inside-avoid relative"
            onMouseEnter={handleMouseEnter}
        >
            <div className="relative overflow-hidden rounded-lg backface-visibility-hidden transform-gpu transition-all duration-75 active:scale-95 active:opacity-80">
                <Image
                    src={image.thumbnailUrl} // Use optimized thumbnail
                    alt={image.title}
                    width={500} // Matches grid width assumption
                    height={500 / image.aspectRatio}
                    className="w-full h-auto object-cover rounded-lg bg-muted"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                />

                {/* Overlay Feedback */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <div className="w-full">
                        <div className="flex items-center gap-2 mb-1">
                            {image.author?.avatar_url && (
                                <Image
                                    src={image.author.avatar_url}
                                    alt={image.author.username}
                                    width={20}
                                    height={20}
                                    className="rounded-full w-5 h-5 bg-zinc-800"
                                />
                            )}
                            <span className="text-xs text-white/90 font-medium truncate">{image.author?.username}</span>
                        </div>
                        <p className="font-semibold text-white text-sm truncate">{image.title}</p>
                        <div className="flex justify-between items-center mt-1">
                            {/* Topic removed from Grid DTO */}
                            {image.stats && (
                                <span className="text-[10px] text-white/80 flex items-center gap-1">
                                    ❤️ {image.stats.likes_count}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
