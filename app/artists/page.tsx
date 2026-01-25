import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ArtistCard } from "@/components/profile/ArtistCard"
import { Users, UserMinus } from "lucide-react"

export default async function ArtistsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Fetch followed artists
    const { data: follows, error } = await supabase
        .from('follows')
        .select(`
            followed_id,
            profiles:followed_id (
                id,
                username,
                avatar_url,
                bio
            )
        `)
        .eq('follower_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching artists:", error)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen pt-20">
                <p className="text-red-500">Failed to load artists.</p>
            </div>
        )
    }

    // Extracts the profile from the join
    const followedArtists = follows
        ?.map((f: any) => f.profiles)
        .filter((p: any) => p !== null) || []

    // Fetch recommendations
    const { getRecommendedUsers } = await import("@/app/actions/recommendations/getRecommendedUsers")
    const recommended = await getRecommendedUsers(5)

    return (
        <div className="min-h-screen bg-zinc-950 text-white pt-24 px-4 md:px-8">
            <div className="max-w-[1920px] mx-auto space-y-12">

                {/* 1. Recommendations Section */}
                {recommended.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 px-1">
                            Recommended for You
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                            {recommended.map((artist: any) => (
                                <ArtistCard
                                    key={artist.id}
                                    profile={artist}
                                    isFollowing={false} // By definition
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Following Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                                <Users className="w-6 h-6 text-zinc-400" />
                                Your Artists
                            </h1>
                        </div>
                        <span className="text-xs text-zinc-600 font-mono">
                            {followedArtists.length} FOLLOWING
                        </span>
                    </div>

                    {followedArtists.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {followedArtists.map((artist: any) => (
                                <ArtistCard
                                    key={artist.id}
                                    profile={artist}
                                    isFollowing={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-500 border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                            <UserMinus className="w-12 h-12 mb-4 text-zinc-600" />
                            <h3 className="text-lg font-medium text-white mb-2">You are not following anyone yet</h3>
                            <p className="text-sm max-w-sm text-center">
                                Follow the recommended artists above or browse the gallery to get started.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
