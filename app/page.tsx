import { MasonryGrid } from "@/components/gallery/MasonryGrid"
import { createClient } from "@/utils/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const { data: images } = await supabase
    .from('images')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <MasonryGrid images={images || []} />
    </div>
  )
}
