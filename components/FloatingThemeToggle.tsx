"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function FloatingThemeToggle() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Prevent hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border-white/10 shadow-2xl hover:bg-white/20 transition-all hover:scale-105"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                <span className="sr-only">Toggle theme</span>
                {theme === "dark" ? (
                    <Sun className="h-5 w-5 text-yellow-400 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 absolute" />
                ) : (
                    <Moon className="h-5 w-5 text-indigo-500 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 absolute" />
                )}
                {/* Render both for animation swapping, but standard toggle logic */}
                <Sun className="h-5 w-5 text-yellow-400 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 text-indigo-400 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
        </div>
    )
}
