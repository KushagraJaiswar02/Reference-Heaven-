"use client"

import Link from "next/link"
import Image from "next/image"
import { ImageCardDTO } from "@/app/data/dto"
import { useRouter } from "next/navigation"

interface PostCardProps {
    image: ImageCardDTO
    priority?: boolean
}

import { SaveButton } from "@/components/SaveButton"
import { Download } from "lucide-react"
import { downloadImage } from "@/lib/download"

export function PostCard({ image, priority = false }: PostCardProps) {
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
            <div className={`relative overflow-hidden rounded-lg backface-visibility-hidden transform-gpu transition-all duration-75 active:scale-95 active:opacity-80 aspect-[1/${(image.aspectRatio || 1)}] bg-muted group-hover:shadow-md ring-1 ring-black/5`}>
                {(image.thumbnailUrl || image.url) ? (
                    <Image
                        src={image.thumbnailUrl || image.url}
                        alt={image.title || 'Image'}
                        width={500}
                        height={Math.round(500 / (image.aspectRatio || 1))} // Safe calculation
                        className="w-full h-auto object-cover rounded-lg"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        priority={priority}
                        loading={priority ? "eager" : "lazy"}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-700">
                        <span className="text-xs">No Image</span>
                    </div>
                )}

                {/* Overlay Feedback */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none group-hover:pointer-events-auto">
                    {/* Top Right: Save Button */}
                    <div className="absolute top-2 right-2 pointer-events-auto">
                        <SaveButton
                            imageId={image.id}
                            initialIsSaved={false}
                            showLabel={false} // Icon only for minimal look
                            className="rounded-full shadow-sm hover:scale-105 transition-transform bg-white/90 hover:bg-white text-black"
                        />
                    </div>

                    {/* Bottom Right: Download Button */}
                    <div className="absolute bottom-2 right-2 pointer-events-auto">
                        <button
                            className="w-9 h-9 flex items-center justify-center bg-white/90 hover:bg-white rounded-full shadow-md transition-all hover:scale-110 text-black"
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
