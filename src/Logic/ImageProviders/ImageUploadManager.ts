import { ImageUploader } from "./ImageUploader";
import LinkImageAction from "../Osm/Actions/LinkImageAction";
import FeaturePropertiesStore from "../FeatureSource/Actors/FeaturePropertiesStore";
import { OsmId, OsmTags } from "../../Models/OsmFeature";
import LayoutConfig from "../../Models/ThemeConfig/LayoutConfig";
import { Store, UIEventSource } from "../UIEventSource";
import { OsmConnection } from "../Osm/OsmConnection";
import { Changes } from "../Osm/Changes";
import Translations from "../../UI/i18n/Translations";


/**
 * The ImageUploadManager has a
 */
export class ImageUploadManager {

  private readonly _uploader: ImageUploader;
  private readonly _featureProperties: FeaturePropertiesStore;
  private readonly _layout: LayoutConfig;

  private readonly _uploadStarted: Map<string, UIEventSource<number>> = new Map();
  private readonly _uploadFinished: Map<string, UIEventSource<number>> = new Map();
  private readonly _uploadFailed: Map<string, UIEventSource<number>> = new Map();
  private readonly _uploadRetried: Map<string, UIEventSource<number>> = new Map();
  private readonly _uploadRetriedSuccess: Map<string, UIEventSource<number>> = new Map();
  private readonly _osmConnection: OsmConnection;
  private readonly _changes: Changes;

  constructor(layout: LayoutConfig, uploader: ImageUploader, featureProperties: FeaturePropertiesStore, osmConnection: OsmConnection, changes: Changes) {
    this._uploader = uploader;
    this._featureProperties = featureProperties;
    this._layout = layout;
    this._osmConnection = osmConnection;
    this._changes = changes;
  }

  /**
   * Gets various counters.
   * Note that counters can only increase
   * If a retry was a success, both 'retrySuccess' _and_ 'uploadFinished' will be increased
   * @param featureId: the id of the feature you want information for. '*' has a global counter
   */
  public getCountsFor(featureId: string | "*"): {
    retried: Store<number>;
    uploadStarted: Store<number>;
    retrySuccess: Store<number>;
    failed: Store<number>;
    uploadFinished: Store<number>
  } {
    return {
      uploadStarted: this.getCounterFor(this._uploadStarted, featureId),
      uploadFinished: this.getCounterFor(this._uploadFinished, featureId),
      retried: this.getCounterFor(this._uploadRetried, featureId),
      failed: this.getCounterFor(this._uploadFailed, featureId),
      retrySuccess: this.getCounterFor(this._uploadRetriedSuccess, featureId)

    };
  }

  /**
   * Uploads the given image, applies the correct title and license for the known user
   */
  public async uploadImageAndApply(file: File, tags: OsmTags) {

      const sizeInBytes = file.size
    const featureId = <OsmId> tags.id
      console.log(file.name + " has a size of " + sizeInBytes + " Bytes, attaching to", tags.id)
      const self = this
      if (sizeInBytes > this._uploader.maxFileSizeInMegabytes * 1000000) {
          this.increaseCountFor(this._uploadStarted, featureId)
          this.increaseCountFor(this._uploadFailed, featureId)
          throw(
            Translations.t.image.toBig.Subs({
                actual_size: Math.floor(sizeInBytes / 1000000) + "MB",
                max_size: self._uploader.maxFileSizeInMegabytes + "MB",
            }).txt
          )
      }


    const licenseStore = this._osmConnection?.GetPreference("pictures-license", "CC0");
    const license = licenseStore?.data ?? "CC0";

    const matchingLayer = this._layout?.getMatchingLayer(tags);

    const title =
      matchingLayer?.title?.GetRenderValue(tags)?.Subs(tags)?.textFor("en") ??
      tags.name ??
      "https//osm.org/" + tags.id;
    const description = [
      "author:" + this._osmConnection.userDetails.data.name,
      "license:" + license,
      "osmid:" + tags.id
    ].join("\n");

    console.log("Upload done, creating ")
    const action = await this.uploadImageWithLicense(featureId, title, description, file);
    await this._changes.applyAction(action);
  }

  private async uploadImageWithLicense(
    featureId: OsmId,
    title: string, description: string, blob: File
  ): Promise<LinkImageAction> {
    this.increaseCountFor(this._uploadStarted, featureId);
    const properties = this._featureProperties.getStore(featureId);
    let key: string;
    let value: string;
    try {
      ({ key, value } = await this._uploader.uploadImage(title, description, blob));
    } catch (e) {
      this.increaseCountFor(this._uploadRetried, featureId);
      console.error("Could not upload image, trying again:", e);
      try {

        ({ key, value } = await this._uploader.uploadImage(title, description, blob));
        this.increaseCountFor(this._uploadRetriedSuccess, featureId);
      } catch (e) {
        console.error("Could again not upload image due to", e);
        this.increaseCountFor(this._uploadFailed, featureId);
      }

    }
    console.log("Uploading done, creating action for", featureId)
    const action = new LinkImageAction(featureId, key, value, properties, {
      theme: this._layout.id,
      changeType: "add-image"
    });
    this.increaseCountFor(this._uploadFinished, featureId);
    return action;
  }

  private getCounterFor(collection: Map<string, UIEventSource<number>>, key: string | "*") {
    if (this._featureProperties.aliases.has(key)) {
      key = this._featureProperties.aliases.get(key);
    }
    if (!collection.has(key)) {
      collection.set(key, new UIEventSource<number>(0));
    }
    return collection.get(key);
  }

  private increaseCountFor(collection: Map<string, UIEventSource<number>>, key: string | "*") {
    const counter = this.getCounterFor(collection, key);
    counter.setData(counter.data + 1);
    const global = this.getCounterFor(collection, "*");
    global.setData(counter.data + 1);
  }

}
