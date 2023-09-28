export interface ImageUploader {
    maxFileSizeInMegabytes?: number
    /**
     * Uploads the 'blob' as image, with some metadata.
     * Returns the URL to be linked + the appropriate key to add this to OSM
     * @param title
     * @param description
     * @param blob
     */
    uploadImage(
        title: string,
        description: string,
        blob: File
    ): Promise<{ key: string; value: string }>
}
