"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Share2, Link as LinkIcon, MoreHorizontal, Maximize2, Pencil, Trash2, X } from "lucide-react"
import Link from "next/link"
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
import { ImageDetailsPanel } from "@/components/gallery/ImageDetailsPanel"

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
                <div className="w-[400px] flex-shrink-0 bg-zinc-900 border-l border-white/5 h-full">
                    {fullImage ? (
                        <ImageDetailsPanel
                            image={fullImage}
                            currentUser={currentUser}
                            currentUserId={currentUser?.id}
                            isSaved={userContext?.isSaved || false}
                            initialCanonicalTags={data?.publicData?.canonicalTags || []}
                            initialAuthorTags={data?.publicData?.authorTags || []}
                            initialCommunityTags={data?.publicData?.communityTags || []}
                            initialUserTags={userContext?.userTags || []}
                            className="w-full h-full bg-zinc-900"
                        />
                    ) : (
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex gap-2">
                                    <Skeleton className="w-9 h-9 rounded-lg bg-zinc-800" />
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="w-9 h-9 rounded-lg bg-zinc-800" />
                                </div>
                            </div>
                            <Skeleton className="h-10 w-3/4 bg-zinc-800" />
                            <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                            <div className="flex gap-3 mt-6">
                                <Skeleton className="w-10 h-10 rounded-full bg-zinc-800" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24 bg-zinc-800" />
                                    <Skeleton className="h-3 w-16 bg-zinc-800" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
