export type EliCategory =
    | "photo"
    | "map"
    | "historicmap"
    | "osmbasedmap"
    | "historicphoto"
    | "qa"
    | "elevation"
    | "other"
export interface RasterLayerProperties {
    /**
     * The name of the imagery source
     */
    readonly name: string | Record<string, string>

    readonly isOverlay?: boolean

    readonly id: string

    readonly url: string
    readonly category?: string | EliCategory

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
