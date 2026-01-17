"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function addTagToImage(imageId: string, tagName: string, category: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "You must be logged in to add tags." }
    }

    const cleanTagName = tagName.trim().toLowerCase()
    if (!cleanTagName) return { error: "Tag name cannot be empty" }

    // 1. Get or Create Tag
    // We try to select first.
    let tagId: string | null = null;

    const { data: existingTag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', cleanTagName)
        .single()

    if (existingTag) {
        tagId = existingTag.id
    } else {
        const { data: newTag, error: createError } = await supabase
            .from('tags')
            .insert({ name: cleanTagName })
            .select('id')
            .single()

        if (createError) {
            // Handle race condition where tag might have been created in parallel
            if (createError.code === '23505') { // Unique violation
                const { data: retryTag } = await supabase
                    .from('tags')
                    .select('id')
                    .eq('name', cleanTagName)
                    .single()
                tagId = retryTag?.id || null
            } else {
                return { error: createError.message }
            }
        } else {
            tagId = newTag.id
        }
    }

    if (!tagId) return { error: "Failed to resolve tag" }

    // 2. Link Tag to Image
    const { error: linkError } = await supabase
        .from('image_tags')
        .insert({
            image_id: imageId,
            tag_id: tagId,
            user_id: user.id,
            category: category
        })

    if (linkError) {
        if (linkError.code === '23505') {
            return { error: "This tag already exists for this category on this image." }
        }
        return { error: linkError.message }
    }

    revalidatePath(`/image/${imageId}`)
    return { success: true }
}

export async function removeTagFromImage(imageTagId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('image_tags')
        .delete()
        .eq('id', imageTagId)

    if (error) return { error: error.message }

    // We don't know the imageId easily without fetching it first, 
    // but usually this is called from a UI where we might trigger a broader revalidate 
    // or we assume client-side optimistic update handles the immediate view.
    // Ideally we should revalidate the image page.

    return { success: true }
}

export async function getTagsByImage(imageId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('image_tags')
        .select(`
            id,
            category,
            user_id,
            tags (
                id,
                name
            )
        `)
        .eq('image_id', imageId)

    if (error) return { tags: [] }

    // Transform to friendlier format
    return {
        tags: data.map((item: any) => ({
            id: item.id, // image_tag id (relationship id)
            tagId: item.tags.id,
            name: item.tags.name,
            category: item.category,
            userId: item.user_id
        }))
    }
}
