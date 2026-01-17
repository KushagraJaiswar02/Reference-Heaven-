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
        <div className="min-h-screen bg-zinc-950 text-white pt-24 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                    <h1 className="text-2xl font-bold tracking-tight text-white">Your Collections</h1>
                    <span className="text-xs text-zinc-600 font-mono">
                        {collections?.length || 0} COLLECTIONS
                    </span>
                </div>

                {collections && collections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {collections.map((collection: any) => (
                            <Link
                                key={collection.id}
                                href={`/collections/${collection.id}`}
                                className="block p-6 rounded-xl bg-zinc-900 border border-white/5 hover:border-white/10 hover:bg-zinc-800/50 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold group-hover:text-indigo-400 transition-colors">{collection.name}</h3>
                                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full group-hover:bg-zinc-700 group-hover:text-zinc-300 transition-colors">
                                        {collection.collection_images?.[0]?.count || 0} items
                                    </span>
                                </div>
                                <p className="text-zinc-500 text-sm">
                                    Created {new Date(collection.created_at).toLocaleDateString()}
                                </p>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center text-zinc-500 bg-zinc-900/20 rounded-xl border border-white/5">
                        <p className="text-lg mb-2">No collections yet.</p>
                        <p className="text-sm">Create one by saving an image!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
