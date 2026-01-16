
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { MasonryGrid } from "@/components/gallery/MasonryGrid"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Globe, Instagram, Twitter, Palette } from "lucide-react"
import { notFound } from "next/navigation"
import { ProfileSettings } from "@/components/profile/ProfileSettings"

interface Props {
    params: {
        username: string
    }
}

export default async function ProfilePage({ params }: Props) {
    const { username } = await params
    const supabase = await createClient()

    // 0. Get Current User for "Edit" correctness
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

    if (profileError || !profile) {
        notFound()
    }

    // 2. Fetch Images
    const { data: images, error: imagesError } = await supabase
        .from('images')
        .select(`
            *,
            profiles:artist_id (
                username,
                avatar_url
            )
        `)
        .eq('artist_id', profile.id)
        .order('created_at', { ascending: false })

    if (imagesError) {
        console.error("Error fetching images:", imagesError)
    }

    const totalUploads = images?.length || 0

    return (
        <div className="min-h-screen bg-zinc-950 text-white pt-24 px-4 md:px-8">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-16">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <Avatar className="w-32 h-32 border-4 border-zinc-900 shadow-2xl">
                        <AvatarImage src={profile.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-zinc-800 text-3xl font-bold text-zinc-500">
                            {profile.username[0]?.toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                                {profile.username}
                            </h1>
                            {profile.bio && (
                                <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed">
                                    {profile.bio}
                                </p>
                            )}

                            {/* Social Links */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                                {profile.website && (
                                    <a
                                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span className="text-sm">{new URL(profile.website.startsWith('http') ? profile.website : `https://${profile.website}`).hostname}</span>
                                    </a>
                                )}

                                {profile.socials?.instagram && (
                                    <a
                                        href={`https://instagram.com/${profile.socials.instagram.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-pink-500 hover:bg-white transition-all"
                                    >
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                )}

                                {profile.socials?.twitter && (
                                    <a
                                        href={`https://twitter.com/${profile.socials.twitter.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-blue-400 hover:bg-white transition-all"
                                    >
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                )}

                                {profile.socials?.artstation && (
                                    <a
                                        href={`https://artstation.com/${profile.socials.artstation}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-[#13aff0] hover:bg-white transition-all"
                                    >
                                        <Palette className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="flex items-center justify-center md:justify-start gap-8 border-y border-white/5 py-4 w-full md:w-fit px-8 bg-white/[0.02]">
                            <div className="text-center md:text-left">
                                <p className="text-2xl font-bold text-white">{totalUploads}</p>
                                <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Uploads</p>
                            </div>
                            <div className="w-[1px] h-8 bg-white/10"></div>
                            <div className="text-center md:text-left">
                                <p className="text-2xl font-bold text-white">0</p>
                                <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Followers</p>
                            </div>
                            <div className="w-[1px] h-8 bg-white/10"></div>
                            <div className="text-center md:text-left">
                                <p className="text-2xl font-bold text-white">0</p>
                                <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Following</p>
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-start">
                            {currentUser && currentUser.id === profile.id ? (
                                <ProfileSettings profile={profile} />
                            ) : (
                                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 font-bold">
                                    Follow
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Section */}
            <div className="max-w-[1920px] mx-auto">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-500">
                        Portfolio
                    </h2>
                    <span className="text-xs text-zinc-600 font-mono">
                        {images?.length} ITEMS
                    </span>
                </div>

                {images && images.length > 0 ? (
                    <MasonryGrid images={images} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                        <p className="text-lg">No work uploaded yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
