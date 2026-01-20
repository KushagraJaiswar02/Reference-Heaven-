'use server'

import { getPublicImageDetails, getUserImageContext } from "@/app/data/image"
import { ImageDetailDTO, UserImageContextDTO } from "@/app/data/dto"

// Combined fetcher for efficient network usage (1 request)
export async function getClientImageDetails(id: string): Promise<{
    publicData: ImageDetailDTO | null,
    userContext: UserImageContextDTO
}> {
    const [publicData, userContext] = await Promise.all([
        getPublicImageDetails(id),
        getUserImageContext(id)
    ])

    return { publicData, userContext }
}
