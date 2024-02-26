import { IdbLocalStorage } from "../../Web/IdbLocalStorage"
import { UIEventSource } from "../../UIEventSource"
import { Tiles } from "../../../Models/TileRange"

/**
 * A class which allows to read/write a tile to local storage.
 *
 * Does the heavy lifting for LocalStorageFeatureSource and SaveFeatureToLocalStorage.
 *
 * Note: OSM-features with a negative id are ignored
 */
export default class TileLocalStorage<T> {
    private static perLayer: Record<string, TileLocalStorage<any>> = {}
    private static readonly useIndexedDb = typeof indexedDB !== "undefined"
    private readonly _layername: string
    private readonly inUse = new UIEventSource(false)
    private readonly cachedSources: Record<number, UIEventSource<T> & { flush: () => void }> = {}
    private readonly _maxAgeSeconds: number

    private constructor(layername: string, maxAgeSeconds: number) {
        this._layername = layername
        this._maxAgeSeconds = maxAgeSeconds
    }

    public static construct<T>(
        backend: string,
        layername: string,
        maxAgeS: number
    ): TileLocalStorage<T> {
        const key = backend + "_" + layername
        const cached = TileLocalStorage.perLayer[key]
        if (cached) {
            return cached
        }

        const tls = new TileLocalStorage<T>(key, maxAgeS)
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
        if (!TileLocalStorage.useIndexedDb) {
            return
        }
        try {
            await this.inUse.AsPromise((inUse) => !inUse)
            this.inUse.setData(true)
            await IdbLocalStorage.SetDirectly(this._layername + "_" + tileIndex, data)
            await IdbLocalStorage.SetDirectly(
                this._layername + "_" + tileIndex + "_date",
                Date.now()
            )

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

    private async GetIdb(tileIndex: number): Promise<any> {
        if (!TileLocalStorage.useIndexedDb) {
            return undefined
        }
        const date = <any>(
            await IdbLocalStorage.GetDirectly(this._layername + "_" + tileIndex + "_date")
        )
        const maxAge = this._maxAgeSeconds
        const timeDiff = (Date.now() - date) / 1000
        if (timeDiff >= maxAge) {
            console.debug(
                "Dropping cache for",
                this._layername,
                tileIndex,
                "out of date. Max allowed age is",
                maxAge,
                "current age is",
                timeDiff
            )
            await IdbLocalStorage.SetDirectly(this._layername + "_" + tileIndex, undefined)

            return undefined
        }
        const data = await IdbLocalStorage.GetDirectly(this._layername + "_" + tileIndex)
        return <any>data
    }

    public invalidate(tileIndex: number) {
        console.log("Invalidated tile", tileIndex)
        this.getTileSource(tileIndex).setData(undefined)
    }
}
