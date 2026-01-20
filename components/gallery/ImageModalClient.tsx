"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Share2, Link as LinkIcon, MoreHorizontal, Maximize2, Pencil, Trash2, X } from "lucide-react"
import { SaveButton } from "@/components/SaveButton"
import { deleteImage } from "@/app/actions/deleteImage"
import { updateImage } from "@/app/actions/updateImage"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import useSWR from "swr"
import { getClientImageDetails } from "@/app/actions/image/getImageDetail"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/utils/supabase/client"
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
import { ImageTagsDisplay } from "@/components/image/ImageTagsDisplay"

interface ImageModalClientProps {
    imageId: string
    initialThumbnailUrl?: string
    initialAspectRatio?: number
}

export function ImageModalClient({
    imageId,
    initialThumbnailUrl,
    initialAspectRatio
}: ImageModalClientProps) {
    const router = useRouter()
    const [currentUser, setCurrentUser] = useState<any>(null)

    // Auth Check
    useEffect(() => {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user))
    }, [])

    // SWR Data Fetching
    const { data, isLoading } = useSWR(
        imageId,
        getClientImageDetails,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 1 minute cache
        }
    )

    const fullImage = data?.publicData?.image
    const userContext = data?.userContext

    // Local Mutation State
    const [title, setTitle] = useState("")
    const [topic, setTopic] = useState("")
    const [isEditing, setIsEditing] = useState(false)
    const [editLoading, setEditLoading] = useState(false)

    // Sync state when data arrives
    useEffect(() => {
        if (fullImage) {
            setTitle(fullImage.title)
            setTopic(fullImage.topic || "")
        }
    }, [fullImage])

    // Derived State
    const isOwner = currentUser && fullImage && currentUser.id === fullImage.artist_id

    // VISUALS: Use Thumbnail until Full Image is ready
    const displayUrl = fullImage?.url || initialThumbnailUrl || ""
    const isImageLoaded = !!fullImage

    const handleDelete = async () => {
        if (!imageId) return
        try {
            const res = await deleteImage(imageId)
            if (res && res.error) {
                toast.error(res.error)
            } else {
                router.back()
            }
        } catch (error: any) {
            if (error?.digest?.startsWith('NEXT_REDIRECT')) {
                router.back()
                return
            }
            toast.error("An error occurred")
        }
    }

    const handleUpdate = async () => {
        if (!fullImage) return
        setEditLoading(true)
        try {
            const formData = new FormData()
            formData.append('id', imageId)
            formData.append('title', title)
            formData.append('topic', topic)
            const res = await updateImage(formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Image updated successfully")
                setIsEditing(false)
                // In a real app, we'd mutate SWR here. For now rely on local state or revalidating.
            }
        } catch (error) {
            toast.error("An error occurred while updating")
        } finally {
            setEditLoading(false)
        }
    }

    return (
        <Dialog defaultOpen open={true} onOpenChange={() => router.back()}>
            <DialogContent
                className="max-w-[1200px] w-[95vw] h-[90vh] p-0 overflow-hidden bg-zinc-900 border-none outline-none shadow-2xl flex rounded-3xl"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Image Details</DialogTitle>
                <DialogDescription className="sr-only">Details for the selected image</DialogDescription>

                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-50 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* LEFT: Image Container */}
                <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
                    <div className="relative w-full h-full">
                        {displayUrl ? (
                            <Image
                                src={displayUrl}
                                alt={title || "Image"}
                                fill
                                className={`object-contain transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-80 blur-sm'}`}
                                priority
                                quality={isImageLoaded ? 100 : 50}
                                sizes="(max-width: 768px) 100vw, calc(100vw - 400px)"
                            />
                        ) : (
                            <Skeleton className="w-full h-full bg-zinc-800" />
                        )}
                    </div>
                </div>

                {/* RIGHT: Details Panel */}
                <div className="w-[400px] flex-shrink-0 bg-zinc-900 flex flex-col h-full overflow-hidden border-l border-white/5">

                    {/* Sticky Header */}
                    <div className="p-6 flex items-center justify-between sticky top-0 bg-zinc-900 z-10">
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white">
                                <Share2 className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Save Button / Owner Actions */}
                        {isLoading ? (
                            <Skeleton className="w-8 h-8 rounded-full" />
                        ) : (
                            isOwner ? (
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsEditing(!isEditing)}><Pencil className="w-5 h-5" /></Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="w-5 h-5" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>Irreversible deletion.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDelete} className="bg-red-600">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            ) : (
                                currentUser && (
                                    <SaveButton
                                        imageId={imageId}
                                        initialIsSaved={userContext?.isSaved || false}
                                        className="text-zinc-400 hover:text-white"
                                    />
                                )
                            )
                        )}
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                        {!fullImage ? (
                            <div className="space-y-4">
                                <Skeleton className="h-10 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="flex gap-3 mt-6">
                                    <Skeleton className="w-10 h-10 rounded-full" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            isEditing ? (
                                <div className="space-y-4 mb-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-white">Title</Label>
                                        <Input
                                            id="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="topic" className="text-white">Topic</Label>
                                        <Input
                                            id="topic"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end mt-4">
                                        <Button variant="ghost" onClick={() => setIsEditing(false)} className="text-white hover:bg-white/10">
                                            Cancel
                                        </Button>
                                        <Button onClick={handleUpdate} disabled={editLoading} className="bg-white text-black hover:bg-zinc-200">
                                            {editLoading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{fullImage.title}</h1>
                                    {fullImage.description && <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{fullImage.description}</p>}
                                </>
                            )
                        )}

                        {/* Artist Block */}
                        {fullImage?.profiles && (
                            <div onClick={() => window.location.href = `/profile/${fullImage.profiles?.username}`} className="block group mb-8 cursor-pointer mt-6">
                                <div className="flex items-center gap-3 p-2 rounded-lg -mx-2 hover:bg-white/5 transition-colors">
                                    <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-white/10 transition-all">
                                        <AvatarImage src={fullImage.profiles?.avatar_url || ""} />
                                        <AvatarFallback>{fullImage.profiles?.username?.charAt(0) || "?"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                            {fullImage.profiles?.username || "Unknown"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tags & Metadata */}
                        {data?.publicData ? (
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <ImageTagsDisplay
                                    imageId={imageId}
                                    artistId={fullImage?.artist_id || ""}
                                    currentUserId={currentUser?.id}
                                    initialCanonicalTags={data.publicData.canonicalTags}
                                    initialAuthorTags={data.publicData.authorTags}
                                    initialCommunityTags={data.publicData.communityTags}
                                    initialUserTags={userContext?.userTags || []}
                                />
                            </div>
                        ) : (
                            <div className="space-y-2 mt-8">
                                <Skeleton className="h-6 w-1/3" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
