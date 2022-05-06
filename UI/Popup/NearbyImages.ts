import Combine from "../Base/Combine";
import {UIEventSource} from "../../Logic/UIEventSource";
import {SlideShow} from "../Image/SlideShow";
import Toggle from "../Input/Toggle";
import Loading from "../Base/Loading";
import {AttributedImage} from "../Image/AttributedImage";
import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders";
import Svg from "../../Svg";
import BaseUIElement from "../BaseUIElement";
import {InputElement} from "../Input/InputElement";
import {VariableUiElement} from "../Base/VariableUIElement";
import Translations from "../i18n/Translations";
import {Mapillary} from "../../Logic/ImageProviders/Mapillary";

export interface P4CPicture {
    pictureUrl: string,
    date: number,
    coordinates: { lat: number, lng: number },
    provider: "Mapillary" | string,
    author,
    license,
    detailsUrl: string,
    direction,
    osmTags: object /*To copy straight into OSM!*/
    ,
    thumbUrl: string,
    details: {
        isSpherical: boolean,
    }
}


interface NearbyImageOptions {
    lon: number,
    lat: number,
    radius: number,
    maxDaysOld?: 1095,
    blacklist: UIEventSource<{url: string}[]>
}

export default class NearbyImages extends VariableUiElement {

    constructor(options: NearbyImageOptions) {
        const t = Translations.t.image.nearbyPictures
        const P4C = require("../../vendor/P4C.min")
        const picManager = new P4C.PicturesManager({});

        const loadedPictures = UIEventSource.FromPromise<P4CPicture[]>(
            picManager.startPicsRetrievalAround(new P4C.LatLng(options.lat, options.lon), options.radius, {
                mindate: new Date().getTime() - (options.maxDaysOld ?? 1095) * 24 * 60 * 60 * 1000
            })
        ).map(images => {
            console.log("Images are" ,images, "blacklisted is", options.blacklist.data)
            images?.sort((a, b) => b.date - a.date)
            return images ?.filter(i => !(options.blacklist?.data?.some(blacklisted => 
                    Mapillary.sameUrl(i.pictureUrl, blacklisted.url)))
                && i.details.isSpherical === false);
        }, [options.blacklist])

        super(loadedPictures.map(images => {
            if(images === undefined){
              return  new Loading(t.loading);
            }
            if(images.length === 0){
                return t.nothingFound.SetClass("alert block")
            }
            return new SlideShow(loadedPictures.map(imgs => (imgs ?? []).slice(0, 25).map(i => this.prepareElement(i))))
        }));
               
    }

    protected prepareElement(info: P4CPicture): BaseUIElement {
        const provider = AllImageProviders.byName(info.provider);
        return new AttributedImage({url: info.pictureUrl, provider})
    }

    private asAttributedImage(info: P4CPicture): AttributedImage {
        const provider = AllImageProviders.byName(info.provider);
        return new AttributedImage({url: info.thumbUrl, provider, date: new Date(info.date)})
    }
    
    protected asToggle(info:P4CPicture): Toggle {
        const imgNonSelected = this.asAttributedImage(info);
        const imageSelected = this.asAttributedImage(info);

        const nonSelected = new Combine([imgNonSelected]).SetClass("relative block")
        const hoveringCheckmark =
            new Combine([Svg.confirm_svg().SetClass("block w-24 h-24 -ml-12 -mt-12")]).SetClass("absolute left-1/2 top-1/2 w-0")
        const selected = new Combine([
            imageSelected,
            hoveringCheckmark,
        ]).SetClass("relative block")

        return new Toggle(selected, nonSelected).SetClass("").ToggleOnClick();

    }

}

export class SelectOneNearbyImage extends NearbyImages implements InputElement<P4CPicture> {
    private readonly value: UIEventSource<P4CPicture>;

    constructor(options: NearbyImageOptions & {value?: UIEventSource<P4CPicture>}) {
        super(options)
        this.value = options.value ?? new UIEventSource<P4CPicture>(undefined);
    }

    GetValue(): UIEventSource<P4CPicture> {
        return this.value;
    }

    IsValid(t: P4CPicture): boolean {
        return false;
    }

    protected prepareElement(info: P4CPicture): BaseUIElement {
        const toggle = super.asToggle(info)
        toggle.isEnabled.addCallback(enabled => {
            if (enabled) {
                this.value.setData(info)
            }
        })

        this.value.addCallback(inf => {
            if(inf !== info){
                toggle.isEnabled.setData(false)
            }
        })

        return toggle
    }

}
