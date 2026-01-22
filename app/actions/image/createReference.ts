'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { addCanonicalTagToImage } from '../tagging/canonical'
import { addAuthorTags } from '../tagging/author'

export type CreateImageDTO = {
    title: string;
    topic: string;
    description?: string;
    imageUrl: string;
    width?: number; // New
    height?: number; // New
    sourceType: 'uploaded_cdn' | 'external_url';
    sourceMetadata?: any;
    colorPalette?: string[];
    taggingData?: {
        canonicalTagIds?: string[];
        authorTags?: string[];
    }
}

export async function createImageReference(data: CreateImageDTO) {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    if (!data.imageUrl || !data.title) {
        throw new Error('Missing required fields')
    }

    // Insert Record into Database
    const { data: image, error: dbError } = await supabase
        .from('images')
        .insert({
            title: data.title,
            topic: data.topic,
            description: data.description,
            url: data.imageUrl,
            width: data.width || 1000,
            height: data.height || 1000,
            source_type: data.sourceType,
            source_metadata: data.sourceMetadata || {},
            artist_id: user.id,
            likes_count: 0,
            color_palette: data.colorPalette || []
        })
        .select()
        .single()

    if (dbError) {
        console.error('DB Error:', dbError)
        // Return structured error or throw with details 
        // Note: Client 'toast' displays error.message
        throw new Error(`DB Error: ${dbError.message} (${dbError.details || ''})`)
    }

    // Process Tags
    if (image && data.taggingData) {
        const imageId = image.id
        const { canonicalTagIds, authorTags } = data.taggingData

        const promises = []

        // 1. Canonical Tags
        if (Array.isArray(canonicalTagIds) && canonicalTagIds.length > 0) {
            for (const tagId of canonicalTagIds) {
                promises.push(addCanonicalTagToImage(imageId, tagId))
            }
        }

        // 2. Author Tags
        if (Array.isArray(authorTags) && authorTags.length > 0) {
            promises.push(addAuthorTags(imageId, authorTags))
        }

        await Promise.allSettled(promises)
    }

    revalidatePath('/')
    return { success: true, imageId: image.id }
}
