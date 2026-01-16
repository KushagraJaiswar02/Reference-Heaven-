'use client'

import { useCallback, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface AvatarUploadProps {
    currentAvatarUrl?: string
    username: string
    onFileSelect: (file: File | null) => void
}

export function AvatarUpload({ currentAvatarUrl, username, onFileSelect }: AvatarUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            onFileSelect(file)
        }
    }, [onFileSelect])

    const handleRemove = useCallback(() => {
        setPreviewUrl(null)
        onFileSelect(null)
    }, [onFileSelect])

    return (
        <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24 border-2 border-zinc-800">
                <AvatarImage src={previewUrl || currentAvatarUrl} className="object-cover" />
                <AvatarFallback className="bg-zinc-800 text-2xl font-bold text-zinc-500">
                    {username[0]?.toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="relative overflow-hidden bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white"
                    >
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                        />
                        <Upload className="w-4 h-4 mr-2" />
                        Change Avatar
                    </Button>
                    {previewUrl && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={handleRemove}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Remove
                        </Button>
                    )}
                </div>
                <p className="text-xs text-zinc-500">
                    JPG, GIF or PNG. Max 2MB.
                </p>
            </div>
        </div>
    )
}
