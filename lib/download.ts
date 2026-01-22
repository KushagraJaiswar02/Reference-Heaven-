
/**
 * Triggers a browser download for the given URL.
 * Uses a server-side proxy to bypass CORS and force download via Content-Disposition.
 */
export function downloadImage(url: string, filename: string) {
    // Construct the proxy URL
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;

    // Create detailed anchor to force download behavior
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
