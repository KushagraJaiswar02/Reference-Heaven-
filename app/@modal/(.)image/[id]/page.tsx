import { ImageModalClient } from "@/components/gallery/ImageModalClient"

export default async function ImageModalPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { id } = await params
    const sp = await searchParams

    const thumb = sp.thumb as string | undefined
    const ar = sp.ar ? parseFloat(sp.ar as string) : undefined

    // NO BLOCKING DATA FETCH
    // We pass the "skeleton key" (id + thumb) to the client immediately.

    return (
        <ImageModalClient
            imageId={id}
            initialThumbnailUrl={thumb}
            initialAspectRatio={ar}
        />
    )
}
