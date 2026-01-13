
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function uploadImage(formData: FormData) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const topic = formData.get('topic') as string

    if (!file || !title) {
        throw new Error('Missing required fields')
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, file)

    if (uploadError) {
        console.error('Upload Error:', uploadError)
        throw new Error('Failed to upload image')
    }

    // Get public URL (optional, if bucket is public)
    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

    // Insert Record into Database
    const { error: dbError } = await supabase
        .from('images')
        .insert({
            title,
            topic,
            url: publicUrl,
            artist_id: user.id, // linked to profiles via RLS/FK
            likes_count: 0
        })

    if (dbError) {
        console.error('DB Error:', dbError)
        throw new Error('Failed to save image metadata')
    }

    revalidatePath('/')
    return { success: true }
}
