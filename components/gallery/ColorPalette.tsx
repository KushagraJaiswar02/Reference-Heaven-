"use client"

import { Copy } from "lucide-react"
import { toast } from "sonner"

interface ColorPaletteProps {
    colors: string[]
}

export function ColorPalette({ colors }: ColorPaletteProps) {
    const handleCopyColor = (color: string) => {
        navigator.clipboard.writeText(color)
        toast.success(`Color ${color} copied to clipboard`)
    }

    if (!colors || colors.length === 0) return null

    return (
        <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 pl-1">
                Palette
            </h3>
            <div className="flex overflow-x-auto gap-3 pb-4 pt-1 px-1 -mx-1 scrollbar-hide mask-fade-right">
                {colors.map((color: string, i: number) => (
                    <button
                        key={i}
                        onClick={() => handleCopyColor(color)}
                        className="group relative flex-shrink-0 w-10 h-10 rounded-full cursor-pointer shadow-lg ring-1 ring-white/10 hover:ring-2 hover:ring-white/50 transition-all hover:scale-110 focus:outline-none"
                        style={{ backgroundColor: color }}
                        title={`Copy ${color}`}
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-black/20">
                            <Copy className="w-3.5 h-3.5 text-white drop-shadow-md" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
