import { createClient } from "@/utils/supabase/server"
import { cache } from "react"
import { getImageCanonicalTags } from "@/app/actions/tagging/canonical"
import { getAuthorTags } from "@/app/actions/tagging/author"
import { getPublicCommunityTags } from "@/app/actions/tagging/user"

export type ImageDetailDTO = {
    image: any
    canonicalTags: any[]
    authorTags: any[]
    communityTags: any[]
}

export type UserImageContextDTO = {
    isSaved: boolean
    userTags: any[]
}

// Cached public data fetcher
export const getPublicImageDetails = cache(async (imageId: string): Promise<ImageDetailDTO | null> => {
    const supabase = await createClient()

    // Run independent fetches in parallel
    const [imageRes, canonicalTags, authorTags, communityTags] = await Promise.all([
        supabase.from("images").select("*, profiles(*)").eq("id", imageId).single(),
        getImageCanonicalTags(imageId),
        getAuthorTags(imageId),
        getPublicCommunityTags(imageId)
    ])

    if (imageRes.error || !imageRes.data) {
        return null
    }

    return {
        image: imageRes.data,
        canonicalTags: canonicalTags || [],
        authorTags: authorTags || [],
        communityTags: communityTags || []
    }
})

// Uncached user-specific data fetcher
export const getUserImageContext = async (imageId: string): Promise<UserImageContextDTO> => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { isSaved: false, userTags: [] }
    }

    // Run independent fetches in parallel
    const [saveRes, userTagsRes] = await Promise.all([
        supabase.from('saves').select('id').eq('user_id', user.id).eq('image_id', imageId).single(),
        supabase.from('user_tags').select('*').eq('image_id', imageId).eq('user_id', user.id).order('created_at')
    ])

    return {
        isSaved: !!saveRes.data,
        userTags: userTagsRes.data || []
    }
}
