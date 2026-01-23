
import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { MasonryGrid } from "@/components/gallery/MasonryGrid"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Globe, Instagram, Twitter, Palette, Linkedin, Youtube } from "lucide-react"
import { notFound } from "next/navigation"
import { ProfileSettings } from "@/components/profile/ProfileSettings"
import { getUserTagSummary } from "@/app/actions/tagging/user"
import { YourTagsProfileSection } from "@/components/profile/YourTagsProfileSection"
import { getGridThumbnailUrl } from "@/lib/image-optim"
import { ImageCardDTO } from "@/app/data/dto"

interface Props {
    params: Promise<{
        username: string
    }>
}

const getSocialUrl = (input: string, platform: 'instagram' | 'twitter' | 'artstation' | 'linkedin' | 'youtube') => {
    if (!input) return ''
    // If it's already a URL, return it
    if (input.startsWith('http://') || input.startsWith('https://')) {
        return input
    }

    // Clean username
    const cleanInput = input.replace('@', '')

    switch (platform) {
        case 'instagram':
            return `https://instagram.com/${cleanInput}`
        case 'twitter':
            return `https://twitter.com/${cleanInput}`
        case 'artstation':
            return `https://artstation.com/${cleanInput}`
        case 'linkedin':
            return `https://linkedin.com/in/${cleanInput}`
        case 'youtube':
            return `https://youtube.com/@${cleanInput}`
        default:
            return input
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

    const isOwner = currentUser && currentUser.id === profile.id
    console.log("[ProfileDebug] CurrentUser:", currentUser?.id)
    console.log("[ProfileDebug] ProfileOwner:", profile.id)
    console.log("[ProfileDebug] IsOwner:", isOwner)

    // Fetch personal tags if owner
    const personalTags = isOwner ? await getUserTagSummary(currentUser.id) : []
    console.log("[ProfileDebug] PersonalTags Count:", personalTags.length)

    // 2. Fetch Portfolio (Uploads)
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

    // Transform to ImageCardDTO
    const feedImages: ImageCardDTO[] = (images || []).map((img) => ({
        id: img.id,
        url: img.url,
        thumbnailUrl: getGridThumbnailUrl(img.url),
        aspectRatio: (img.width && img.height) ? (img.width / img.height) : 1, // Fallback if 0/null
        title: img.title,
        author: {
            id: img.profiles?.id || 'unknown',
            username: img.profiles?.username || 'Unknown',
            avatar_url: img.profiles?.avatar_url || ''
        },
        stats: {
            likes_count: img.likes_count || 0
        }
    }))

    const totalUploads = feedImages.length || 0

    return (
        <div className="min-h-screen bg-background text-foreground pt-24 px-4 md:px-8">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-16">
                <div className="flex flex-col md:flex-row items-center md:items-start md:items-stretch gap-8">
                    {/* Avatar */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl flex-shrink-0 relative z-10">
                            <AvatarImage src={profile.avatar_url} className="object-cover" />
                            <AvatarFallback className="bg-muted text-3xl font-bold text-muted-foreground">
                                {profile.username[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center md:text-left space-y-6 flex flex-col">
                        <div className="space-y-4">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2">
                                    {profile.username}
                                </h1>
                                {profile.bio && (
                                    <p className="text-muted-foreground max-w-2xl text-lg leading-relaxed">
                                        {profile.bio}
                                    </p>
                                )}
                            </div>

                            {/* Social Links */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                {profile.website && (
                                    <a
                                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 hover:bg-muted rounded-full text-sm font-medium transition-colors text-foreground"
                                    >
                                        <Globe className="w-4 h-4" />
                                        <span>{new URL(profile.website.startsWith('http') ? profile.website : `https://${profile.website}`).hostname}</span>
                                    </a>
                                )}

                                {profile.socials?.instagram && (
                                    <a
                                        href={getSocialUrl(profile.socials.instagram, 'instagram')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 bg-muted/50 hover:bg-pink-500 hover:text-white rounded-full transition-all text-muted-foreground"
                                    >
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                )}

                                {profile.socials?.twitter && (
                                    <a
                                        href={getSocialUrl(profile.socials.twitter, 'twitter')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 bg-muted/50 hover:bg-blue-400 hover:text-white rounded-full transition-all text-muted-foreground"
                                    >
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                )}

                                {profile.socials?.artstation && (
                                    <a
                                        href={getSocialUrl(profile.socials.artstation, 'artstation')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 bg-muted/50 hover:bg-[#13aff0] hover:text-white rounded-full transition-all text-muted-foreground"
                                    >
                                        <Palette className="w-5 h-5" />
                                    </a>
                                )}

                                {profile.socials?.linkedin && (
                                    <a
                                        href={getSocialUrl(profile.socials.linkedin, 'linkedin')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 bg-muted/50 hover:bg-[#0077b5] hover:text-white rounded-full transition-all text-muted-foreground"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                    </a>
                                )}

                                {profile.socials?.youtube && (
                                    <a
                                        href={getSocialUrl(profile.socials.youtube, 'youtube')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2.5 bg-muted/50 hover:bg-[#FF0000] hover:text-white rounded-full transition-all text-muted-foreground"
                                    >
                                        <Youtube className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="flex items-center justify-center md:justify-start gap-8 border-y border-border py-6 w-full md:w-fit px-8">
                            <div className="text-center md:text-left">
                                <p className="text-3xl font-bold text-foreground">{totalUploads}</p>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">Uploads</p>
                            </div>
                            <div className="w-[1px] h-8 bg-border"></div>
                            <div className="text-center md:text-left">
                                <p className="text-3xl font-bold text-foreground">0</p>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">Followers</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start mt-auto pt-4">
                            {isOwner ? (
                                <>
                                    <ProfileSettings profile={profile} />
                                    <Link href="/saved">
                                        <Button variant="outline" className="rounded-full px-6 h-10 border-border bg-background hover:bg-muted font-medium">
                                            Saved References
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-10 font-bold shadow-lg shadow-foreground/20">
                                    Follow
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Personal Tags (Owner Only) */}
                    {isOwner && (
                        <div className="hidden xl:block w-80 flex-shrink-0">
                            <YourTagsProfileSection tags={personalTags} />
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery Section */}
            <div className="container mx-auto pb-20">
                <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
                    <h2 className="text-lg font-semibold tracking-tight">
                        Portfolio
                    </h2>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {images?.length || 0} ITEMS
                    </span>
                </div>

                {feedImages && feedImages.length > 0 ? (
                    <MasonryGrid images={feedImages} />
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-muted rounded-3xl bg-muted/20">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No work uploaded yet</h3>
                        {isOwner ? (
                            <p className="text-muted-foreground mb-6 max-w-sm">
                                Share your first reference image with the community.
                            </p>
                        ) : (
                            <p className="text-muted-foreground">
                                This user hasn't uploaded any work yet.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
