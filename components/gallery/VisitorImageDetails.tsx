"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Share2, Hash, Zap, Box, Download } from "lucide-react"
import { downloadImage } from "@/lib/download"
import { SaveButton } from "@/components/SaveButton"
import { ImageTagsDisplay } from "@/components/image/ImageTagsDisplay"
import { ColorPalette } from "./ColorPalette"
import { Image as ImageType } from "@/types"

interface VisitorImageDetailsProps {
    image: ImageType & { profiles: any }
    currentUser: any
    isSaved: boolean
    // SSR Data
    initialCanonicalTags: any[]
    initialAuthorTags: any[]
    initialCommunityTags: any[]
    initialUserTags: any[]
    className?: string
}

export function VisitorImageDetails({
    image,
    currentUser,
    isSaved,
    initialCanonicalTags,
    initialAuthorTags,
    initialCommunityTags,
    initialUserTags,
    className
}: VisitorImageDetailsProps) {
    return (
        <div className={`flex flex-col bg-zinc-950/90 backdrop-blur-2xl border-l border-white/10 z-50 overflow-hidden h-full ${className}`}>
            {/* Header Actions (Static for Visitor usually, except Share/Save) */}
            <div className="p-5 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-3xl sticky top-0 z-10">
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg bg-transparent hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg bg-transparent hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
                        onClick={() => downloadImage(image.url, `${image.title}.jpg`)}
                    >
                        <Download className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex gap-2">
                    {currentUser && (
                        <SaveButton
                            imageId={image.id}
                            initialIsSaved={isSaved}
                            className="w-full justify-center"
                            showLabel={true}
                        />
                    )}
                </div>
            </div>

            {/* Scrollable Content (Server Rendered) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">

                {/* Title & Description */}
                <div>
                    <h1 className="text-3xl font-bold text-white mb-3 tracking-tight leading-tight">{image.title}</h1>
                    {image.description ? (
                        <p className="text-zinc-400 text-sm leading-7 font-light">
                            {image.description}
                        </p>
                    ) : (
                        <p className="text-zinc-700 italic text-sm">No description.</p>
                    )}
                </div>

                {/* Artist Profile */}
                <Link href={`/profile/${image.profiles?.username}`} className="block">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 backdrop-blur-md hover:bg-white/[0.06] transition-all cursor-pointer group shadow-lg shadow-black/20">
                        <Avatar className="w-10 h-10 ring-2 ring-white/10 group-hover:ring-indigo-500/50 transition-all">
                            <AvatarImage src={image.profiles?.avatar_url || ""} className="object-cover" />
                            <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">{image.profiles?.username?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm truncate group-hover:text-indigo-400 transition-colors">{image.profiles?.username || 'Unknown Artist'}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Creator</p>
                        </div>
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-zinc-400 hover:text-white hover:bg-white/10 -translate-x-2 group-hover:translate-x-0">
                            Follow
                        </Button>
                    </div>
                </Link>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                {/* Metadata */}
                <div className="space-y-6">
                    {(image.topic) && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 pl-1">
                                Technical Specs
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {image.topic && (
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-white/[0.03] hover:border-white/[0.08] transition-colors group">
                                        <div className="flex items-center gap-3">
                                            <Hash className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                                            <span className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">Topic</span>
                                        </div>
                                        <span className="text-xs font-medium text-white">{image.topic}</span>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}

                    {/* Color Palette (Client Island) */}
                    {image.color_palette && image.color_palette.length > 0 && (
                        <ColorPalette colors={image.color_palette} />
                    )}
                </div>

                {/* 3-Layer Tagging System (Server Component) */}
                <div className="pt-2 border-t border-white/5">
                    <ImageTagsDisplay
                        imageId={image.id}
                        artistId={image.artist_id}
                        currentUserId={currentUser?.id}
                        initialCanonicalTags={initialCanonicalTags}
                        initialAuthorTags={initialAuthorTags}
                        initialCommunityTags={initialCommunityTags}
                        initialUserTags={initialUserTags}
                    />
                </div>
            </div>
        </div>
    )
}
