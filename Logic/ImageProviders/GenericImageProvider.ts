import ImageProvider, {ProvidedImage} from "./ImageProvider";

export default class GenericImageProvider extends ImageProvider {
    public defaultKeyPrefixes: string[] = ["image"];

    private readonly _valuePrefixBlacklist: string[];

    public constructor(valuePrefixBlacklist: string[]) {
        super();
        this._valuePrefixBlacklist = valuePrefixBlacklist;
    }


    protected DownloadAttribution(url: string) {
        return undefined
    }

    async ExtractUrls(key: string, value: string): Promise<Promise<ProvidedImage>[]> {

        if (this._valuePrefixBlacklist.some(prefix => value.startsWith(prefix))) {
            return []
        }
        
        try{
            new URL(value)
        }catch (_){
            // Not a valid URL
            return []
        }
        
        return [Promise.resolve({
            key: key,
            url: value,
            provider: this
        })]
    }

    SourceIcon(backlinkSource?: string) {
        return undefined;
    }


}