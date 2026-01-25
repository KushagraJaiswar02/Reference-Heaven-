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
import { FollowButton } from "@/components/profile/FollowButton"

interface VisitorImageDetailsProps {
    image: ImageType & { profiles: any }
    currentUser: any
    isSaved: boolean
    // SSR Data
    initialCanonicalTags: any[]
    initialAuthorTags: any[]
    initialCommunityTags: any[]
    initialUserTags: any[]
    initialIsFollowing: boolean
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
    initialIsFollowing,
    className
}: VisitorImageDetailsProps) {
    return (
        <div className={`flex flex-col bg-zinc-950/90 border-l border-white/5 h-full ${className}`}>
            {/* Header Actions */}
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-zinc-950 sticky top-0 z-20">
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white transition-all">
                        <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="w-9 h-9 rounded-lg bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-400 hover:text-white transition-all"
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

            {/* Content - Removed custom-scrollbar if standard scrolling is desired, but keeping it for the panel is fine if strictly structured. 
                Optimized: Removing 'animate-in' for faster paint, or making it simpler.
            */}
            <div className="flex-1 p-6 space-y-8">

                {/* Title & Description */}
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight leading-tight">{image.title}</h1>
                    {image.description ? (
                        <p className="text-zinc-400 text-sm leading-relaxed font-normal">
                            {image.description}
                        </p>
                    ) : (
                        <p className="text-zinc-700 italic text-sm">No description.</p>
                    )}
                </div>

                {/* Artist Profile - Simplified Card */}
                <Link href={`/profile/${image.profiles?.username}`} className="block group">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-all cursor-pointer">
                        <Avatar className="w-10 h-10 ring-2 ring-zinc-800 group-hover:ring-indigo-500/50 transition-all">
                            <AvatarImage src={image.profiles?.avatar_url || ""} className="object-cover" />
                            <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">{image.profiles?.username?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-white text-sm truncate group-hover:text-indigo-400 transition-colors">{image.profiles?.username || 'Unknown Artist'}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Creator</p>
                        </div>
                        <FollowButton
                            authorId={image.artist_id}
                            authorName={image.profiles?.username || 'Artist'}
                            initialIsFollowing={initialIsFollowing}
                            variant="ghost"
                            size="sm"
                            className="opacity-100"
                        />
                    </div>
                </Link>

                <div className="w-full h-[1px] bg-white/5"></div>

                {/* Metadata */}
                <div className="space-y-6">
                    {(image.topic) && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 pl-1">
                                Technical Specs
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {image.topic && (
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-white/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Hash className="w-3.5 h-3.5 text-zinc-500" />
                                            <span className="text-xs text-zinc-400">Topic</span>
                                        </div>
                                        <span className="text-xs font-medium text-white">{image.topic}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Color Palette */}
                    {image.color_palette && image.color_palette.length > 0 && (
                        <ColorPalette colors={image.color_palette} />
                    )}
                </div>

                {/* Tagging System */}
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
            </div >
        </div >
    )
}
