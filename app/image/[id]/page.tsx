
import { createClient } from "@/utils/supabase/server"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ImageDetailsPanel } from "@/components/gallery/ImageDetailsPanel"
import { getTagsByImage } from "@/app/actions/tags"

export default async function ImagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: image, error } = await supabase
        .from("images")
        .select("*, profiles(*)")
        .eq("id", id)
        .single()

    if (error || !image) {
        console.error("Error fetching image:", error)
        return notFound()
    }

    let isSaved = false
    if (user) {
        const { data: save } = await supabase
            .from('saves')
            .select('*')
            .eq('user_id', user.id)
            .eq('image_id', id)
            .single()
        isSaved = !!save
        isSaved = !!save
    }

    const { tags } = await getTagsByImage(id)

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col items-center">
            {/* Back Nav */}
            <div className="w-full max-w-7xl mb-4">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Gallery
                </Link>
            </div>

            <div className="bg-card rounded-3xl overflow-hidden shadow-2xl max-w-7xl w-full flex flex-col md:flex-row min-h-[80vh]">

                {/* Image Section */}
                <div className="md:w-3/4 bg-black flex items-center justify-center p-4">
                    <div className="relative w-full h-[70vh] md:h-[80vh]">
                        <Image
                            src={image.url}
                            alt={image.title}
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <ImageDetailsPanel image={image as any} currentUser={user} isSaved={isSaved} tags={tags} />
            </div>
        </div>
    )
}
