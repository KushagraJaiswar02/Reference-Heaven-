'use server'

import { createClient } from "@/utils/supabase/server"

export interface UserSearchResult {
    id: string
    username: string
    avatar_url: string
    bio: string
}

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
    if (!query || query.trim().length < 2) return []

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, bio')
        .ilike('username', `%${query}%`)
        .limit(20)

    if (error) {
        console.error("Error searching users:", error)
        return []
    }

    return data || []
}
