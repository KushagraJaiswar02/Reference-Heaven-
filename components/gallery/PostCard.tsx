"use client"

import Link from "next/link"
import Image from "next/image"
import { ImageCardDTO } from "@/app/data/dto"
import { useRouter } from "next/navigation"

interface PostCardProps {
    image: ImageCardDTO
}

import { SaveButton } from "@/components/SaveButton"
import { Download } from "lucide-react"
import { downloadImage } from "@/lib/download"

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
            prefetch={true}
            className="block group mb-4 break-inside-avoid relative"
            onMouseEnter={handleMouseEnter}
        >
            <div className={`relative overflow-hidden rounded-lg backface-visibility-hidden transform-gpu transition-all duration-75 active:scale-95 active:opacity-80 aspect-[1/${(image.aspectRatio || 1)}] bg-muted`}>
                {(image.thumbnailUrl || image.url) ? (
                    <Image
                        src={image.thumbnailUrl || image.url}
                        alt={image.title || 'Image'}
                        width={500}
                        height={Math.round(500 / (image.aspectRatio || 1))} // Safe calculation
                        className="w-full h-auto object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
                        <span className="text-xs">No Image</span>
                    </div>
                )}

                {/* Overlay Feedback */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-4 z-10 pointer-events-none group-hover:pointer-events-auto">
                    {/* Top Right: Save Button (Red Pill) */}
                    <div className="flex justify-end pointer-events-auto">
                        <SaveButton
                            imageId={image.id}
                            initialIsSaved={false}
                            showLabel={true}
                            className="rounded-full font-bold shadow-sm hover:scale-105 transition-transform"
                        />
                    </div>

                    {/* Bottom Row */}
                    <div className="flex items-end justify-between pointer-events-auto">
                        {/* Bottom Left: Title/Author */}
                        <div className="flex-1 min-w-0 mr-2 text-shadow-sm pointer-events-none">
                            <p className="font-semibold text-white text-sm truncate drop-shadow-md">{image.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                                {image.author?.avatar_url && (
                                    <Image
                                        src={image.author.avatar_url}
                                        alt={image.author.username}
                                        width={20}
                                        height={20}
                                        className="rounded-full w-5 h-5 bg-zinc-800 ring-1 ring-white/20"
                                    />
                                )}
                                <span className="text-xs text-white/90 font-medium truncate drop-shadow-md">{image.author?.username}</span>
                            </div>
                        </div>

                        {/* Bottom Right: Download Button (Circle) */}
                        <button
                            className="w-9 h-9 flex items-center justify-center bg-white hover:bg-zinc-200 rounded-full shadow-md transition-all hover:scale-110 text-black flex-shrink-0"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                downloadImage(image.url, `${image.title || 'image'}.jpg`);
                            }}
                            title="Download"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    )
}
