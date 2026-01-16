"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { use, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Share2, Link as LinkIcon, MoreHorizontal, Maximize2, Pencil, Trash2, X, Save } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { Image as ImageType } from "@/types"
import { deleteImage } from "@/app/actions/deleteImage"
import { updateImage } from "@/app/actions/updateImage"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
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

export default function ImageModal({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [image, setImage] = useState<ImageType | null>(null)
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editLoading, setEditLoading] = useState(false)

    // Edit Form State
    const [title, setTitle] = useState("")
    const [topic, setTopic] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient()

            // Fetch Image
            const { data: imageData, error } = await supabase
                .from("images")
                .select("*, profiles(*)")
                .eq("id", id)
                .single()

            if (imageData) {
                setImage(imageData)
                setTitle(imageData.title)
                setTopic(imageData.topic || "")
            }

            // Fetch User
            const { data: { user } } = await supabase.auth.getUser()
            console.log("Current User:", user)
            console.log("Image Artist ID:", imageData?.artist_id)
            setCurrentUser(user)

            setLoading(false)
        }
        fetchData()
    }, [id])

    const isOwner = currentUser && image && currentUser.id === image.artist_id
    console.log("Is Owner:", isOwner)

    const handleDelete = async () => {
        if (!image) return

        try {
            // deleteImage now redirects on success, so we rely on that.
            const res = await deleteImage(image.id)
            // If we are here, it didn't redirect (e.g. error returned as object)
            if (res && res.error) {
                toast.error(res.error)
            }
        } catch (error: any) {
            if (error.digest?.startsWith('NEXT_REDIRECT')) {
                throw error
            }
            toast.error("An error occurred")
        }
    }

    const handleUpdate = async () => {
        if (!image) return
        setEditLoading(true)

        try {
            const formData = new FormData()
            formData.append('id', image.id)
            formData.append('title', title)
            formData.append('topic', topic)

            const res = await updateImage(formData)

            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Image updated successfully")
                setIsEditing(false)
                setImage(prev => prev ? { ...prev, title, topic } : null)
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

                {/* Close Button (Floating) */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-4 left-4 z-50 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
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

                                {isOwner ? (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full hover:bg-white/10 text-white"
                                            onClick={() => setIsEditing(!isEditing)}
                                        >
                                            <Pencil className="w-5 h-5" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-500/20 text-red-500">
                                                    <Trash2 className="w-5 h-5" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your image.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                ) : (
                                    <Button className="bg-red-600 hover:bg-red-700 text-white rounded-full font-semibold px-6">
                                        Save
                                    </Button>
                                )}
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                                {isEditing ? (
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
                                        <h1 className="text-3xl font-bold text-white mb-4 leading-tight">{image.title}</h1>

                                        {image.description && (
                                            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                                                {image.description}
                                            </p>
                                        )}
                                    </>
                                )}

                                {/* Artist Block */}
                                <div onClick={() => window.location.href = `/profile/${image.profiles?.username}`} className="block group mb-8 cursor-pointer">
                                    <div className="flex items-center gap-3 p-2 rounded-lg -mx-2 hover:bg-white/5 transition-colors">
                                        <Avatar className="w-10 h-10 ring-2 ring-transparent group-hover:ring-white/10 transition-all">
                                            <AvatarImage src={image.profiles?.avatar_url || ""} />
                                            <AvatarFallback>{image.profiles?.username?.charAt(0) || "?"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                                {image.profiles?.username || "Unknown"}
                                            </p>
                                            <p className="text-xs text-zinc-500">1.2k followers</p>
                                        </div>
                                        <Button variant="secondary" className="ml-auto rounded-full text-xs font-semibold h-8 bg-white/10 hover:bg-white/20 text-white border-none group-hover:bg-white/20">
                                            Visit
                                        </Button>
                                    </div>
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
                            <div className="p-4 border-t border-white/5 bg-zinc-900 flex flex-col gap-2 justify-center">
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
