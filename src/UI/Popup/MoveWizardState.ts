import { UIEventSource } from "../../Logic/UIEventSource"
import Translations from "../i18n/Translations"
import { Translation } from "../i18n/Translation"
import BaseUIElement from "../BaseUIElement"
import ChangeLocationAction from "../../Logic/Osm/Actions/ChangeLocationAction"
import MoveConfig from "../../Models/ThemeConfig/MoveConfig"
import ChangeTagAction from "../../Logic/Osm/Actions/ChangeTagAction"
import { And } from "../../Logic/Tags/And"
import { Tag } from "../../Logic/Tags/Tag"
import { SpecialVisualizationState } from "../SpecialVisualization"
import { Feature, Point } from "geojson"
import SvelteUIElement from "../Base/SvelteUIElement"
import Relocation from "../../assets/svg/Relocation.svelte"
import Location from "../../assets/svg/Location.svelte"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { WayId } from "../../Models/OsmFeature"

export interface MoveReason {
    text: Translation | string
    invitingText: Translation | string
    icon: string
    changesetCommentValue: string
    lockBounds: true | boolean
    includeSearch: false | boolean
    background: undefined | "map" | "photo" | string | string[]
    startZoom: number
    minZoom: number
    eraseAddressFields: false | boolean
    /**
     * Snap to these layers
     */
    snapTo?: string[]
    maxSnapDistance?: number
}

export class MoveWizardState {
    public readonly reasons: ReadonlyArray<MoveReason>

    public readonly moveDisallowedReason = new UIEventSource<Translation>(undefined)
    private readonly layer: LayerConfig
    private readonly _state: SpecialVisualizationState
    private readonly featureToMoveId: string

    /**
     * Initialize the movestate for the feature of the given ID
     * @param id of the feature that should be moved
     * @param options
     * @param layer
     * @param state
     */
    constructor(id: string, options: MoveConfig, layer: LayerConfig, state: SpecialVisualizationState) {
        this.layer = layer
        this._state = state
        this.featureToMoveId = id
        this.reasons = this.initReasons(options)
        if (this.reasons.length > 0) {
            this.checkIsAllowed(id)
        }
    }

    private initReasons(options: MoveConfig): MoveReason[] {
        const t = Translations.t.move
        const reasons: MoveReason[] = []
        if (options.enableRelocation) {
            reasons.push({
                text: t.reasons.reasonRelocation,
                invitingText: t.inviteToMove.reasonRelocation,
                icon: "relocation",
                changesetCommentValue: "relocated",
                lockBounds: false,
                background: undefined,
                includeSearch: true,
                startZoom: 12,
                minZoom: 6,
                eraseAddressFields: true,
            })
        }
        if (options.enableImproveAccuracy) {
            reasons.push({
                text: t.reasons.reasonInaccurate,
                invitingText: t.inviteToMove.reasonInaccurate,
                icon: "location",
                changesetCommentValue: "improve_accuracy",
                lockBounds: true,
                includeSearch: false,
                background: "photo",
                startZoom: 18,
                minZoom: 16,
                eraseAddressFields: false,
            })
        }

        const tags = this._state.featureProperties.getStore(this.featureToMoveId).data
        const matchingPresets = this.layer.presets.filter(preset => preset.preciseInput.snapToLayers && new And(preset.tags).matchesProperties(tags))
        const matchingPreset = matchingPresets.flatMap(pr => pr.preciseInput?.snapToLayers)
        for (const layerId of matchingPreset) {
            const snapOntoLayer = this._state.theme.getLayer(layerId)
            const text = <Translation> t.reasons.reasonSnapTo.PartialSubsTr("name", snapOntoLayer.snapName)
            reasons.push({
                text,
                invitingText: text,
                icon: "snap",
                changesetCommentValue: "snap",
                lockBounds: true,
                includeSearch: false,
                background: "photo",
                startZoom: 19,
                minZoom: 16,
                eraseAddressFields: false,
                snapTo: [snapOntoLayer.id],
                maxSnapDistance: 5,
            })
        }


        return reasons
    }

    public async moveFeature(
        loc: { lon: number; lat: number },
        snappedTo: WayId,
        reason: MoveReason,
        featureToMove: Feature<Point>,
    ) {
        const state = this._state
        if(snappedTo !== undefined){
            this.moveDisallowedReason.set(Translations.t.move.partOfAWay)
        }
        await state.changes.applyAction(
            new ChangeLocationAction(state,
                featureToMove.properties.id,
                [loc.lon, loc.lat],
                snappedTo,
                {
                    reason: reason.changesetCommentValue,
                    theme: state.theme.id,
                }),
        )
        featureToMove.properties._lat = loc.lat
        featureToMove.properties._lon = loc.lon
        featureToMove.geometry.coordinates = [loc.lon, loc.lat]
        if (reason.eraseAddressFields) {
            await state.changes.applyAction(
                new ChangeTagAction(
                    featureToMove.properties.id,
                    new And([
                        new Tag("addr:housenumber", ""),
                        new Tag("addr:street", ""),
                        new Tag("addr:city", ""),
                        new Tag("addr:postcode", ""),
                    ]),
                    featureToMove.properties,
                    {
                        changeType: "relocated",
                        theme: state.theme.id,
                    },
                ),
            )
        }

        state.featureProperties.getStore(featureToMove.properties.id)?.ping()
        state.mapProperties.location.setData(loc)
    }

    private checkIsAllowed(id: string) {
        const t = Translations.t.move
        if (id.startsWith("way")) {
            this.moveDisallowedReason.setData(t.isWay)
        } else if (id.startsWith("relation")) {
            this.moveDisallowedReason.setData(t.isRelation)
        } else if (id.indexOf("-") < 0) {
            this._state.osmObjectDownloader.DownloadReferencingWays(id).then((referencing) => {
                if (referencing.length > 0) {
                    this.moveDisallowedReason.setData(t.partOfAWay)
                }
            })
            this._state.osmObjectDownloader.DownloadReferencingRelations(id).then((partOf) => {
                if (partOf.length > 0) {
                    this.moveDisallowedReason.setData(t.partOfRelation)
                }
            })
        } else {
            // This is a new point. Check if it was snapped to an existing way due to the '_referencing_ways'-tag
            const store = this._state.featureProperties.getStore(id)
            store?.addCallbackAndRunD((tags) => {
                try {
                    if (tags._referencing_ways !== undefined && tags._referencing_ways !== "[]") {
                        console.log("Got referencing ways according to the tags")
                        this.moveDisallowedReason.setData(t.partOfAWay)
                        return true // unregister
                    }
                } catch (e) {
                    console.error("Could not get '_referencing_ways'-attribute of tags due to", e)
                }
            })
        }
    }
}
