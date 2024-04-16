export type EliCategory =
    | "photo"
    | "map"
    | "historicmap"
    | "osmbasedmap"
    | "historicphoto"
    | "qa"
    | "elevation"
    | "other"

/**
 * This class has grown beyond the point of only containing Raster Layers
 */
export interface RasterLayerProperties {
    /**
     * The name of the imagery source
     */
    readonly name: string | Record<string, string>

    readonly isOverlay?: boolean

    readonly id: string

    readonly url: string
    readonly category?: string | EliCategory
    readonly type?: "vector" | "raster" | string
    readonly style?: string

    readonly attribution?: {
        readonly url?: string
        readonly text?: string
        readonly html?: string
        readonly required?: boolean
    }

    readonly min_zoom?: number
    readonly max_zoom?: number

    readonly best?: boolean
}
