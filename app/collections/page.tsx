import { createClient } from "@/utils/supabase/server"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function CollectionsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    const { data: collections, error } = await supabase
        .from('collections')
        .select(`
            *,
            collection_images (count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Hero Section */}
            <section className="relative pt-20 pb-12 md:pt-32 md:pb-20 overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Your <span className="text-indigo-600 dark:text-indigo-400">Collections</span>
                        </h1>
                        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            Organize your inspiration. Group references by theme, project, or mood.
                        </p>
                    </div>
                </div>

                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-30 dark:opacity-20">
                    <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl transform -translate-y-1/2"></div>
                </div>
            </section>

            <div className="container mx-auto px-4 md:px-8 pb-20">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                    <h2 className="text-2xl font-semibold tracking-tight">All Collections</h2>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {collections?.length || 0} ITEMS
                    </span>
                </div>

                {collections && collections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map((collection: any) => (
                            <Link
                                key={collection.id}
                                href={`/collections/${collection.id}`}
                                className="group block h-full"
                            >
                                <div className="h-full p-6 rounded-2xl bg-card border border-border hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden">
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                                            </div>
                                            <span className="text-xs font-semibold bg-muted text-muted-foreground px-3 py-1 rounded-full">
                                                {collection.collection_images?.[0]?.count || 0} images
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {collection.name}
                                        </h3>

                                        <div className="mt-auto pt-4 flex items-center text-sm text-muted-foreground">
                                            <span>Created {new Date(collection.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {/* Hover Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-muted rounded-3xl bg-muted/20">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 text-muted-foreground">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Create your first collection by saving an image from the gallery.
                        </p>
                        <Link href="/">
                            <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-colors shadow-lg shadow-indigo-500/20">
                                Browse Gallery
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
