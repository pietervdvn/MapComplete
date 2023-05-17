import { IdbLocalStorage } from "../../Web/IdbLocalStorage"
import { UIEventSource } from "../../UIEventSource"

/**
 * A class which allows to read/write a tile to local storage.
 *
 * Does the heavy lifting for LocalStorageFeatureSource and SaveFeatureToLocalStorage.
 *
 * Note: OSM-features with a negative id are ignored
 */
export default class TileLocalStorage<T> {
    private static perLayer: Record<string, TileLocalStorage<any>> = {}
    private readonly _layername: string
    private readonly inUse = new UIEventSource(false)
    private readonly cachedSources: Record<number, UIEventSource<T> & { flush: () => void }> = {}

    private static readonly useIndexedDb = typeof indexedDB !== "undefined"
    private constructor(layername: string) {
        this._layername = layername
    }

    public static construct<T>(backend: string, layername: string): TileLocalStorage<T> {
        const key = backend + "_" + layername
        const cached = TileLocalStorage.perLayer[key]
        if (cached) {
            return cached
        }

        const tls = new TileLocalStorage<T>(key)
        TileLocalStorage.perLayer[key] = tls
        return tls
    }

    /**
     * Constructs a UIEventSource element which is synced with localStorage.
     * Supports 'flush'
     */
    public getTileSource(tileIndex: number): UIEventSource<T> & { flush: () => void } {
        const cached = this.cachedSources[tileIndex]
        if (cached) {
            return cached
        }
        const src = <UIEventSource<T> & { flush: () => void }>(
            UIEventSource.FromPromise(this.GetIdb(tileIndex))
        )
        src.flush = () => this.SetIdb(tileIndex, src.data)
        src.addCallbackD((data) => this.SetIdb(tileIndex, data))
        this.cachedSources[tileIndex] = src
        return src
    }

    private async SetIdb(tileIndex: number, data: any): Promise<void> {
        if(!TileLocalStorage.useIndexedDb){
            return
        }
        try {
            await this.inUse.AsPromise((inUse) => !inUse)
            this.inUse.setData(true)
            await IdbLocalStorage.SetDirectly(this._layername + "_" + tileIndex, data)
            this.inUse.setData(false)
        } catch (e) {
            console.error(
                "Could not save tile to indexed-db: ",
                e,
                "tileIndex is:",
                tileIndex,
                "for layer",
                this._layername,
                "data is",
                data
            )
        }
    }

    private GetIdb(tileIndex: number): Promise<any> {
        if(!TileLocalStorage.useIndexedDb){
            return undefined
        }
        return IdbLocalStorage.GetDirectly(this._layername + "_" + tileIndex)
    }
}
