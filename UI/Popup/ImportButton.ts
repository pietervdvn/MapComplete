import BaseUIElement from "../BaseUIElement"
import {Store, UIEventSource} from "../../Logic/UIEventSource"
import Translations from "../i18n/Translations"
import {FixedUiElement} from "../Base/FixedUiElement"
import OsmChangeAction from "../../Logic/Osm/Actions/OsmChangeAction"
import {And} from "../../Logic/Tags/And"
import {Tag} from "../../Logic/Tags/Tag"
import {SpecialVisualization, SpecialVisualizationState} from "../SpecialVisualization"
import {Feature} from "geojson"
import {ImportFlowArguments, ImportFlowUtils} from "./ImportButtons/ImportFlow";
import {MergePointConfig} from "../../Logic/Osm/Actions/CreateWayWithPointReuseAction";
import {GeoOperations} from "../../Logic/GeoOperations";
import ReplaceGeometryAction from "../../Logic/Osm/Actions/ReplaceGeometryAction";
import {TagUtils} from "../../Logic/Tags/TagUtils";


/**
 * @deprecated
 * A helper class for the various import-flows.
 * An import-flow always starts with a 'Import this'-button. Upon click, a custom confirmation panel is provided
 */
export abstract class AbstractImportButton implements SpecialVisualization {

    public readonly funcName: string
    public readonly docs: string
    public readonly args: { name: string; defaultValue?: string; doc: string }[]
    private readonly showRemovedTags: boolean
    private readonly cannotBeImportedMessage: BaseUIElement | undefined

    constructor(
        funcName: string,
        docsIntro: string,
        extraArgs: { name: string; doc: string; defaultValue?: string; required?: boolean }[],
        options?: { showRemovedTags?: true | boolean; cannotBeImportedMessage?: BaseUIElement }
    ) {
        this.funcName = funcName
        this.showRemovedTags = options?.showRemovedTags ?? true
        this.cannotBeImportedMessage = options?.cannotBeImportedMessage
        this.docs = `${docsIntro}${ImportFlowUtils.documentationGeneral}`

        this.args = [
            {
                name: "targetLayer",
                doc: "The id of the layer where this point should end up. This is not very strict, it will simply result in checking that this layer is shown preventing possible duplicate elements",
                required: true,
            },
            {
                name: "tags",
                doc: "The tags to add onto the new object - see specification above. If this is a key (a single word occuring in the properties of the object), the corresponding value is taken and expanded instead",
                required: true,
            },
            {
                name: "text",
                doc: "The text to show on the button",
                defaultValue: "Import this data into OpenStreetMap",
            },
            {
                name: "icon",
                doc: "A nice icon to show in the button",
                defaultValue: "./assets/svg/addSmall.svg",
            },
            ...extraArgs,
        ]
    }

    abstract constructElement(
        state: SpecialVisualizationState,
        args: ImportFlowArguments,
        newTags: Store<Tag[]>,
        tagSource: UIEventSource<Record<string, string>>,
        feature: Feature,
        onCancelClicked: () => void
    ): BaseUIElement

    constr(
        state: SpecialVisualizationState,
        tagSource: UIEventSource<Record<string, string>>,
        argsRaw: string[]
    ) {
        return new FixedUiElement("Deprecated")
    }

}

export class ConflateButton extends AbstractImportButton {
    needsNodeDatabase = true

    constructor() {
        super(
            "conflate_button",
            "This button will modify the geometry of an existing OSM way to match the specified geometry. This can conflate OSM-ways with LineStrings and Polygons (only simple polygons with one single ring). An attempt is made to move points with special values to a decent new location (e.g. entrances)",
            [
                {
                    name: "way_to_conflate",
                    doc: "The key, of which the corresponding value is the id of the OSM-way that must be conflated; typically a calculatedTag",
                },
            ],
            {
                cannotBeImportedMessage: Translations.t.general.add.import.wrongTypeToConflate,
            }
        )
    }

    constructElement(
        state: SpecialVisualizationState,
        args: {
            max_snap_distance: string
            snap_onto_layers: string
            icon: string
            text: string
            tags: string
            newTags: UIEventSource<Tag[]>
            targetLayer: string
        },
        tagSource: UIEventSource<any>,
        feature: Feature,
        onCancelClicked: () => void
    ): BaseUIElement {
        const nodesMustMatch = args.snap_onto_layers
            ?.split(";")
            ?.map((tag, i) => TagUtils.Tag(tag, "TagsSpec for import button " + i))

        const mergeConfigs = []
        if (nodesMustMatch !== undefined && nodesMustMatch.length > 0) {
            const mergeConfig: MergePointConfig = {
                mode: args["point_move_mode"] == "move_osm" ? "move_osm_point" : "reuse_osm_point",
                ifMatches: new And(nodesMustMatch),
                withinRangeOfM: Number(args.max_snap_distance),
            }
            mergeConfigs.push(mergeConfig)
        }

        const key = args["way_to_conflate"]
        const wayToConflate = tagSource.data[key]
        feature = GeoOperations.removeOvernoding(feature)
        const action: OsmChangeAction & { getPreview(): Promise<any> } = new ReplaceGeometryAction(
            state,
            feature,
            wayToConflate,
            {
                theme: state.layout.id,
                newTags: args.newTags.data,
            }
        )

        return this.createConfirmPanelForWay(
            state,
            args,
            feature,
            tagSource,
            action,
            onCancelClicked
        )
    }

    protected canBeImported(feature: Feature) {
        return (
            feature.geometry.type === "LineString" ||
            (feature.geometry.type === "Polygon" && feature.geometry.coordinates.length === 1)
        )
    }
}
