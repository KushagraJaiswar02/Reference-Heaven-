import { InfiniteFeed } from "@/components/gallery/InfiniteFeed"
import { getPaginatedFeed } from "@/app/actions/getPaginatedFeed"

export const revalidate = 60 // ISR: Cache for 60 seconds

export default async function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Reference Heaven',
    url: 'https://reference-heaven.vercel.app', // Update with actual URL if known, or relative
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://reference-heaven.vercel.app/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    description: 'High-end image gallery for artists studying anatomy, lighting, and composition.'
  }
  // Initial SSR fetch (Cursor is undefined for first page)
  const { items, nextCursor } = await getPaginatedFeed(undefined, 20)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.1]">
              The Ultimate <br className="hidden md:block" />
              <span className="text-indigo-600 dark:text-indigo-500">Reference Library</span> for Artists
            </h1>
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
              Curated, high-resolution imagery for studying anatomy, lighting, and composition.
              No AI junk—just pure, authentic reference.
            </p>
          </div>
        </div>

        {/* Background Gradients - Subtle for Light Mode */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none opacity-40 dark:opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl transform -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl transform translate-y-1/2"></div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Trending Now</h2>
          <div className="h-[1px] flex-1 bg-border ml-6 hidden md:block"></div>
        </div>

        <InfiniteFeed
          initialItems={items || []}
          initialNextCursor={nextCursor}
        />
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}
