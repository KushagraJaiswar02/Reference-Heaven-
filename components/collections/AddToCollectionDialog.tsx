"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Loader2 } from "lucide-react"
import { createCollection, getUserCollections, toggleImageInCollection } from "@/app/actions/collections"
import { toggleSave } from "@/app/actions/toggleSave"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface AddToCollectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    imageId: string
    initialIsSaved: boolean
    onGlobalSaveChange: (isSaved: boolean) => void
}

export function AddToCollectionDialog({
    open,
    onOpenChange,
    imageId,
    initialIsSaved,
    onGlobalSaveChange
}: AddToCollectionDialogProps) {
    const [collections, setCollections] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newCollectionName, setNewCollectionName] = useState("")
    const [creating, setCreating] = useState(false)
    const [isGlobalSaved, setIsGlobalSaved] = useState(initialIsSaved)
    const router = useRouter()

    useEffect(() => {
        if (open) {
            fetchCollections()
            setIsGlobalSaved(initialIsSaved)
        }
    }, [open, imageId, initialIsSaved])

    const fetchCollections = async () => {
        setLoading(true)
        const { collections: data, error } = await getUserCollections(imageId)
        if (error) {
            toast.error("Failed to load collections")
        } else {
            setCollections(data || [])
        }
        setLoading(false)
    }

    const handleCreateCollection = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCollectionName.trim()) return

        setCreating(true)
        const result = await createCollection(newCollectionName)
        setCreating(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Collection created")
            setNewCollectionName("")
            fetchCollections() // Refresh list
        }
    }

    const handleToggleCollection = async (collectionId: string, currentStatus: boolean) => {
        // Optimistic update
        setCollections(prev => prev.map(c =>
            c.id === collectionId ? { ...c, hasImage: !currentStatus } : c
        ))

        const result = await toggleImageInCollection(collectionId, imageId)
        if (result.error) {
            // Revert
            setCollections(prev => prev.map(c =>
                c.id === collectionId ? { ...c, hasImage: currentStatus } : c
            ))
            toast.error(result.error)
        } else {
            if (!currentStatus) {
                toast.success("Added to collection")
            } else {
                toast.success("Removed from collection")
            }
            router.refresh()
        }
    }

    const handleGlobalToggle = async () => {
        const newState = !isGlobalSaved
        setIsGlobalSaved(newState)
        onGlobalSaveChange(newState) // Notify parent immediately for optimistic UI in parent if needed

        const result = await toggleSave(imageId)
        if (result.error) {
            setIsGlobalSaved(!newState)
            onGlobalSaveChange(!newState)
            toast.error(result.error)
        } else {
            if (newState) toast.success("Saved to Library")
            else toast.success("Removed from Library")
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white">
                <DialogHeader>
                    <DialogTitle>Save to Collection</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Global Save */}
                    <div className="flex items-center space-x-2 p-3 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                        <Checkbox
                            id="global-save"
                            checked={isGlobalSaved}
                            onCheckedChange={handleGlobalToggle}
                            className="border-zinc-600 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                        />
                        <Label htmlFor="global-save" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1">
                            Save to Library (Global)
                        </Label>
                    </div>

                    <div className="h-[1px] bg-zinc-800" />

                    {/* Collections List */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-zinc-400">Your Collections</h4>

                        {loading ? (
                            <div className="flex justify-center py-4">
                                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                            </div>
                        ) : collections.length > 0 ? (
                            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                {collections.map(collection => (
                                    <div key={collection.id} className="flex items-center space-x-2 p-2 rounded hover:bg-zinc-900 transition-colors">
                                        <Checkbox
                                            id={collection.id}
                                            checked={collection.hasImage}
                                            onCheckedChange={() => handleToggleCollection(collection.id, collection.hasImage)}
                                            className="border-zinc-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                        />
                                        <Label htmlFor={collection.id} className="text-sm cursor-pointer flex-1 truncate">
                                            {collection.name}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-zinc-500 italic">No collections yet.</p>
                        )}
                    </div>

                    {/* Create New */}
                    <form onSubmit={handleCreateCollection} className="flex gap-2 items-center mt-4">
                        <Input
                            value={newCollectionName}
                            onChange={(e) => setNewCollectionName(e.target.value)}
                            placeholder="New collection name..."
                            className="bg-zinc-900 border-zinc-700 focus-visible:ring-indigo-500"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={creating || !newCollectionName.trim()}
                            className="shrink-0 bg-indigo-600 hover:bg-indigo-500"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    )
}
