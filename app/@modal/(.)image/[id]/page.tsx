
"use client"

import { useRouter } from "next/navigation"
import { use } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Share2, Link as LinkIcon, Download, Heart, Maximize2, MoreHorizontal } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Image as ImageType } from "@/types"

export default function ImageModal({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [image, setImage] = useState<ImageType | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchImage = async () => {
            const supabase = createClient()
            const { data } = await supabase
                .from("images")
                .select("*, profiles(*)")
                .eq("id", id)
                .single()

            if (data) setImage(data)
            setLoading(false)
        }
        fetchImage()
    }, [id])

    return (
        <Dialog defaultOpen open={true} onOpenChange={() => router.back()}>
            <DialogContent
                className="max-w-[1200px] w-[95vw] h-[90vh] p-0 overflow-hidden bg-zinc-900 border-none outline-none shadow-2xl flex rounded-3xl"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Image Details</DialogTitle>
                <DialogDescription className="sr-only">Details for the selected image</DialogDescription>

                {/* Close Button (Floating) */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-50 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                    </svg>
                </button>

                {loading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    </div>
                ) : !image ? (
                    <div className="w-full h-full flex items-center justify-center text-white">
                        Image not found
                    </div>
                ) : (
                    <>
                        {/* LEFT: Image Container */}
                        <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                            <div className="relative w-full h-full">
                                <Image
                                    src={image.url}
                                    alt={image.title}
                                    fill
                                    className="object-contain"
                                    priority
                                    quality={100}
                                />
                            </div>
                        </div>

                        {/* RIGHT: Details Panel */}
                        <div className="w-[400px] flex-shrink-0 bg-zinc-900 flex flex-col h-full overflow-hidden border-l border-white/5">

                            {/* Sticky Header */}
                            <div className="p-6 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white">
                                        <MoreHorizontal className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white">
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white">
                                        <LinkIcon className="w-5 h-5" />
                                    </Button>
                                </div>
                                <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold px-6">
                                    Save
                                </Button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                                <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{image.title}</h1>

                                {image.description && (
                                    <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                        {image.description}
                                    </p>
                                )}

                                {/* Artist Block */}
                                <div className="flex items-center gap-3 mb-8">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={image.profiles?.avatar_url} />
                                        <AvatarFallback>{image.profiles?.username?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{image.profiles?.username}</p>
                                        <p className="text-xs text-zinc-500">1.2k followers</p>
                                    </div>
                                    <Button variant="secondary" className="ml-auto rounded-full text-xs font-semibold h-8 bg-white/10 hover:bg-white/20 text-white border-none">
                                        Follow
                                    </Button>
                                </div>

                                {/* Comments / Metadata Section */}
                                <div className="space-y-6">
                                    <div className="text-sm font-semibold text-white mb-2">Properties</div>

                                    {/* Tech Specs */}
                                    <div className="grid grid-cols-2 gap-3">
                                        {image.lighting_style && (
                                            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                                <span className="text-[10px] uppercase text-zinc-500 font-bold block mb-1">Lighting</span>
                                                <p className="text-sm font-medium text-white">{image.lighting_style}</p>
                                            </div>
                                        )}
                                        {image.perspective_angle && (
                                            <div className="bg-black/30 p-3 rounded-xl border border-white/5">
                                                <span className="text-[10px] uppercase text-zinc-500 font-bold block mb-1">Perspective</span>
                                                <p className="text-sm font-medium text-white">{image.perspective_angle}</p>
                                            </div>
                                        )}
                                    </div>

                                    {image.color_palette && image.color_palette.length > 0 && (
                                        <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                                            <span className="text-[10px] uppercase text-zinc-500 font-bold block mb-3">Palette</span>
                                            <div className="flex flex-wrap gap-2">
                                                {image.color_palette.map((color, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-8 h-8 rounded-full border border-white/10 cursor-pointer hover:scale-110 transition-transform"
                                                        style={{ backgroundColor: color }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {image.topic && (
                                        <div className="mt-4">
                                            <span className="inline-block bg-white/10 text-white text-xs px-3 py-1 rounded-full font-medium">
                                                #{image.topic}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div className="p-4 border-t border-white/5 bg-zinc-900 flex justify-center">
                                <Button
                                    variant="outline"
                                    className="rounded-full border-white/10 hover:bg-white/5 text-white w-full"
                                    onClick={() => window.location.href = `/image/${id}`}
                                >
                                    <Maximize2 className="w-4 h-4 mr-2" />
                                    Open Full Page
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
