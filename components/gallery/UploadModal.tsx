
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

// Imports
import { TaggingForm, type TaggingData } from "@/components/tags/TaggingForm"

export function UploadModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    // New state for tagging
    const [taggingData, setTaggingData] = useState<TaggingData>({
        domain: null,
        canonicalTagIds: [],
        authorTags: []
    })

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        // Serialize tagging data
        formData.append('taggingData', JSON.stringify(taggingData))

        try {
            await uploadImage(formData)
            toast.success("Image uploaded successfully!")
            setOpen(false)
            // Reset form
            setTaggingData({ domain: null, canonicalTagIds: [], authorTags: [] })
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
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Upload Reference</DialogTitle>
                    <DialogDescription>
                        Contribute high-quality references to the library.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="grid gap-4 py-4">
                        {/* Core Info */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" placeholder="e.g., Cyberpunk Street" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="topic">Topic (Broad)</Label>
                                <Input id="topic" name="topic" placeholder="e.g., Sci-Fi, Environment" required />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" placeholder="Describe context, source, or notes..." />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="file">Image File</Label>
                            <Input id="file" name="file" type="file" required accept="image/*" className="cursor-pointer" />
                        </div>

                        {/* Tagging System Integration */}
                        <div className="pt-2">
                            <TaggingForm
                                initialData={taggingData}
                                onChange={setTaggingData}
                            />
                        </div>

                        {/* Color Palette (Automatic? Or manual for now kept as backup if needed, but lets hide it to clean UI as per 'Core System' request) */}
                        <div className="grid gap-2">
                            <Label htmlFor="color_palette">Color Palette (Hex codes, optional)</Label>
                            <Input id="color_palette" name="color_palette" placeholder="#ff0000, #00ff00" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading || !taggingData.domain}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Uploading..." : "Upload & Tag"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog >
    )
}
