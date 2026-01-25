"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/**
 * Follow a user
 */
export async function followUser(authorId: string) {
    const supabase = await createClient()

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login") // Or return Error
    }

    if (user.id === authorId) {
        return { error: "You cannot follow yourself" }
    }

    // 2. Insert Follow
    const { error } = await supabase
        .from('follows')
        .insert({
            follower_id: user.id,
            followed_id: authorId
        })

    if (error) {
        console.error("Error following user:", error)
        return { error: "Failed to follow user" }
    }

    // 3. Revalidate
    // We revalidate both profiles involved (though main useful one is the author's profile page)
    // And possibly the current page if we knew it. For now, we assume this is enough with Optimistic UI.
    revalidatePath(`/profile/${authorId}`)
    revalidatePath(`/profile/[username]`, 'page')

    return { success: true }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(authorId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/login")
    }

    const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('followed_id', authorId)

    if (error) {
        console.error("Error unfollowing user:", error)
        return { error: "Failed to unfollow user" }
    }

    revalidatePath(`/profile/${authorId}`)
    revalidatePath(`/profile/[username]`, 'page')

    return { success: true }
}

/**
 * Get Follow Status for current user efficiently
 */
export async function getFollowStatus(authorId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    const { data, error } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('followed_id', authorId)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found" (JSON) or "No rows found"
        // It's fine if not found
    }

    return !!data
}

/**
 * Get Follow Counts
 */
export async function getFollowCounts(profileId: string) {
    const supabase = await createClient()

    // Followers: People who follow THIS profile
    const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('followed_id', profileId)

    // Following: People THIS profile follows
    const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profileId)

    return {
        followers: followersCount || 0,
        following: followingCount || 0
    }
}
