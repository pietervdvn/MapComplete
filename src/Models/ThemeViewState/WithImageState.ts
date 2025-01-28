import { ImageUploadManager } from "../../Logic/ImageProviders/ImageUploadManager"
import { Store, UIEventSource } from "../../Logic/UIEventSource"
import { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"
import { CombinedFetcher } from "../../Logic/Web/NearbyImagesSearch"
import ThemeConfig from "../ThemeConfig/ThemeConfig"
import { PanoramaxUploader } from "../../Logic/ImageProviders/Panoramax"
import Constants from "../Constants"
import Hash from "../../Logic/Web/Hash"
import ThemeViewStateHashActor from "../../Logic/Web/ThemeViewStateHashActor"
import PendingChangesUploader from "../../Logic/Actors/PendingChangesUploader"
import { WithGuiState } from "./WithGuiState"
import { SpecialVisualizationState } from "../../UI/SpecialVisualization"

export class WithImageState extends WithGuiState implements SpecialVisualizationState {
    readonly imageUploadManager: ImageUploadManager
    readonly previewedImage = new UIEventSource<ProvidedImage>(undefined)
    readonly nearbyImageSearcher: CombinedFetcher

    constructor(layout: ThemeConfig, mvtAvailableLayers: Store<Set<string>>) {
        super(layout, mvtAvailableLayers)
        this.imageUploadManager = new ImageUploadManager(
            layout,
            new PanoramaxUploader(
                Constants.panoramax.url,
                Constants.panoramax.token,
                this.featureSwitchIsTesting.map((t) =>
                    t ? Constants.panoramax.testsequence : Constants.panoramax.sequence
                )
            ),
            this.featureProperties,
            this.osmConnection,
            this.changes,
            this.geolocation.geolocationState.currentGPSLocation,
            this.indexedFeatures,
            this.reportError
        )
        const longAgo = new Date()
        longAgo.setTime(new Date().getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
        this.nearbyImageSearcher = new CombinedFetcher(50, longAgo, this.indexedFeatures)

        this.initActors()
        Hash.hash.addCallbackAndRunD((hash) => {
            if (hash === "current_view" || hash.match(/current_view_[0-9]+/)) {
                this.selectCurrentView()
            }
        })
    }

    /**
     * Setup various services for which no reference are needed
     */
    private initActors() {
        new ThemeViewStateHashActor({
            selectedElement: this.selectedElement,
            indexedFeatures: this.indexedFeatures,
            guistate: this.guistate,
        })
        new PendingChangesUploader(this.changes, this.selectedElement, this.imageUploadManager)
    }
}
