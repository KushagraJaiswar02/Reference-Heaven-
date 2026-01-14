
'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2 } from "lucide-react"
import { uploadImage } from "@/app/actions/upload"
import { toast } from "sonner"

export function UploadModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)

        try {
            await uploadImage(formData)
            toast.success("Image uploaded successfully!")
            setOpen(false)
        } catch (error) {
            toast.error("Failed to upload image. Please try again.")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="hidden md:flex gap-2">
                    <Upload className="h-4 w-4" />
                    Upload
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upload Image</DialogTitle>
                    <DialogDescription>
                        Share your reference image with the community.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" placeholder="e.g., Cyberpunk Street" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="topic">Topic (Optional)</Label>
                            <Input id="topic" name="topic" placeholder="e.g., Sci-Fi, Environment" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" placeholder="Describe the image..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="lighting_style">Lighting Style</Label>
                                <Input id="lighting_style" name="lighting_style" placeholder="e.g. Rim Light" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="perspective_angle">Perspective</Label>
                                <Input id="perspective_angle" name="perspective_angle" placeholder="e.g. Low Angle" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="color_palette">Color Palette (Hex codes)</Label>
                            <Input id="color_palette" name="color_palette" placeholder="#ff0000, #00ff00" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="file">Image File</Label>
                            <Input id="file" name="file" type="file" required accept="image/*" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Uploading..." : "Upload"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}
