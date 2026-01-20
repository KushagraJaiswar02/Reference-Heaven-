"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Share2, Pencil, Trash2, X, Hash, Zap, Box } from "lucide-react"
import { toast } from "sonner"
import { deleteImage } from "@/app/actions/deleteImage"
import { updateImage } from "@/app/actions/updateImage"
import { Image as ImageType } from "@/types"
import { ImageTagsDisplay } from "@/components/image/ImageTagsDisplay"
import { ColorPalette } from "./ColorPalette"

interface OwnerImageDetailsProps {
    image: ImageType & { profiles: any }
    currentUserId: string
    // SSR Data
    initialCanonicalTags: any[]
    initialAuthorTags: any[]
    initialCommunityTags: any[]
    initialUserTags: any[]
}

export function OwnerImageDetails({
    image: initialImage,
    currentUserId,
    initialCanonicalTags,
    initialAuthorTags,
    initialCommunityTags,
    initialUserTags
}: OwnerImageDetailsProps) {
    const router = useRouter()
    const [image, setImage] = useState(initialImage)
    const [isEditing, setIsEditing] = useState(false)
    const [editLoading, setEditLoading] = useState(false)

    // Edit Form State
    const [title, setTitle] = useState(image.title)
    const [topic, setTopic] = useState(image.topic || "")
    const [description, setDescription] = useState(image.description || "")

    const handleDelete = async () => {
        try {
            await deleteImage(image.id)
        } catch (error: any) {
            if (error.message === "NEXT_REDIRECT" || error.digest?.startsWith('NEXT_REDIRECT')) {
                toast.success("Image deleted successfully")
                throw error
            }
            toast.error("An error occurred")
        }
    }

    const handleUpdate = async () => {
        setEditLoading(true)
        try {
            const formData = new FormData()
            formData.append('id', image.id)
            formData.append('title', title)
            formData.append('topic', topic)
            formData.append('description', description)

            const res = await updateImage(formData)

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Image updated successfully")
                setIsEditing(false)
                setImage(prev => ({ ...prev, title, topic, description }))
                router.refresh()
            }
        } catch {
            toast.error("An error occurred while updating")
        } finally {
            setEditLoading(false)
        }
    }

    return (
        <div className="fixed right-6 top-6 bottom-6 w-[420px] flex flex-col bg-zinc-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* Header Actions */}
            <div className="p-5 flex items-center justify-between border-b border-white/5 bg-white/5 backdrop-blur-3xl sticky top-0 z-10">
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg bg-transparent hover:bg-white/10 text-zinc-400 hover:text-white transition-all">
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`w-9 h-9 rounded-lg transition-all duration-300 ${isEditing ? 'bg-indigo-500/10 text-indigo-400' : 'bg-transparent hover:bg-white/10 text-zinc-400 hover:text-white'}`}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg bg-transparent hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-zinc-950 border-white/10 shadow-2xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete Image?</AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-400">
                                    This action cannot be undone. This will permanently delete your image and remove the data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-none">
                                    Delete Image
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {isEditing ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                        {/* Edit Form */}
                        <div className="space-y-4">
                            <Label htmlFor="title" className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold ml-1">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-zinc-900/50 border-none border-b border-transparent focus:border-indigo-500 text-white focus-visible:ring-0 rounded-none h-10 text-lg font-medium placeholder:text-zinc-700 px-0 pb-1 transition-all"
                                placeholder="Image Title"
                            />
                        </div>
                        <div className="space-y-4">
                            <Label htmlFor="topic" className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold ml-1">Topic</Label>
                            <Input
                                id="topic"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="bg-zinc-900/50 border-none border-b border-transparent focus:border-indigo-500 text-white focus-visible:ring-0 rounded-none h-10 placeholder:text-zinc-700 px-0 pb-1 transition-all"
                                placeholder="e.g. Concept Art"
                            />
                        </div>
                        <div className="space-y-4">
                            <Label htmlFor="description" className="text-zinc-500 text-[11px] uppercase tracking-widest font-bold ml-1">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                                className="bg-zinc-900/50 border-none focus:border-l-2 focus:border-indigo-500 text-white focus-visible:ring-0 rounded-sm min-h-[120px] resize-none leading-relaxed placeholder:text-zinc-700 p-3 transition-all"
                                placeholder="Add a description..."
                            />
                        </div>

                        <div className="pt-6 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIsEditing(false)}
                                className="flex-1 border-white/5 bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 h-10 rounded-lg"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdate}
                                disabled={editLoading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white h-10 rounded-lg font-medium border-none shadow-lg shadow-indigo-900/20"
                            >
                                {editLoading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
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

                            {image.color_palette && image.color_palette.length > 0 && (
                                <ColorPalette colors={image.color_palette} />
                            )}
                        </div>

                        {/* 3-Layer Tagging System */}
                        <div className="pt-2 border-t border-white/5">
                            <ImageTagsDisplay
                                imageId={image.id}
                                artistId={image.artist_id}
                                currentUserId={currentUserId}
                                initialCanonicalTags={initialCanonicalTags}
                                initialAuthorTags={initialAuthorTags}
                                initialCommunityTags={initialCommunityTags}
                                initialUserTags={initialUserTags}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
