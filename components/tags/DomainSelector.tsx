'use client'

import { cn } from "@/lib/utils"
// Icons for new domains
import {
    Palette,            // Art & Illus
    Shirt,              // Fashion
    Building2,          // Architecture (new)
    CarFront,           // Vehicles
    Package,            // Products
    Leaf,               // Nature (new)
    FlaskConical        // Experimental (new)
} from "lucide-react"

export type TagDomain =
    | 'art_illustration'
    | 'fashion_apparel'
    | 'architecture_spaces'
    | 'vehicles_transport'
    | 'products_objects'
    | 'nature_environment'
    | 'other_experimental'

interface DomainSelectorProps {
    selected: TagDomain | null
    onSelect: (domain: TagDomain) => void
}

const DOMAINS: {
    id: TagDomain,
    label: string,
    icon: any,
    desc: string,
    color: string
}[] = [
        {
            id: 'art_illustration',
            label: 'Art & Illustration',
            icon: Palette,
            desc: 'Figures, Anatomy, Concept Art',
            color: 'bg-purple-500/10 border-purple-500/50 text-purple-500'
        },
        {
            id: 'fashion_apparel',
            label: 'Fashion & Apparel',
            icon: Shirt,
            desc: 'Garments, drapes, fabrics',
            color: 'bg-pink-500/10 border-pink-500/50 text-pink-500'
        },
        {
            id: 'architecture_spaces',
            label: 'Arch & Spaces',
            icon: Building2,
            desc: 'Interiors, Exteriors, Urban',
            color: 'bg-amber-500/10 border-amber-500/50 text-amber-500'
        },
        {
            id: 'vehicles_transport',
            label: 'Vehicles',
            icon: CarFront,
            desc: 'Cars, mechs, aircraft',
            color: 'bg-blue-500/10 border-blue-500/50 text-blue-500'
        },
        {
            id: 'products_objects',
            label: 'Products',
            icon: Package,
            desc: 'Industrial design, tools',
            color: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500'
        },
        {
            id: 'nature_environment',
            label: 'Nature',
            icon: Leaf,
            desc: 'Landscapes, plants, weather',
            color: 'bg-green-600/10 border-green-600/50 text-green-600'
        },
        {
            id: 'other_experimental',
            label: 'Experimental',
            icon: FlaskConical,
            desc: 'Abstract, undefined',
            color: 'bg-zinc-500/10 border-zinc-500/50 text-zinc-500'
        },
    ]

export function DomainSelector({ selected, onSelect }: DomainSelectorProps) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">
                1. Select Content Domain (Required)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DOMAINS.map((item) => {
                    const Icon = item.icon
                    const isSelected = selected === item.id

                    return (
                        <button
                            key={item.id}
                            /* @ts-ignore */
                            onClick={() => onSelect(item.id)}
                            type="button"
                            className={cn(
                                "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 group hover:scale-[1.02] min-h-[100px]",
                                "bg-card/50 backdrop-blur-sm",
                                isSelected
                                    ? cn(item.color, "border-current shadow-lg ring-1 ring-CURRENT")
                                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                            )}
                        >
                            <Icon className={cn(
                                "w-6 h-6 mb-2 transition-colors",
                                isSelected ? "text-current" : "text-muted-foreground group-hover:text-foreground"
                            )} />

                            <span className={cn(
                                "text-xs font-semibold text-center leading-tight mb-1",
                                isSelected ? "text-current" : "text-foreground"
                            )}>
                                {item.label}
                            </span>

                            <span className="text-[9px] text-muted-foreground text-center leading-none opacity-80">
                                {item.desc}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
