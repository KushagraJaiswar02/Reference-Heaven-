"use client"

import { useState, useEffect } from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"
import { ImageIcon, RefreshCcw } from "lucide-react"

interface ImageWithFallbackProps extends ImageProps {
    fallbackClassName?: string
    imageClassName?: string
}

export function ImageWithFallback({
    src,
    alt,
    className,
    fallbackClassName,
    imageClassName,
    ...props
}: ImageWithFallbackProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [key, setKey] = useState(0) // Used to force re-render on retry

    useEffect(() => {
        setHasError(false)
        setIsLoading(true)
    }, [src, key])

    const handleRetry = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setKey(prev => prev + 1)
    }

    return (
        <div className={cn("relative overflow-hidden w-full h-full", className)}>
            {/* Loading / Error State Background */}
            <div className={cn(
                "absolute inset-0 flex items-center justify-center bg-zinc-900 transition-opacity duration-300",
                (isLoading || hasError) ? "opacity-100 z-10" : "opacity-0 -z-10",
                fallbackClassName
            )}>
                {hasError ? (
                    <button
                        onClick={handleRetry}
                        className="flex flex-col items-center gap-2 p-4 text-zinc-500 hover:text-zinc-400 transition-colors group cursor-pointer"
                        title="Click to retry"
                    >
                        <ImageIcon className="w-6 h-6 opacity-50" />
                        <span className="text-xs font-medium">Image unavailable</span>
                        <RefreshCcw className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all transform group-active:rotate-180" />
                    </button>
                ) : (
                    // Subtle pulse for loading, not full skeleton which can be distracting in grids
                    <div className="w-full h-full bg-zinc-800 animate-pulse" />
                )}
            </div>

            <Image
                key={key}
                src={src}
                alt={alt}
                className={cn(
                    "transition-opacity duration-500",
                    (isLoading || hasError) ? "opacity-0" : "opacity-100",
                    imageClassName
                )}
                onLoad={() => {
                    setIsLoading(false)
                    setHasError(false)
                }}
                onError={() => {
                    setIsLoading(false)
                    setHasError(true)
                }}
                {...props}
            />
        </div>
    )
}
