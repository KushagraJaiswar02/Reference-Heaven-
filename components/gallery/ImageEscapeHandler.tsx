"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function ImageEscapeHandler() {
    const router = useRouter()

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                // Ignore if user is typing in an input or textarea
                if (
                    event.target instanceof HTMLInputElement ||
                    event.target instanceof HTMLTextAreaElement ||
                    (event.target as HTMLElement).isContentEditable
                ) {
                    return
                }

                // Attempt to go back, fallback to home if we can't determine history depth efficiently
                // checking window.history.length isn't perfect but better than nothing.
                // However, a safer bet for "Back" behavior in Next.js is just router.back().
                // If it was a deep link (new tab), router.back() might do nothing or close tab?
                // Actually router.back() acts like browser back. If no history, it does nothing?
                // Ref: If window.history.length <= 1, maybe force home.

                if (window.history.length > 1) {
                    router.back()
                } else {
                    router.push("/")
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [router])

    return null
}
