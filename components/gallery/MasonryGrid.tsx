
import Image from "next/image"

const PLACEHOLDER_IMAGES = [
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1633511090164-b43840ea1607?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1621574539164-9d57a4a90403?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=60",
]

export function MasonryGrid() {
    return (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 space-y-4 p-4">
            {PLACEHOLDER_IMAGES.map((src, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg hover:opacity-90 transition-opacity cursor-pointer break-inside-avoid">
                    {/* Using standard img for simplicity in placeholder, or Next Image with defined width/height if we knew them. Unsplash URLs are variable. 
                For Masonry, we usually need aspect ratio or just let it flow. 
             */}
                    <img src={src} alt={`Reference ${i}`} className="w-full object-cover rounded-lg" loading="lazy" />
                </div>
            ))}
        </div>
    )
}
