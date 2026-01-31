"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function GlobalSearchInput() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // 1. Internal Value (Immediate UI feedback)
    const [value, setValue] = React.useState(searchParams.get("q") || "")

    // 2. Debounced Value (Triggers navigation)
    const [debouncedValue, setDebouncedValue] = React.useState(searchParams.get("q") || "")

    // 3. Pending Transition State (Optional UI indicator)
    const [isPending, startTransition] = React.useTransition()

    // Sync internal state if URL changes externally (e.g. back button)
    React.useEffect(() => {
        const paramQ = searchParams.get("q") || ""
        if (paramQ !== debouncedValue) {
            setValue(paramQ)
            setDebouncedValue(paramQ)
        }
    }, [searchParams])

    // Debounce Logic
    React.useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, 300)

        return () => {
            clearTimeout(handler)
        }
    }, [value])

    // Effect: Trigger Navigation when Debounced Value changes
    React.useEffect(() => {
        // Prevent initial run if they match (hydration)
        const currentQ = searchParams.get("q") || ""
        if (debouncedValue === currentQ) return

        const params = new URLSearchParams(searchParams.toString())

        if (debouncedValue.trim()) {
            params.set("q", debouncedValue.trim())
        } else {
            params.delete("q")
        }

        // Use startTransition to mark this as a background update
        // Use replace to avoid cluttering history stack with every letter, 
        // OR push if you want separate history entries per "search" (debounced).
        // Usually, 'push' is better for "I searched for X", but 'replace' is better if typing fixes.
        // Let's use 'replace' for typing updates to keep history clean, or 'push' if key delta is large?
        // Standard pattern: Replace for live search interactions.
        startTransition(() => {
            router.replace(`/search?${params.toString()}`)
        })

    }, [debouncedValue, router, searchParams])

    // Handle Enter Key (Immediate Trigger)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Force update immediately (cancel debounce timer effect effectively by setting it?)
        // Actually, easiest is to just run the nav logic.
        // But to avoid race with the effect, we can just let the effect handle it 
        // OR we manually trigger and update debouncedValue to match.

        // If we want immediate navigation:
        setDebouncedValue(value) // This will trigger the effect immediately if different
    }

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto group">
            <div className="relative transform transition-all duration-300 ease-out group-focus-within:scale-[1.02]">
                <Search className={`absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 pointer-events-none z-10 ${isPending ? "text-amber-500 animate-pulse" : "text-zinc-400 group-focus-within:text-zinc-800 dark:group-focus-within:text-zinc-200"
                    }`} />
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
