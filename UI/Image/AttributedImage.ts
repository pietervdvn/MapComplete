import Combine from "../Base/Combine";
import Attribution from "./Attribution";
import Img from "../Base/Img";
import {ProvidedImage} from "../../Logic/ImageProviders/ImageProvider";
import BaseUIElement from "../BaseUIElement";


export class AttributedImage extends Combine {

    constructor(imageInfo: ProvidedImage) {
        let img: BaseUIElement;
        let attr: BaseUIElement
        img = new Img(imageInfo.url);
        attr = new Attribution(imageInfo.provider.GetAttributionFor(imageInfo.url),
                imageInfo.provider.SourceIcon(),
        )


        super([img, attr]);
        this.SetClass('block relative h-full');
    }


}