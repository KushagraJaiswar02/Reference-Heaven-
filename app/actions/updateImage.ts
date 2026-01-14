'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateImage(formData: FormData) {
    const supabase = await createClient()

    const imageId = formData.get('id') as string
    const title = formData.get('title') as string
    const topic = formData.get('topic') as string

    // Optional fields that might be useful to update
    const description = formData.get('description') as string

    if (!imageId || !title) {
        return { error: "Missing required fields" }
    }

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: "Unauthorized" }
    }

    // 2. Verify ownership (can also rely on RLS, but explicit check provides better error msgs)
    const { data: image, error: fetchError } = await supabase
        .from('images')
        .select('artist_id')
        .eq('id', imageId)
        .single()

    if (fetchError || !image) {
        return { error: "Image not found" }
    }

    if (image.artist_id !== user.id) {
        return { error: "Unauthorized" }
    }

    // 3. Update Record
    const { error: updateError } = await supabase
        .from('images')
        .update({
            title,
            topic,
            description
        })
        .eq('id', imageId)

    if (updateError) {
        console.error("Update Error:", updateError)
        return { error: "Failed to update image" }
    }

    revalidatePath('/')
    revalidatePath(`/image/${imageId}`) // If there's a standalone page

    return { success: true }
}
