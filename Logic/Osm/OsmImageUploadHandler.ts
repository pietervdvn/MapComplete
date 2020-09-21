/**
 * Helps in uplaoding, by generating the rigth title, decription and by adding the tag to the changeset
 */
import {UIEventSource} from "../UIEventSource";
import {ImageUploadFlow} from "../../UI/ImageUploadFlow";
import {SlideShow} from "../../UI/SlideShow";
import {State} from "../../State";
import {Tag} from "../Tags";

export class OsmImageUploadHandler {
    private readonly _tags: UIEventSource<any>;
    private readonly _slideShow: SlideShow;
    private readonly _preferedLicense: UIEventSource<string>;

    constructor(tags: UIEventSource<any>,
                preferedLicense: UIEventSource<string>,
                slideShow : SlideShow
    ) {
        this._slideShow = slideShow; // To move the slideshow (if any) to the last, just added element
        this._tags = tags;
        this._preferedLicense = preferedLicense;
    }

    private generateOptions(license: string) {
        const tags = this._tags.data;
        const self = this;
        license = license ?? "CC0"
        const title = tags.name ?? "Unknown area";
        const description = [
            "author:" + State.state.osmConnection.userDetails.data.name,
            "license:" + license,
            "wikidata:" + tags.wikidata,
            "osmid:" + tags.id,
            "name:" + tags.name
        ].join("\n");

        const changes = State.state.changes;
        return {
            title: title,
            description: description,
            handleURL: (url) => {

                let key = "image";
                if (tags["image"] !== undefined) {

                    let freeIndex = 0;
                    while (tags["image:" + freeIndex] !== undefined) {
                        freeIndex++;
                    }
                    key = "image:" + freeIndex;
                }
                console.log("Adding image:" + key, url);
                changes.addTag(tags.id, new Tag(key, url));
                self._slideShow.MoveTo(-1); // set the last (thus newly added) image) to view
            },
            allDone: () => {
            }
        }
    }

    getUI(): ImageUploadFlow {
        const self = this;
        return new ImageUploadFlow(
            this._preferedLicense,
            function (license) {
                return self.generateOptions(license)
            }
        );
    }


}