
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ... imports
import { addCanonicalTagToImage } from './tagging/canonical'
import { addAuthorTags } from './tagging/author'

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
    const description = formData.get('description') as string
    const color_palette_str = formData.get('color_palette') as string

    // Tagging Data
    const taggingDataStr = formData.get('taggingData') as string
    let taggingData: any = {}
    try {
        taggingData = taggingDataStr ? JSON.parse(taggingDataStr) : {}
    } catch (e) {
        console.error("Failed to parse tagging data", e)
    }

    const color_palette = color_palette_str
        ? color_palette_str.split(',').map(c => c.trim()).filter(c => c.startsWith('#'))
        : []

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
        throw new Error('Failed to upload image')
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

    // Insert Record into Database
    // Removed legacy columns: lighting_style, perspective_angle
    const { data: image, error: dbError } = await supabase
        .from('images')
        .insert({
            title,
            topic, // We might want to deprecate this too if Domain covers it, but keeping for now as Broad Topic
            description,
            url: publicUrl,
            artist_id: user.id,
            likes_count: 0,
            color_palette
        })
        .select()
        .single()

    if (dbError) {
        console.error('DB Error:', dbError)
        throw new Error('Failed to save image metadata')
    }

    // Process Tags
    if (image && taggingData) {
        const imageId = image.id
        const { canonicalTagIds, authorTags } = taggingData

        const promises = []

        // 1. Canonical Tags
        if (Array.isArray(canonicalTagIds) && canonicalTagIds.length > 0) {
            for (const tagId of canonicalTagIds) {
                promises.push(addCanonicalTagToImage(imageId, tagId))
            }
        }

        // 2. Author Tags (Batched in action but here we call it once)
        if (Array.isArray(authorTags) && authorTags.length > 0) {
            promises.push(addAuthorTags(imageId, authorTags))
        }

        await Promise.allSettled(promises)
    }

    revalidatePath('/')
    return { success: true }
}
