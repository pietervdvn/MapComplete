import {UIEventSource} from "../UIEventSource";
import {Imgur} from "./Imgur";

export default class ImgurUploader {

    public readonly queue: UIEventSource<string[]> = new UIEventSource<string[]>([]);
    public readonly failed: UIEventSource<string[]> = new UIEventSource<string[]>([]);
    public readonly success: UIEventSource<string[]> = new UIEventSource<string[]>([]);
    private readonly _handleSuccessUrl: (string) => void;

    constructor(handleSuccessUrl: (string) => void) {
        this._handleSuccessUrl = handleSuccessUrl;
    }

    public uploadMany(title: string, description: string, files: FileList) {
        for (let i = 0; i < files.length; i++) {
            this.queue.data.push(files.item(i).name)
        }
        this.queue.ping()

        const self = this;
        this.queue.setData([...self.queue.data])
        Imgur.uploadMultiple(title,
            description,
            files,
            function (url) {
                console.log("File saved at", url);
                self.success.setData([...self.success.data, url]);
                self._handleSuccessUrl(url);
            },
            function () {
                console.log("All uploads completed");
            },

            function (failReason) {
                console.log("Upload failed due to ", failReason)
                self.failed.setData([...self.failed.data, failReason])
            }
        );
    }
}