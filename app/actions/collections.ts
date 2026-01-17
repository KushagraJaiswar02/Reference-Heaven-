"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCollection(name: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "You must be logged in to create a collection." }
    }

    const { data, error } = await supabase
        .from('collections')
        .insert({
            name,
            user_id: user.id
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/collections')
    return { success: true, collection: data }
}

export async function deleteCollection(collectionId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/collections')
    return { success: true }
}

export async function toggleImageInCollection(collectionId: string, imageId: string) {
    const supabase = await createClient()

    // Check if exists
    const { data: existing } = await supabase
        .from('collection_images')
        .select('id')
        .eq('collection_id', collectionId)
        .eq('image_id', imageId)
        .single()

    if (existing) {
        // Remove
        const { error } = await supabase
            .from('collection_images')
            .delete()
            .eq('id', existing.id)

        if (error) return { error: error.message }
        return { success: true, removed: true }
    } else {
        // Add
        const { error } = await supabase
            .from('collection_images')
            .insert({
                collection_id: collectionId,
                image_id: imageId
            })

        if (error) return { error: error.message }
        return { success: true, added: true }
    }
}

export async function getUserCollections(imageId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { collections: [] }

    // Get all collections
    const { data: collections, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message, collections: [] }

    // If imageId provided, check membership
    let collectionsWithStatus = collections.map(c => ({ ...c, hasImage: false }))

    if (imageId) {
        const { data: memberships } = await supabase
            .from('collection_images')
            .select('collection_id')
            .eq('image_id', imageId)
            .in('collection_id', collections.map(c => c.id))

        const memberIds = new Set(memberships?.map(m => m.collection_id))
        collectionsWithStatus = collections.map(c => ({
            ...c,
            hasImage: memberIds.has(c.id)
        }))
    }

    return { collections: collectionsWithStatus }
}
