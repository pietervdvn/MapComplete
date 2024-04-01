import ImageProvider, { ProvidedImage } from "./ImageProvider"

export default class GenericImageProvider extends ImageProvider {
    public defaultKeyPrefixes: string[] = ["image"]

    public apiUrls(): string[] {
        return []
    }

    private readonly _valuePrefixBlacklist: string[]

    public constructor(valuePrefixBlacklist: string[]) {
        super()
        this._valuePrefixBlacklist = valuePrefixBlacklist
    }

    async ExtractUrls(key: string, value: string): Promise<Promise<ProvidedImage>[]> {
        if (this._valuePrefixBlacklist.some((prefix) => value.startsWith(prefix))) {
            return []
        }

        try {
            new URL(value)
        } catch (_) {
            // Not a valid URL
            return []
        }

        return [
            Promise.resolve({
                key: key,
                url: value,
                provider: this,
                id: value,
            }),
        ]
    }

    SourceIcon() {
        return undefined
    }

    public DownloadAttribution(_) {
        return undefined
    }
}
