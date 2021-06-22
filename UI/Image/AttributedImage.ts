import Combine from "../Base/Combine";
import Attribution from "./Attribution";
import Img from "../Base/Img";
import ImageAttributionSource from "../../Logic/ImageProviders/ImageAttributionSource";


export class AttributedImage extends Combine {

    constructor(urlSource: string, imgSource: ImageAttributionSource) {
        urlSource = imgSource.PrepareUrl(urlSource)
        super([
            new Img( urlSource),
            new Attribution(imgSource.GetAttributionFor(urlSource), imgSource.SourceIcon())
        ]);
        this.SetClass('block relative h-full');
    }


}