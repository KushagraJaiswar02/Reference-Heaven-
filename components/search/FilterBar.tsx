"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const DOMAINS = [
    { id: 'art_illustration', label: 'Art & Illustration' },
    { id: 'fashion_apparel', label: 'Fashion' },
    { id: 'architecture_spaces', label: 'Architecture' },
    { id: 'vehicles_transport', label: 'Vehicles' },
    { id: 'products_objects', label: 'Products' },
    { id: 'nature_environment', label: 'Nature' },
    { id: 'other_experimental', label: 'Experimental' },
]

export function FilterBar() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentDomain = searchParams.get("domain")
    const savedOnly = searchParams.get("saved") === "true"

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/search?${params.toString()}`)
    }

    return (
        <div className="flex flex-col gap-6 py-4">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest text-xs">Filter By</h2>
                <div className="flex items-center space-x-3 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-full border border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={() => updateFilter("saved", null)}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                            !savedOnly ? "bg-white dark:bg-black shadow-sm text-foreground" : "text-zinc-500 hover:text-foreground"
                        )}
                    >
                        Global
                    </button>
                    <button
                        onClick={() => updateFilter("saved", "true")}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                            savedOnly ? "bg-white dark:bg-black shadow-sm text-foreground" : "text-zinc-500 hover:text-foreground"
                        )}
                    >
                        Saved
                    </button>
                </div>
            </div>

            {/* Domain Chips */}
            <div className="flex flex-wrap gap-2">
                <FilterPill
                    label="All"
                    isActive={!currentDomain}
                    onClick={() => updateFilter("domain", null)}
                />
                {DOMAINS.map(d => (
                    <FilterPill
                        key={d.id}
                        label={d.label}
                        isActive={currentDomain === d.id}
                        onClick={() => updateFilter("domain", d.id === currentDomain ? null : d.id)}
                    />
                ))}
            </div>
        </div>
    )
}

function FilterPill({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 transform active:scale-95 border",
                isActive
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white shadow-md"
                    : "bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            )}
        >
            {label}
        </button>
    )
}
