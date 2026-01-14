'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteImage(imageId: string) {
    const supabase = await createClient()

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return { error: "Unauthorized" }
    }

    // 2. Fetch the image to get the storage path and verify owner
    const { data: image, error: fetchError } = await supabase
        .from('images')
        .select('artist_id, url')
        .eq('id', imageId)
        .single()

    if (fetchError || !image) {
        return { error: "Image not found" }
    }

    if (image.artist_id !== user.id) {
        return { error: "Unauthorized: You do not own this image" }
    }

    // 3. Delete from Storage
    // URL format: .../storage/v1/object/public/images/USER_ID/FILENAME
    // We need to extract: USER_ID/FILENAME
    const storagePath = image.url.split('/images/').pop()

    if (storagePath) {
        const { error: storageError } = await supabase.storage
            .from('images')
            .remove([storagePath])

        if (storageError) {
            console.error('Storage Delete Error:', storageError)
            // Continue to delete DB record even if storage fails? 
            // Usually yes, to keep DB clean, but maybe log it.
        }
    }

    // 4. Delete from Database
    const { error: deleteError } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId)

    if (deleteError) {
        return { error: "Failed to delete image record" }
    }

    // 5. Revalidate
    revalidatePath('/')
    return { success: true }
}
