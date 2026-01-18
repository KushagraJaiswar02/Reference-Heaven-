import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center animate-in fade-in duration-300">
            {/* Back Nav */}
            <div className="w-full max-w-7xl mb-4">
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowLeft className="w-4 h-4" /> Back to Gallery
                </div>
            </div>

            <div className="bg-card rounded-3xl overflow-hidden shadow-2xl max-w-7xl w-full flex flex-col md:flex-row min-h-[80vh]">

                {/* Image Section Skeleton */}
                <div className="md:w-3/4 bg-black/5 flex items-center justify-center p-4">
                    <div className="relative w-full h-[70vh] md:h-[80vh] flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-zinc-700 border-t-white rounded-full animate-spin opacity-50" />
                    </div>
                </div>

                {/* Details Section Skeleton */}
                <div className="w-[400px] flex-shrink-0 bg-background border-l border-border/50 flex flex-col">
                    <div className="p-6 border-b border-border/50 flex justify-between">
                        <div className="flex gap-2">
                            <Skeleton className="w-8 h-8 rounded-full" />
                            <Skeleton className="w-8 h-8 rounded-full" />
                        </div>
                        <Skeleton className="w-8 h-8 rounded-full" />
                    </div>

                    <div className="p-8 space-y-6">
                        <Skeleton className="h-10 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />

                        <div className="flex items-center gap-3 pt-4">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-4">
                            <Skeleton className="h-16 rounded-xl" />
                            <Skeleton className="h-16 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
