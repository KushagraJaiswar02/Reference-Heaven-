'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addAuthorTags(imageId: string, tags: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    // 1. Limit check
    // We can check existing count first
    const { count, error: countError } = await supabase
        .from('author_tags')
        .select('*', { count: 'exact', head: true })
        .eq('image_id', imageId)

    if (countError) return { error: countError.message }

    if ((count || 0) + tags.length > 7) {
        return { error: "Max 7 intent tags allowed." }
    }

    // 2. Insert
    const rows = tags.map(tag => ({
        image_id: imageId,
        author_id: user.id,
        tag_text: tag.trim().toLowerCase()
    }))

    const { error } = await supabase
        .from('author_tags')
        .insert(rows)

    if (error) return { error: error.message }

    revalidatePath(`/image/${imageId}`)
    return { success: true }
}

export async function removeAuthorTag(tagId: string, imageId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('author_tags')
        .delete()
        .eq('id', tagId)

    if (error) return { error: error.message }

    revalidatePath(`/image/${imageId}`)
    return { success: true }
}

export async function getAuthorTags(imageId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('author_tags')
        .select('*')
        .eq('image_id', imageId)
        .order('created_at', { ascending: true })

    if (error) return []
    return data
}
