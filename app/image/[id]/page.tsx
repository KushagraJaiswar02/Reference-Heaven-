
import { createClient } from "@/utils/supabase/server"
import Image from "next/image"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Heart, Share2, Info, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ImagePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: image, error } = await supabase
        .from("images")
        .select("*, profiles(*)")
        .eq("id", id)
        .single()

    if (error || !image) {
        console.error("Error fetching image:", error)
        return notFound()
    }

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

                {/* Details Section */}
                <div className="md:w-1/4 p-6 md:p-8 flex flex-col bg-card border-l border-border/50">
                    <div className="flex items-center justify-end gap-2 mb-8">
                        <Button variant="ghost" size="icon" className="rounded-full"><Share2 className="w-5 h-5" /></Button>
                        <Button variant="secondary" className="rounded-full font-semibold bg-red-600 hover:bg-red-700 text-white">Save</Button>
                    </div>

                    <h1 className="text-3xl font-bold mb-4">{image.title}</h1>
                    {image.description && (
                        <p className="text-muted-foreground mb-8 leading-relaxed">{image.description}</p>
                    )}


                    <div className="mb-8">
                        <div className="flex items-center gap-3 p-3 bg-secondary/10 rounded-xl">
                            <Avatar className="w-10 h-10 border border-border">
                                <AvatarImage src={image.profiles?.avatar_url} />
                                <AvatarFallback>{image.profiles?.username?.charAt(0) || '?'}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">{image.profiles?.username || 'Unknown Artist'}</p>
                                <p className="text-xs text-muted-foreground">Author</p>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Tags */}
                    <div className="space-y-6">
                        {(image.topic || image.lighting_style || image.perspective_angle) && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</h3>
                                <div className="flex flex-wrap gap-2">
                                    {image.topic && <span className="bg-secondary px-3 py-1 rounded-full text-xs font-medium">{image.topic}</span>}
                                    {image.lighting_style && <span className="bg-secondary px-3 py-1 rounded-full text-xs font-medium">{image.lighting_style}</span>}
                                    {image.perspective_angle && <span className="bg-secondary px-3 py-1 rounded-full text-xs font-medium">{image.perspective_angle}</span>}
                                </div>
                            </div>
                        )}

                        {image.color_palette && image.color_palette.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Palette</h3>
                                <div className="flex flex-wrap gap-2">
                                    {image.color_palette.map((color: string, i: number) => (
                                        <div key={i} className="group relative">
                                            <div className="w-8 h-8 rounded-full border border-white/10 shadow-sm cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: color }} />
                                            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] bg-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">{color}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
