export interface ImageUploader {
    maxFileSizeInMegabytes?: number
    /**
     * Uploads the 'blob' as image, with some metadata.
     * Returns the URL to be linked + the appropriate key to add this to OSM
     */
    uploadImage(
        blob: File,
        currentGps: [number,number],
        author: string
    ): Promise<{ key: string; value: string, absoluteUrl: string }>
}
