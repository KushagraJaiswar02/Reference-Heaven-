export function getOptimizedImageUrl(url: string, width: number, quality: number = 80): string {
    if (!url) return "";

    // If it's a Supabase Storage URL
    if (url.includes("supabase.co/storage")) {
        // Append transformation params
        // Check if query params exist
        const separator = url.includes("?") ? "&" : "?";
        return `${url}${separator}width=${width}&quality=${quality}&resize=contain`;
    }

    // Pass-through for external URLs (or add other CDN logic here)
    return url;
}

export function getGridThumbnailUrl(url: string): string {
    // Grid Rule: <100KB, width ~500px (retina ready for 250px columns)
    // Aggressive compression
    return getOptimizedImageUrl(url, 500, 60);
}

export function getDetailImageUrl(url: string): string {
    // Detail Rule: Medium size, good quality
    return getOptimizedImageUrl(url, 1200, 85);
}
