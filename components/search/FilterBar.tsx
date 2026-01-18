"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
        <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Filters</h2>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="saved-mode"
                        checked={savedOnly}
                        onCheckedChange={(checked) => updateFilter("saved", checked ? "true" : null)}
                    />
                    <Label htmlFor="saved-mode">Saved Only</Label>
                </div>
            </div>

            {/* Domain Chips */}
            <div className="flex flex-wrap gap-2">
                <Badge
                    variant={!currentDomain ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/90"
                    onClick={() => updateFilter("domain", null)}
                >
                    All
                </Badge>
                {DOMAINS.map(d => (
                    <Badge
                        key={d.id}
                        variant={currentDomain === d.id ? "default" : "outline"}
                        className={cn(
                            "cursor-pointer hover:bg-primary/90 transition-all",
                            currentDomain === d.id ? "border-transparent" : "text-muted-foreground"
                        )}
                        onClick={() => updateFilter("domain", d.id === currentDomain ? null : d.id)}
                    >
                        {d.label}
                    </Badge>
                ))}
            </div>
        </div>
    )
}
