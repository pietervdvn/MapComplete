import { IdbLocalStorage } from "../../Web/IdbLocalStorage"
import { UIEventSource } from "../../UIEventSource"

/**
 * A class which allows to read/write a tile to local storage.
 *
 * Does the heavy lifting for LocalStorageFeatureSource and SaveFeatureToLocalStorage
 */
export default class TileLocalStorage<T> {
    private static perLayer: Record<string, TileLocalStorage<any>> = {}
    private readonly _layername: string
    private readonly cachedSources: Record<number, UIEventSource<T>> = {}

    private constructor(layername: string) {
        this._layername = layername
    }

    public static construct<T>(layername: string): TileLocalStorage<T> {
        const cached = TileLocalStorage.perLayer[layername]
        if (cached) {
            return cached
        }

        const tls = new TileLocalStorage<T>(layername)
        TileLocalStorage.perLayer[layername] = tls
        return tls
    }

    /**
     * Constructs a UIEventSource element which is synced with localStorage
     * @param layername
     * @param tileIndex
     */
    public getTileSource(tileIndex: number): UIEventSource<T> {
        const cached = this.cachedSources[tileIndex]
        if (cached) {
            return cached
        }
        const src = UIEventSource.FromPromise(this.GetIdb(tileIndex))
        src.addCallbackD((data) => this.SetIdb(tileIndex, data))
        this.cachedSources[tileIndex] = src
        return src
    }

    private SetIdb(tileIndex: number, data): void {
        try {
            IdbLocalStorage.SetDirectly(this._layername + "_" + tileIndex, data)
        } catch (e) {
            console.error(
                "Could not save tile to indexed-db: ",
                e,
                "tileIndex is:",
                tileIndex,
                "for layer",
                this._layername
            )
        }
    }

    private GetIdb(tileIndex: number): Promise<any> {
        return IdbLocalStorage.GetDirectly(this._layername + "_" + tileIndex)
    }
}
