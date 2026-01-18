import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
            <div className="w-full max-w-[1200px] h-[90vh] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl flex border border-white/10">
                {/* Image Section Skeleton */}
                <div className="flex-1 bg-black relative flex items-center justify-center opacity-50">
                    <div className="w-12 h-12 border-4 border-zinc-700 border-t-white rounded-full animate-spin" />
                </div>

                {/* Details Section Skeleton */}
                <div className="w-[400px] bg-zinc-900 flex-shrink-0 border-l border-white/5 p-6 space-y-6 hidden md:block">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-2">
                            <Skeleton className="w-8 h-8 rounded-full bg-white/5" />
                            <Skeleton className="w-8 h-8 rounded-full bg-white/5" />
                        </div>
                    </div>

                    <Skeleton className="h-8 w-3/4 bg-white/5 rounded-lg" />
                    <Skeleton className="h-4 w-full bg-white/5 rounded-lg" />
                    <Skeleton className="h-4 w-5/6 bg-white/5 rounded-lg" />

                    <div className="pt-8">
                        <Skeleton className="h-40 w-full bg-white/5 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}
