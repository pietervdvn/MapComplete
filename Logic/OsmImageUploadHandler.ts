/**
 * Helps in uplaoding, by generating the rigth title, decription and by adding the tag to the changeset
 */
import {UIEventSource} from "../UI/UIEventSource";
import {ImageUploadFlow} from "../UI/ImageUploadFlow";
import {Changes} from "./Changes";
import {UserDetails} from "./OsmConnection";
import {SlideShow} from "../UI/SlideShow";

export class OsmImageUploadHandler {
    private _tags: UIEventSource<any>;
    private _changeHandler: Changes;
    private _userdetails: UIEventSource<UserDetails>;
    private _slideShow: SlideShow;
    private _preferedLicense: UIEventSource<string>;

    constructor(tags: UIEventSource<any>,
                userdetails: UIEventSource<UserDetails>,
                preferedLicense: UIEventSource<string>,
                changeHandler: Changes,
                slideShow : SlideShow
    ) {
        this._slideShow = slideShow; // To move the slideshow (if any) to the last, just added element
        if (tags === undefined || userdetails === undefined || changeHandler === undefined) {
            throw "Something is undefined"
        }
        this._tags = tags;
        this._changeHandler = changeHandler;
        this._userdetails = userdetails;
        this._preferedLicense = preferedLicense;
    }

    private generateOptions(license: string) {
        const tags = this._tags.data;
        const self = this;

        const title = tags.name ?? "Unknown area";
        const description = [
            "author:" + this._userdetails.data.name,
            "license:" + license,
            "wikidata:" + tags.wikidata,
            "osmid:" + tags.id,
            "name:" + tags.name
        ].join("\n");

        const changes = this._changeHandler;
        return {
            title: title,
            description: description,
            handleURL: function (url) {

                let key = "image";
                if (tags["image"] !== undefined) {

                    let freeIndex = 0;
                    while (tags["image:" + freeIndex] !== undefined) {
                        freeIndex++;
                    }
                    key = "image:" + freeIndex;
                }
                console.log("Adding image:" + key, url);
                changes.addChange(tags.id, key, url);
                self._slideShow.MoveTo(-1); // set the last (thus newly added) image) to view
            },
            allDone: function () {
                changes.uploadAll(function () {
                    console.log("Writing changes...")
                });
            }
        }
    }

    getUI(): ImageUploadFlow {
        const self = this;
        return new ImageUploadFlow(
            this._userdetails,
            this._preferedLicense,
            function (license) {
                return self.generateOptions(license)
            }
        );
    }


}