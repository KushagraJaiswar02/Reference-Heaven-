import { toast } from "sonner"

export const TOAST_DURATION = 3000

export const TOAST_MESSAGES = {
    SAVE: {
        SUCCESS: "Saved to your collection",
        REMOVED: "Removed from your collection",
    },
    FOLLOW: {
        SUCCESS: (authorName: string) => `You're now following ${authorName}`,
        UNFOLLOW: (authorName: string) => `Unfollowed ${authorName}`,
    },
    DOWNLOAD: {
        START: "Download started",
    },
    ERROR: {
        GENERIC: "Something went wrong. Please try again.",
        RATE_LIMIT: "You're doing that too fast. Try again shortly.",
        NETWORK: "Network error. Check your connection.",
        LOAD_FAIL: (item: string) => `Failed to load ${item}`,
    },
    COLLECTION: {
        CREATED: "Collection created",
        ADDED: "Added to collection",
        REMOVED: "Removed from collection",
        UPDATED: "Collection updated",
    },
    IMAGE: {
        UPDATED: "Image updated successfully",
        DELETED: "Image deleted",
    }
} as const

type ToastType = 'success' | 'error' | 'info' | 'warning'

export function showToast(type: ToastType, message: string) {
    // Dismiss existing toasts to avoid spam/stacking if multiple actions happen fast
    toast.dismiss()

    toast[type](message, {
        duration: TOAST_DURATION,
        dismissible: true, // Allow user to dismiss if they want, but auto-dismiss is 3s
    })
}
