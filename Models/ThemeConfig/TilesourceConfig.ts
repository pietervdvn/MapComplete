import TilesourceConfigJson from "./Json/TilesourceConfigJson";
import Translations from "../../UI/i18n/Translations";
import {Translation} from "../../UI/i18n/Translation";

export default class TilesourceConfig {
    public readonly source: string
    public readonly id: string
    public readonly isOverlay: boolean
    public readonly name: Translation
    public readonly minzoom: number
    public readonly maxzoom: number
    public readonly defaultState: boolean;

    constructor(config: TilesourceConfigJson, ctx: string = "") {
        this.id = config.id
        this.source = config.source;
        this.isOverlay = config.isOverlay ?? false;
        this.name = Translations.T(config.name)
        this.minzoom = config.minZoom ?? 0
        this.maxzoom = config.maxZoom ?? 999
        this.defaultState = config.defaultState ?? true;
        if(this.id === undefined){
            throw "An id is obligated"
        }
        if (this.minzoom > this.maxzoom) {
            throw "Invalid tilesourceConfig: minzoom should be smaller then maxzoom (at " + ctx + ")"
        }
        if (this.minzoom < 0) {
            throw "minzoom should be > 0 (at " + ctx + ")"
        }
        if (this.maxzoom < 0) {
            throw "maxzoom should be > 0 (at " + ctx + ")"
        }
        if (this.source.indexOf("{zoom}") >= 0) {
            throw "Invalid source url: use {z} instead of {zoom}  (at " + ctx + ".source)"
        }
        if(!this.defaultState && config.name === undefined){
            throw "Disabling an overlay without a name is not possible"
        }
    }

}