"use client"

import { useState, useTransition } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteCollection } from "@/app/actions/deleteCollection"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DeleteCollectionButtonProps {
    collectionId: string
    collectionName: string
}

export function DeleteCollectionButton({ collectionId, collectionName }: DeleteCollectionButtonProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const handleDelete = async () => {
        startTransition(async () => {
            try {
                await deleteCollection(collectionId)
                toast.success("Collection deleted")
                router.push("/collections")
            } catch (error) {
                toast.error("Failed to delete collection")
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-full h-10 w-10 transition-colors"
                    title="Delete Collection"
                >
                    <Trash2 className="w-5 h-5" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Collection?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete <span className="font-semibold text-foreground">"{collectionName}"</span>?
                        This action cannot be undone. Items in this collection will not be deleted from the database.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
