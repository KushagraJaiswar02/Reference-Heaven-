import { MasonryGrid } from "@/components/gallery/MasonryGrid"
import { getFeedImages } from "@/app/data/image"

export default async function Home() {
  const images = await getFeedImages()

  return (
    <div className="container mx-auto py-8">
      <MasonryGrid images={images || []} />
    </div>
  )
}
