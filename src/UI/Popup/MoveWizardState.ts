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

export interface MoveReason {
    text: Translation | string
    invitingText: Translation | string
    icon: BaseUIElement
    changesetCommentValue: string
    lockBounds: true | boolean
    includeSearch: false | boolean
    background: undefined | "map" | "photo" | string | string[]
    startZoom: number
    minZoom: number
    eraseAddressFields: false | boolean
}

export class MoveWizardState {
    public readonly reasons: ReadonlyArray<MoveReason>

    public readonly moveDisallowedReason = new UIEventSource<Translation>(undefined)
    private readonly _state: SpecialVisualizationState

    constructor(id: string, options: MoveConfig, state: SpecialVisualizationState) {
        this._state = state
        this.reasons = MoveWizardState.initReasons(options)
        if (this.reasons.length > 0) {
            this.checkIsAllowed(id)
        }
    }

    private static initReasons(options: MoveConfig): MoveReason[] {
        const t = Translations.t.move

        const reasons: MoveReason[] = []
        if (options.enableRelocation) {
            reasons.push({
                text: t.reasons.reasonRelocation,
                invitingText: t.inviteToMove.reasonRelocation,
                icon: new SvelteUIElement(Relocation),
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
                icon: new SvelteUIElement(Location),
                changesetCommentValue: "improve_accuracy",
                lockBounds: true,
                includeSearch: false,
                background: "photo",
                startZoom: 18,
                minZoom: 16,
                eraseAddressFields: false,
            })
        }
        return reasons
    }

    public async moveFeature(
        loc: { lon: number; lat: number },
        reason: MoveReason,
        featureToMove: Feature<Point>
    ) {
        const state = this._state
        await state.changes.applyAction(
            new ChangeLocationAction(featureToMove.properties.id, [loc.lon, loc.lat], {
                reason: reason.changesetCommentValue,
                theme: state.layout.id,
            })
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
                        theme: state.layout.id,
                    }
                )
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
                if (tags._referencing_ways !== undefined && tags._referencing_ways !== "[]") {
                    console.log("Got referencing ways according to the tags")
                    this.moveDisallowedReason.setData(t.partOfAWay)
                    return true
                }
            })
        }
    }
}
