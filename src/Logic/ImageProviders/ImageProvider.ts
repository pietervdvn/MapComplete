import { Store, Stores, UIEventSource } from "../UIEventSource"
import BaseUIElement from "../../UI/BaseUIElement"
import { LicenseInfo } from "./LicenseInfo"
import { Utils } from "../../Utils"

export interface ProvidedImage {
    url: string
    url_hd?: string
    key: string
    provider: ImageProvider
    id: string
    date?: Date,
    status?: string | "ready"
    /**
     * Compass angle of the taken image
     * 0 = north, 90° = East
     */
    rotation?: number
    lat?: number,
    lon?: number,
    host?: string
}

export default abstract class ImageProvider {
    public abstract readonly defaultKeyPrefixes: string[]

    public abstract readonly name: string

    public abstract SourceIcon(img?: {id: string, url: string, host?: string}, location?: { lon: number; lat: number }): BaseUIElement


    /**
     * Gets all the relevant URLS for the given tags and for the given prefixes;
     * extracts the necessary information
     * @param tags
     * @param prefixes
     */
    public async getRelevantUrlsFor(tags: Record<string, string>, prefixes: string[]): Promise<ProvidedImage[]> {
        const relevantUrls: ProvidedImage[] = []
        const seenValues = new Set<string>()

        for (const key in tags) {
            if (!prefixes.some((prefix) => key === prefix || key.match(new RegExp(prefix+":[0-9]+")))) {
                continue
            }
            const values = Utils.NoEmpty(tags[key]?.split(";")?.map((v) => v.trim()) ?? [])
            for (const value of values) {
                if (seenValues.has(value)) {
                    continue
                }
                seenValues.add(value)
                let images = this.ExtractUrls(key, value)
                if(!Array.isArray(images)){
                    images = await  images
                }
                if(images){
                    relevantUrls.push(...images)
                }
            }
        }
        return relevantUrls
    }

    public getRelevantUrls(tags: Record<string, string>, prefixes: string[]): Store<ProvidedImage[]> {
        return Stores.FromPromise(this.getRelevantUrlsFor(tags, prefixes))
    }


    public abstract ExtractUrls(key: string, value: string): undefined | ProvidedImage[] | Promise<ProvidedImage[]>

    public abstract DownloadAttribution(providedImage: {
        url: string
        id: string
    }): Promise<LicenseInfo>

    public abstract apiUrls(): string[]
}
