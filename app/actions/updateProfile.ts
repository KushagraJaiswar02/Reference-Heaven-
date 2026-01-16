'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return { error: "Unauthorized" }
    }

    const bio = formData.get('bio') as string
    const website = formData.get('website') as string
    const socials = JSON.parse(formData.get('socials') as string)
    const avatarFile = formData.get('avatar') as File | null

    let avatar_url = null

    // Upload Avatar if provided
    // Upload Avatar if provided
    if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        console.log(`[updateProfile] Uploading avatar: ${filePath}, size: ${avatarFile.size}`)

        const arrayBuffer = await avatarFile.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, buffer, {
                contentType: avatarFile.type,
                upsert: true
            })

        if (uploadError) {
            console.error('[updateProfile] Upload Error:', uploadError)
            return { error: `Failed to upload avatar: ${uploadError.message}` }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        console.log(`[updateProfile] Upload success, publicUrl: ${publicUrl}`)
        avatar_url = publicUrl
    }

    // Update Profile
    const updateData: any = {
        bio,
        website,
        socials,
        updated_at: new Date().toISOString()
    }

    if (avatar_url) {
        updateData.avatar_url = avatar_url
    }

    const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

    if (updateError) {
        console.error('Update Error:', updateError)
        return { error: "Failed to update profile" }
    }

    // Revalidate paths
    // We need to fetch the username to revalidate safely, although we could pass it or use a wildcard
    // Ideally we revalidate the specific profile page
    // For now we'll fetch the profile to get the username
    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

    if (profile?.username) {
        revalidatePath(`/profile/${profile.username}`)
    }

    return { success: true }
}
