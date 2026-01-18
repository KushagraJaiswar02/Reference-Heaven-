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
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search images, tags, authors..."
                className="pl-9 bg-secondary/50 border-transparent focus:bg-background transition-colors"
                name="search"
            />
        </form>
    )
}
