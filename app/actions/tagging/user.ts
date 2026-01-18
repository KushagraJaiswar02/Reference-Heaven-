'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function manageUserTag(imageId: string, tagText: string, isPublic: boolean = false) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    const cleanTag = tagText.trim().toLowerCase()
    if (!cleanTag) return { error: "Tag cannot be empty" }

    // Upsert (Insert or Update is_public)
    const { error } = await supabase
        .from('user_tags')
        .upsert({
            user_id: user.id,
            image_id: imageId,
            tag_text: cleanTag,
            is_public: isPublic
        }, {
            onConflict: 'user_id, image_id, tag_text'
        })

    if (error) return { error: error.message }

    revalidatePath(`/image/${imageId}`)
    return { success: true }
}

export async function removeUserTag(tagId: string, imageId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('user_tags')
        .delete()
        .eq('id', tagId)

    if (error) return { error: error.message }

    revalidatePath(`/image/${imageId}`)
    return { success: true }
}

export async function getUserTags(imageId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return [] // Only logged in users have user tags

    const { data, error } = await supabase
        .from('user_tags')
        .select('*')
        .eq('image_id', imageId)
        .eq('user_id', user.id) // Redundant via RLS but good for clarity
        .order('created_at')

    if (error) return []
    return data
}

export async function getPublicCommunityTags(imageId: string) {
    const supabase = await createClient()

    // Use the RPC secure function
    const { data, error } = await supabase
        .rpc('get_image_public_tags', { input_image_id: imageId })

    if (error) {
        console.error("Error fetching public tags:", error)
        return []
    }

    return data
}
