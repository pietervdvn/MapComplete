import BaseUIElement from "./BaseUIElement";
import Combine from "./Base/Combine";
import Svg from "../Svg";
import Title from "./Base/Title";
import Toggle from "./Input/Toggle";
import {SubtleButton} from "./Base/SubtleButton";
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
import UserRelatedState from "../Logic/State/UserRelatedState";
import ValidatedTextField from "./Input/ValidatedTextField";
import {Utils} from "../Utils";
import {UIEventSource} from "../Logic/UIEventSource";
import {VariableUiElement} from "./Base/VariableUIElement";
import {FixedUiElement} from "./Base/FixedUiElement";
import {Tiles} from "../Models/TileRange";
import {LocalStorageSource} from "../Logic/Web/LocalStorageSource";
import {DropDown} from "./Input/DropDown";
import {AllKnownLayouts} from "../Customizations/AllKnownLayouts";
import MinimapImplementation from "./Base/MinimapImplementation";
import State from "../State";
import {OsmConnection} from "../Logic/Osm/OsmConnection";
import FeaturePipelineState from "../Logic/State/FeaturePipelineState";

export default class AutomatonGui extends Combine {

    constructor() {

        const osmConnection = new OsmConnection({
            allElements: undefined,
            changes: undefined,
            layoutName: "automaton",
            singlePage: true
        });

        super([
            new Combine([Svg.robot_svg().SetClass("w-24 h-24 p-4 rounded-full subtle-background"),
                new Combine([new Title("MapComplete Automaton", 1),
                    "This page helps to automate certain tasks for a theme. Expert use only."
                ]).SetClass("flex flex-col m-4")
            ]).SetClass("flex"),
            new Toggle(
                AutomatonGui.GenerateMainPanel(),
                new SubtleButton(Svg.osm_logo_svg(), "Login to get started"),
                osmConnection.isLoggedIn
            )])
    }

    private static AutomationPanel(layoutToUse: LayoutConfig, tiles: UIEventSource<number[]>): BaseUIElement {
        const handledTiles = new UIEventSource(0)

        const state = new FeaturePipelineState(layoutToUse)


        const nextTile = tiles.map(indices => {
            if (indices === undefined) {
                return "No tiles loaded - can not automate";
            }
            const currentTile = handledTiles.data
            const tileIndex = indices[currentTile]
            if (tileIndex === undefined) {
                return "All done!";
            }


            return "" + tileIndex
        }, [handledTiles])

        return new Combine([
            new VariableUiElement(handledTiles.map(i => "" + i)),
            new VariableUiElement(nextTile)
        ])
    }

    private static GenerateMainPanel(): BaseUIElement {

        const themeSelect = new DropDown<string>("Select a theme",
            AllKnownLayouts.layoutsList.map(l => ({value: l.id, shown: l.id}))
        )

        LocalStorageSource.Get("automation-theme-id").syncWith(themeSelect.GetValue())


        const tilepath = ValidatedTextField.InputForType("url", {
            placeholder: "Specifiy the path of the overview",
        })
        tilepath.SetClass("w-full")
        LocalStorageSource.Get("automation-tile_path").syncWith(tilepath.GetValue(), true)

        const tilesToRunOver = tilepath.GetValue().bind(path => {
            if (path === undefined) {
                return undefined
            }
            return UIEventSource.FromPromiseWithErr(Utils.downloadJson(path))
        })

        const tilesPerIndex = tilesToRunOver.map(tiles => {
            if (tiles === undefined || tiles["error"] !== undefined) {
                return undefined
            }
            let indexes = [];
            const tilesS = tiles["success"]
            const z = Number(tilesS["zoom"])
            for (const key in tilesS) {
                if (key === "zoom") {
                    continue
                }
                const x = Number(key)
                const ys = tilesS[key]
                indexes.push(...ys.map(y => Tiles.tile_index(z, x, y)))
            }
            return indexes
        })

        return new Combine([
            themeSelect,
            "Specify the path to a tile overview. This is a hosted .json of the format {x : [y0, y1, y2], x1: [y0, ...]} where x is a string and y are numbers",
            tilepath,
            new VariableUiElement(tilesToRunOver.map(t => {
                if (t === undefined) {
                    return "No path given or still loading..."
                }
                if (t["error"] !== undefined) {
                    return new FixedUiElement("Invalid URL or data: " + t["error"]).SetClass("alert")
                }

                return new FixedUiElement("Loaded " + tilesPerIndex.data.length + " tiles to automated over").SetClass("thanks")
            })),
            new VariableUiElement(themeSelect.GetValue().map(id => AllKnownLayouts.allKnownLayouts.get(id)).map(layoutToUse => {
                if (layoutToUse === undefined) {
                    return new FixedUiElement("Select a valid layout")
                }

                return AutomatonGui.AutomationPanel(layoutToUse, tilesPerIndex)

            }))


        ]).SetClass("flex flex-col")


    }

}


MinimapImplementation.initialize()

new AutomatonGui()
    .SetClass("block p-4")
    .AttachTo("main")
