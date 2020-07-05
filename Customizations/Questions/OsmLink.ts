import {TagRenderingOptions} from "../TagRendering";
import {Img} from "../../UI/Img";
import {Tag} from "../../Logic/TagsFilter";


export class OsmLink extends TagRenderingOptions {

  

    static options = {
        freeform: {
            key: "id",
            template: "$$$",
            renderTemplate:
                "<span class='osmlink'><a href='https://osm.org/{id}' target='_blank'>" +
                Img.osmAbstractLogo +
                "</a></span>",
            placeholder: "",
        },
        mappings: [
            {k: new Tag("id", "node/-1"), txt: "<span class='alert'>Uploading</span>"}
        ]

    }

    constructor() {
        super(OsmLink.options);
    }


}