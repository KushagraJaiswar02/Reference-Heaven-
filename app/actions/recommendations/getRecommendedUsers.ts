'use server'

import { createClient } from "@/utils/supabase/server"

export async function getRecommendedUsers(limit: number = 5) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // 1. Get IDs of people I already follow
    const { data: following } = await supabase
        .from('follows')
        .select('followed_id')
        .eq('follower_id', user.id)

    const followingIds = following?.map(f => f.followed_id) || []
    followingIds.push(user.id) // Exclude self

    // 2. Fetch profiles NOT in that list
    // Improve: Sort by popularity (requires joins or a materialized view for counts, but random is ok for v1)
    // For V1, we just take random profiles.
    // Since Supabase doesn't have easy RANDOM() in simple query without RPC,
    // we fetch a batch and shuffle or just fetch latest/active.
    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .not('id', 'in', `(${followingIds.join(',')})`)
        .limit(limit * 2) // Fetch more to shuffle

    if (error) {
        console.error("Error fetching recommendations:", error)
        return []
    }

    // Simple shuffle
    const shuffled = (data || []).sort(() => 0.5 - Math.random())
    return shuffled.slice(0, limit)
}
