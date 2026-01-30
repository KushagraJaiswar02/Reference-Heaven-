"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function GlobalSearchInput() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Initialize with URL query if present
    const [value, setValue] = React.useState(searchParams.get("q") || "")

    // Sync local state if URL changes (e.g. back button)
    React.useEffect(() => {
        setValue(searchParams.get("q") || "")
    }, [searchParams])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        // Construct new URLSearchParams
        // functionality: If on /search page, preserve filters?
        // Basic requirement: "Global search input" -> Go to /search?q=...
        // We will keep other params if we are already on /search, to respect "Clearing search must not clear filters"
        // actually that requirement is for the Clear Action, but likely implies orthogonality.

        const params = new URLSearchParams(searchParams.toString())

        if (value.trim()) {
            params.set("q", value.trim())
        } else {
            params.delete("q")
        }

        // If we enter empty search, do we go to /search (all items)? Yes.
        router.push(`/search?${params.toString()}`)
    }

    return (
        <form onSubmit={handleSearch} className="relative w-full max-w-2xl mx-auto group">
            <div className="relative transform transition-all duration-300 ease-out group-focus-within:scale-[1.02]">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-zinc-800 dark:group-focus-within:text-zinc-200 transition-colors duration-300 pointer-events-none z-10" />
                <Input
                    type="search"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search for inspiration..."
                    className="w-full h-14 rounded-full pl-14 pr-6 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm border-transparent 
                             hover:bg-zinc-100 dark:hover:bg-zinc-900 
                             focus-visible:bg-white dark:focus-visible:bg-black 
                             focus-visible:ring-2 focus-visible:ring-zinc-900/10 dark:focus-visible:ring-white/10 
                             focus-visible:border-transparent focus-visible:shadow-lg
                             transition-all duration-300 ease-out 
                             text-lg placeholder:text-zinc-400 shadow-sm"
                    name="search"
                />
            </div>
        </form>
    )
}
