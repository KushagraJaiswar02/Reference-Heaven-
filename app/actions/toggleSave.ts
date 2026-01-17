"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleSave(imageId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "You must be logged in to save images." }
    }

    try {
        // Check if already saved
        const { data: existingSave } = await supabase
            .from('saves')
            .select('*')
            .eq('user_id', user.id)
            .eq('image_id', imageId)
            .single()

        if (existingSave) {
            // Unsave
            const { error } = await supabase
                .from('saves')
                .delete()
                .eq('user_id', user.id)
                .eq('image_id', imageId)

            if (error) throw error

            revalidatePath('/')
            revalidatePath('/saved')
            revalidatePath(`/image/${imageId}`)
            return { isSaved: false }
        } else {
            // Save
            const { error } = await supabase
                .from('saves')
                .insert({
                    user_id: user.id,
                    image_id: imageId
                })

            if (error) {
                // Ignore unique violation (23505) if race condition
                if (error.code === '23505') {
                    return { isSaved: true }
                }
                throw error
            }

            revalidatePath('/')
            revalidatePath('/saved')
            revalidatePath(`/image/${imageId}`)
            return { isSaved: true }
        }
    } catch (error) {
        console.error('Error toggling save:', error)
        return { error: "Failed to toggle save" }
    }
}
