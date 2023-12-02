import Combine from "../Base/Combine"
import Attribution from "./Attribution"
import Img from "../Base/Img"
import ImageProvider from "../../Logic/ImageProviders/ImageProvider"
import BaseUIElement from "../BaseUIElement"
import { Mapillary } from "../../Logic/ImageProviders/Mapillary"
import { UIEventSource } from "../../Logic/UIEventSource"
import { Feature } from "geojson"
import { GeoOperations } from "../../Logic/GeoOperations"

export class AttributedImage extends Combine {
    constructor(imageInfo: {
        id: string,
        url: string;
        provider?: ImageProvider;
        date?: Date
    }, feature?: Feature) {
        let img: BaseUIElement
        img = new Img(imageInfo.url, false, {
            fallbackImage:
                imageInfo.provider === Mapillary.singleton ? "./assets/svg/blocked.svg" : undefined,
        })

        let location: {
            lon: number,
            lat: number
        } = undefined
        if (feature) {

            const [lon, lat] = GeoOperations.centerpointCoordinates(feature)
            location = { lon, lat }
        }
        let attr: BaseUIElement = undefined
        if (imageInfo.provider !== undefined) {
            attr = new Attribution(
                UIEventSource.FromPromise(imageInfo.provider?.DownloadAttribution(imageInfo.url)),
                imageInfo.provider?.SourceIcon(imageInfo.id, location),
                imageInfo.date,
            )
        }

        super([img, attr])
        this.SetClass("block relative h-full")
    }
}
