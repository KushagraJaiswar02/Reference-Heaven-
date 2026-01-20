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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Loader2, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import { createImageReference } from "@/app/actions/image/createReference"
import { toast } from "sonner"
import { TaggingForm, type TaggingData } from "@/components/tags/TaggingForm"
import { compressImage, isValidUrl } from "@/lib/image-utils"

export function UploadModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'type' | 'details'>('type')
    const [tab, setTab] = useState<'upload' | 'link'>('upload')

    // Form State
    const [file, setFile] = useState<File | null>(null)
    const [externalUrl, setExternalUrl] = useState("")
    const [previewUrl, setPreviewUrl] = useState("")
    const [title, setTitle] = useState("")
    const [topic, setTopic] = useState("")
    const [description, setDescription] = useState("")
    const [colorPaletteStr, setColorPaletteStr] = useState("")

    // Tagging State
    const [taggingData, setTaggingData] = useState<TaggingData>({
        domain: null,
        canonicalTagIds: [],
        authorTags: []
    })

    const resetForm = () => {
        setFile(null)
        setExternalUrl("")
        setPreviewUrl("")
        setTitle("")
        setTopic("")
        setDescription("")
        setColorPaletteStr("")
        setTaggingData({ domain: null, canonicalTagIds: [], authorTags: [] })
        setStep('type')
        setLoading(false)
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            // Basic size check before compression
            if (selectedFile.size > 5 * 1024 * 1024) { // 5MB
                toast.error("File is too large (>5MB). Please choose a smaller image.")
                return
            }

            try {
                // Initial preview
                const objectUrl = URL.createObjectURL(selectedFile)
                setPreviewUrl(objectUrl)
                setFile(selectedFile)
            } catch (err) {
                toast.error("Failed to read file.")
            }
        }
    }

    const handleExternalUrlBlur = () => {
        if (!externalUrl) return
        if (!isValidUrl(externalUrl)) {
            toast.error("Invalid URL format")
            return
        }
        // Simple preview verify
        setPreviewUrl(externalUrl)
    }

    const uploadToCloudinary = async (fileToUpload: File) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

        if (!cloudName || !uploadPreset) {
            throw new Error("Cloudinary configuration missing")
        }

        const formData = new FormData()
        formData.append('file', fileToUpload)
        formData.append('upload_preset', uploadPreset)

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        })

        if (!response.ok) {
            const err = await response.json()
            console.error(err)
            throw new Error(err.error?.message || "Cloudinary Upload Failed")
        }

        return await response.json()
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            let finalImageUrl = externalUrl
            let finalMetadata = {}

            let finalWidth = 1000
            let finalHeight = 1000

            if (tab === 'upload') {
                if (!file) {
                    toast.error("No file selected")
                    setLoading(false)
                    return
                }

                // 1. Compress
                toast.info("Compressing image...", { duration: 1500 })
                const compressedFile = await compressImage(file)

                // 2. Upload to CDN
                toast.info("Uploading to CDN...", { duration: 2000 })
                const cdnResponse = await uploadToCloudinary(compressedFile)

                finalImageUrl = cdnResponse.secure_url
                finalMetadata = cdnResponse

                // Extract dimensions
                if (cdnResponse.width && cdnResponse.height) {
                    finalWidth = cdnResponse.width
                    finalHeight = cdnResponse.height
                }
            } else {
                // Convert previewUrl to image to get dimensions? 
                // For now, let's rely on defaults or maybe try to get it if possible? 
                // Simpler: Just rely on default 1000x1000 for external links unless we implement a meta-fetcher.
            }

            // 3. Save Reference
            const colorPalette = colorPaletteStr
                ? colorPaletteStr.split(',').map(c => c.trim()).filter(c => c.startsWith('#'))
                : []

            await createImageReference({
                title,
                topic,
                description,
                imageUrl: finalImageUrl,
                width: finalWidth,
                height: finalHeight,
                sourceType: tab === 'upload' ? 'uploaded_cdn' : 'external_url',
                sourceMetadata: finalMetadata,
                colorPalette,
                taggingData
            })

            toast.success("Reference added successfully!")
            setOpen(false)
            resetForm()

        } catch (error: any) {
            console.error(error)
            toast.error(error.message || "Failed to save reference")
        } finally {
            setLoading(false)
        }
    }

    const isValidStep1 = () => {
        if (tab === 'upload') return !!file
        if (tab === 'link') return !!externalUrl && isValidUrl(externalUrl)
        return false
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetForm()
        }}>
            <DialogTrigger asChild>
                <Button size="sm" className="hidden md:flex gap-2">
                    <Upload className="h-4 w-4" />
                    Add Reference
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Reference Image</DialogTitle>
                    <DialogDescription>
                        {step === 'type' ? "Choose how to add your reference." : "Add details and tags."}
                    </DialogDescription>
                </DialogHeader>

                {step === 'type' && (
                    <Tabs defaultValue="upload" value={tab} onValueChange={(v) => {
                        setTab(v as any)
                        setFile(null)
                        setExternalUrl("")
                        setPreviewUrl("")
                    }} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="upload">Upload File</TabsTrigger>
                            <TabsTrigger value="link">External URL</TabsTrigger>
                        </TabsList>

                        <TabsContent value="upload" className="py-4 space-y-4">
                            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 hover:bg-muted/50 transition-colors cursor-pointer relative">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileSelect}
                                />
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="max-h-64 object-contain rounded-md" />
                                ) : (
                                    <div className="text-center space-y-2">
                                        <div className="flex justify-center">
                                            <Upload className="h-10 w-10 text-muted-foreground" />
                                        </div>
                                        <p className="font-medium">Click to upload or drag & drop</p>
                                        <p className="text-xs text-muted-foreground">Max 5MB • JPG, PNG, WEBP</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="link" className="py-4 space-y-4">
                            <div className="space-y-4">
                                <Label>Image URL</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="https://example.com/image.jpg"
                                            className="pl-9"
                                            value={externalUrl}
                                            onChange={(e) => setExternalUrl(e.target.value)}
                                            onBlur={handleExternalUrlBlur}
                                        />
                                    </div>
                                </div>
                                {previewUrl && (
                                    <div className="flex justify-center border rounded-md p-2 bg-muted/20">
                                        <img src={previewUrl} alt="Preview" className="max-h-64 object-contain" />
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}

                {step === 'details' && (
                    <div className="py-4 space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="w-24 h-24 shrink-0 rounded-md overflow-hidden bg-muted border">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Thumb" className="w-full h-full object-cover" />
                                ) : <ImageIcon className="w-full h-full p-6 text-muted-foreground" />}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Cyberpunk Street" required />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="topic">Topic (Broad) *</Label>
                                    <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g., Sci-Fi" required />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Context, source, notes..." />
                        </div>

                        <div className="pt-2">
                            <TaggingForm
                                initialData={taggingData}
                                onChange={setTaggingData}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="color_palette">Color Palette (Hex codes, optional)</Label>
                            <Input id="color_palette" value={colorPaletteStr} onChange={(e) => setColorPaletteStr(e.target.value)} placeholder="#ff0000, #00ff00" />
                        </div>
                    </div>
                )}

                <DialogFooter className="flex justify-between items-center sm:justify-between">
                    {step === 'details' ? (
                        <Button variant="ghost" onClick={() => setStep('type')} disabled={loading}>
                            Back
                        </Button>
                    ) : <div></div>}

                    {step === 'type' ? (
                        <Button onClick={() => setStep('details')} disabled={!isValidStep1()}>
                            Next: Details
                        </Button>
                    ) : (
                        <Button onClick={onSubmit} disabled={loading || !title || !topic}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? (tab === 'upload' ? "Uploading..." : "Saving...") : "Save Reference"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}
