import { createClient } from "@/utils/supabase/server"
import { cache } from "react"
import { getImageCanonicalTags } from "@/app/actions/tagging/canonical"
import { getAuthorTags } from "@/app/actions/tagging/author"
import { getPublicCommunityTags } from "@/app/actions/tagging/user"
import { ImageCardDTO, ImageDetailDTO, UserImageContextDTO } from "./dto"
import { getDetailImageUrl } from "@/lib/image-optim"

// Cached public data fetcher for DETAILS
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

    const img = imageRes.data;

    return {
        image: {
            ...img,
            url: getDetailImageUrl(img.url), // Transform to optimized detail size
            width: img.width || 1000,
            height: img.height || 1000,
            aspect_ratio: (img.width || 1000) / (img.height || 1000),
            profiles: img.profiles
        },
        canonicalTags: canonicalTags || [],
        authorTags: authorTags || [],
        communityTags: communityTags || []
    }
})

// Uncached user-specific data fetcher for DETAILS
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

// getFeedImages removed as it was unused and outdated
