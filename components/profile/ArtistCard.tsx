import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FollowButton } from "@/components/profile/FollowButton"

interface ArtistCardProps {
    profile: {
        id: string
        username: string
        avatar_url: string
        bio?: string
    }
    isFollowing: boolean
}

export function ArtistCard({ profile, isFollowing }: ArtistCardProps) {
    return (
        <div className="flex flex-col items-center p-6 bg-zinc-900/50 border border-white/5 rounded-2xl hover:bg-zinc-900 transition-all group">
            <Link href={`/profile/${profile.username}`} className="flex flex-col items-center gap-4 mb-4 w-full">
                <Avatar className="w-20 h-20 border-2 border-transparent group-hover:border-indigo-500/50 transition-all">
                    <AvatarImage src={profile.avatar_url} className="object-cover" />
                    <AvatarFallback className="bg-zinc-800 text-xl">{profile.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center">
                    <h3 className="font-semibold text-white truncate max-w-[200px]">{profile.username}</h3>
                    {profile.bio && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 max-w-[200px] text-center h-8">
                            {profile.bio}
                        </p>
                    )}
                </div>
            </Link>

            <FollowButton
                authorId={profile.id}
                authorName={profile.username}
                initialIsFollowing={isFollowing}
                className="w-full rounded-full h-8 text-xs font-medium"
            />
        </div>
    )
}
