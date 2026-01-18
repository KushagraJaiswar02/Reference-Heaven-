'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function manageUserTag(imageId: string, tagText: string, isPublic: boolean = false) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "Unauthorized" }

    const cleanTag = tagText.trim().toLowerCase()
    if (!cleanTag) return { error: "Tag cannot be empty" }

    // Check Limit (Max 3 tags per image per user)
    // We only check if we are inserting a new tag, not updating visibility
    // But since we use upsert, we need to know if it already exists to skip check? 
    // Simplest is to check count first.

    // First, check if this specific tag already exists (update scenario)
    const { data: existingTag } = await supabase
        .from('user_tags')
        .select('id')
        .eq('user_id', user.id)
        .eq('image_id', imageId)
        .eq('tag_text', cleanTag)
        .single()

    if (!existingTag) {
        // It's a new tag, check count
        const { count, error: countError } = await supabase
            .from('user_tags')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('image_id', imageId)

        if (countError) return { error: countError.message }

        if (count !== null && count >= 3) {
            return { error: "Limit reached: Max 3 personal tags per image." }
        }
    }

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

export async function getUserUniqueTags() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch all tags for user to build autocomplete list
    // Improve: use a distinct query or RPC if dataset gets huge, but for now client-side distinct ok?
    // Actually, let's try distinct on server
    const { data, error } = await supabase
        .from('user_tags')
        .select('tag_text')
        .eq('user_id', user.id)

    if (error) return []

    // De-duplicate in JS since supabase-js distinct is tricky without raw sql or RPC
    const uniqueTags = Array.from(new Set(data.map(t => t.tag_text))).sort()
    return uniqueTags.slice(0, 50) // Top 50 most recent/alphabetical
}

export async function getUserTagSummary(userId: string) {
    const supabase = await createClient()

    // Check if the requester is the same as the target user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) return []

    const { data, error } = await supabase
        .from('user_tags')
        .select('tag_text')
        .eq('user_id', userId)

    if (error) return []

    // Aggregate counts
    const counts: Record<string, number> = {}
    data.forEach((t: { tag_text: string }) => {
        counts[t.tag_text] = (counts[t.tag_text] || 0) + 1
    })

    return Object.entries(counts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
}
