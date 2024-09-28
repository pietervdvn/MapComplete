import ImageProvider, { ProvidedImage } from "./ImageProvider"

export default class GenericImageProvider extends ImageProvider {
    public defaultKeyPrefixes: string[] = ["image"]
    public readonly name = "Generic"

    public apiUrls(): string[] {
        return []
    }

    private readonly _valuePrefixBlacklist: string[]

    public constructor(valuePrefixBlacklist: string[]) {
        super()
        this._valuePrefixBlacklist = valuePrefixBlacklist
    }

    ExtractUrls(key: string, value: string): undefined | ProvidedImage[] {
        if (this._valuePrefixBlacklist.some((prefix) => value.startsWith(prefix))) {
            return undefined
        }

        try {
            new URL(value)
        } catch (_) {
            // Not a valid URL
            return undefined
        }

        return [{
            key: key,
            url: value,
            provider: this,
            id: value,
        }]
    }

    SourceIcon() {
        return undefined
    }

    public DownloadAttribution(_) {
        return undefined
    }
}
