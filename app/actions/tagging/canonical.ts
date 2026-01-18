'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type CanonicalTag = {
    id: string
    domain: string
    category: string
    name: string
}

export async function getCanonicalTags(domain: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('canonical_tags')
        .select('*')
        .eq('domain', domain)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

    if (error) {
        console.error('Error fetching canonical tags:', error)
        return {}
    }

    // Group by category
    const grouped: Record<string, CanonicalTag[]> = {}
    data.forEach((tag: CanonicalTag) => {
        if (!grouped[tag.category]) {
            grouped[tag.category] = []
        }
        grouped[tag.category].push(tag)
    })

    return grouped
}

export async function addCanonicalTagToImage(imageId: string, tagId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('image_canonical_tags')
        .insert({
            image_id: imageId,
            tag_id: tagId,
            source: 'manual'
        })

    if (error) {
        // Ignore duplicates gracefully
        if (error.code === '23505') return { success: true }
        return { error: error.message }
    }

    revalidatePath(`/image/${imageId}`)
    return { success: true }
}

export async function removeCanonicalTagFromImage(imageId: string, tagId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('image_canonical_tags')
        .delete()
        .match({ image_id: imageId, tag_id: tagId })

    if (error) return { error: error.message }

    revalidatePath(`/image/${imageId}`)
    return { success: true }
}

export async function getImageCanonicalTags(imageId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('image_canonical_tags')
        .select(`
      tag_id,
      canonical_tags (
        id,
        category,
        name,
        domain
      )
    `)
        .eq('image_id', imageId)

    if (error) return []

    return data.map((item: any) => ({
        ...item.canonical_tags,
        confidence: item.confidence
    }))
}
