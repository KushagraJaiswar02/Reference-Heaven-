'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function deleteCollection(collectionId: string) {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error("Unauthorized")
    }

    // 2. Check Ownership
    const { data: collection } = await supabase
        .from('collections')
        .select('user_id')
        .eq('id', collectionId)
        .single()

    if (!collection || collection.user_id !== user.id) {
        throw new Error("Unauthorized: You do not own this collection.")
    }

    // 3. Delete
    const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId)

    if (error) {
        console.error("Delete Error:", error)
        throw new Error("Failed to delete collection")
    }

    // 4. Revalidate & Redirect
    revalidatePath('/collections')
    return { success: true }
}
