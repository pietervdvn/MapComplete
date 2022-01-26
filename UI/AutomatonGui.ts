import BaseUIElement from "./BaseUIElement";
import Combine from "./Base/Combine";
import Svg from "../Svg";
import Title from "./Base/Title";
import Toggle from "./Input/Toggle";
import {SubtleButton} from "./Base/SubtleButton";
import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
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
import {OsmConnection} from "../Logic/Osm/OsmConnection";
import {BBox} from "../Logic/BBox";
import MapState from "../Logic/State/MapState";
import FeaturePipeline from "../Logic/FeatureSource/FeaturePipeline";
import LayerConfig from "../Models/ThemeConfig/LayerConfig";
import TagRenderingConfig from "../Models/ThemeConfig/TagRenderingConfig";
import FeatureSource from "../Logic/FeatureSource/FeatureSource";
import List from "./Base/List";
import {QueryParameters} from "../Logic/Web/QueryParameters";
import {SubstitutedTranslation} from "./SubstitutedTranslation";
import {AutoAction} from "./Popup/AutoApplyButton";
import DynamicGeoJsonTileSource from "../Logic/FeatureSource/TiledFeatureSource/DynamicGeoJsonTileSource";
import * as themeOverview from "../assets/generated/theme_overview.json"


class AutomationPanel extends Combine{
    private static readonly openChangeset = new UIEventSource<number>(undefined);

    constructor(layoutToUse: LayoutConfig, indices: number[], extraCommentText: UIEventSource<string>, tagRenderingToAutomate: { layer: LayerConfig, tagRendering: TagRenderingConfig }) {
        const layerId = tagRenderingToAutomate.layer.id
        const trId = tagRenderingToAutomate.tagRendering.id
        const tileState = LocalStorageSource.GetParsed("automation-tile_state-" + layerId + "-" + trId, {})
        const logMessages = new UIEventSource<string[]>([])
        if (indices === undefined) {
           throw ("No tiles loaded - can not automate")
        }
        const openChangeset = AutomationPanel.openChangeset;
      
        openChangeset.addCallbackAndRun(cs => console.trace("Sync current open changeset to:", cs))

        const nextTileToHandle = tileState.map(handledTiles => {
            for (const index of indices) {
                if (handledTiles[index] !== undefined) {
                    // Already handled
                    continue
                }
                return index
            }
            return undefined
        })
        nextTileToHandle.addCallback(t => console.warn("Next tile to handle is", t))

        const neededTimes = new UIEventSource<number[]>([])
        const automaton = new VariableUiElement(nextTileToHandle.map(tileIndex => {
            if (tileIndex === undefined) {
                return new FixedUiElement("All done!").SetClass("thanks")
            }
            console.warn("Triggered map on nextTileToHandle",tileIndex)
            const start = new Date()
            return AutomationPanel.TileHandler(layoutToUse, tileIndex, layerId, tagRenderingToAutomate.tagRendering, extraCommentText,
                openChangeset,
                (result, logMessage) => {
                const end = new Date()
                const timeNeeded = (end.getTime() - start.getTime()) / 1000;
                neededTimes.data.push(timeNeeded)
                neededTimes.ping()
                tileState.data[tileIndex] = result
                tileState.ping();
                if(logMessage !== undefined){
                    logMessages.data.push(logMessage)
                    logMessages.ping();
                }
            });
        }))


        const statistics = new VariableUiElement(tileState.map(states => {
            let total = 0
            const perResult = new Map<string, number>()
            for (const key in states) {
                total++
                const result = states[key]
                perResult.set(result, (perResult.get(result) ?? 0) + 1)
            }

            let sum = 0
            neededTimes.data.forEach(v => {
                sum = sum + v
            })
            let timePerTile = sum / neededTimes.data.length

            return new Combine(["Handled " + total + "/" + indices.length + " tiles: ",
                new List(Array.from(perResult.keys()).map(key => key + ": " + perResult.get(key))),
                "Handling one tile needs " + (Math.floor(timePerTile * 100) / 100) + "s on average. Estimated time left: " + Utils.toHumanTime((indices.length - total) * timePerTile)
            ]).SetClass("flex flex-col")
        }))

       super([statistics, automaton, 
           new SubtleButton(undefined, "Clear fixed").onClick(() => {
                const st = tileState.data
               for (const tileIndex in st) {
                   if(st[tileIndex] === "fixed"){
                       delete st[tileIndex]
                   }
               }
               
               tileState.ping();
           }),
           new VariableUiElement(logMessages.map(logMessages => new List(logMessages)))])
       this.SetClass("flex flex-col")
    }

    private static TileHandler(layoutToUse: LayoutConfig, tileIndex: number, targetLayer: string, targetAction: TagRenderingConfig, extraCommentText: UIEventSource<string>, 
                               openChangeset: UIEventSource<number>,
                               whenDone: ((result: string, logMessage?: string) => void)): BaseUIElement {

        const state = new MapState(layoutToUse, {attemptLogin: false})
        extraCommentText.syncWith( state.changes.extraComment)
        const [z, x, y] = Tiles.tile_from_index(tileIndex)
        state.locationControl.setData({
            zoom: z,
            lon: x,
            lat: y
        })
        state.currentBounds.setData(
            BBox.fromTileIndex(tileIndex)
        )

        let targetTiles: UIEventSource<FeatureSource[]> = new UIEventSource<FeatureSource[]>([])
        const pipeline = new FeaturePipeline((tile => {
            const layerId = tile.layer.layerDef.id
            if (layerId === targetLayer) {
                targetTiles.data.push(tile)
                targetTiles.ping()
            }
        }), state)

        state.locationControl.ping();
        state.currentBounds.ping();
        const stateToShow = new UIEventSource("")

        pipeline.runningQuery.map(
            async isRunning => {
                if (targetTiles.data.length === 0) {
                    stateToShow.setData("No data loaded yet...")
                    return;
                }
                if (isRunning) {
                    stateToShow.setData("Waiting for all layers to be loaded... Has " + targetTiles.data.length + " tiles already")
                    return;
                }
                if (targetTiles.data.length === 0) {
                    stateToShow.setData("No features found to apply the action")
                    whenDone("empty")
                    return true;
                }
                stateToShow.setData("Gathering applicable elements")

                let handled = 0
                let inspected = 0
                let log = []
                for (const targetTile of targetTiles.data) {

                    for (const ffs of targetTile.features.data) {
                        inspected++
                        if (inspected % 10 === 0) {
                            stateToShow.setData("Inspected " + inspected + " features, updated " + handled + " features")
                        }
                        const feature = ffs.feature
                        const renderingTr = targetAction.GetRenderValue(feature.properties)
                        const rendering = renderingTr.txt
                        log.push("<a href='https://openstreetmap.org/"+feature.properties.id+"' target='_blank'>"+feature.properties.id+"</a>: "+new SubstitutedTranslation(renderingTr, new UIEventSource<any>(feature.properties), undefined).ConstructElement().innerText)
                        const actions = Utils.NoNull(SubstitutedTranslation.ExtractSpecialComponents(rendering)
                            .map(obj => obj.special))
                        for (const action of actions) {
                            const auto = <AutoAction>action.func
                            if (auto.supportsAutoAction !== true) {
                                continue
                            }

                            await auto.applyActionOn({
                                layoutToUse: state.layoutToUse,
                                changes: state.changes
                            }, state.allElements.getEventSourceById(feature.properties.id), action.args)
                            handled++
                        }
                    }
                }
                stateToShow.setData("Done! Inspected " + inspected + " features, updated " + handled + " features")

                if (inspected === 0) {
                    whenDone("empty")
                    return true;
                }

                if (handled === 0) {
                    whenDone("no-action","Inspected "+inspected+" elements: "+log.join("; "))
                }else{
                    state.osmConnection.AttemptLogin()
                    state.changes.flushChanges("handled tile automatically, time to flush!", openChangeset)
                    whenDone("fixed", "Updated " + handled+" elements, inspected "+inspected+": "+log.join("; "))
                }
                return true;

            }, [targetTiles])

        return new Combine([
            new Title("Performing action for tile " + tileIndex, 1),
            new VariableUiElement(stateToShow)]).SetClass("flex flex-col")
    }

}



class AutomatonGui {

    constructor() {

        const osmConnection = new OsmConnection({
            allElements: undefined,
            changes: undefined,
            layoutName: "automaton",
            singlePage: false,
            oauth_token: QueryParameters.GetQueryParameter("oauth_token", "OAuth token")
        });

        new Combine([
            new Combine([Svg.robot_svg().SetClass("w-24 h-24 p-4 rounded-full subtle-background"),
                new Combine([new Title("MapComplete Automaton", 1),
                    "This page helps to automate certain tasks for a theme. Expert use only."
                ]).SetClass("flex flex-col m-4")
            ]).SetClass("flex"),
            new Toggle(
                AutomatonGui.GenerateMainPanel(),
                new SubtleButton(Svg.osm_logo_svg(), "Login to get started").onClick(() => osmConnection.AttemptLogin()),
                osmConnection.isLoggedIn
            )]) .SetClass("block p-4")
            .AttachTo("main")
    }


    private static GenerateMainPanel(): BaseUIElement {

        const themeSelect = new DropDown<string>("Select a theme",
            Array.from(themeOverview).map(l => ({value: l.id, shown: l.id})) 
        )

        LocalStorageSource.Get("automation-theme-id", "missing_streets").syncWith(themeSelect.GetValue())


        const tilepath = ValidatedTextField.InputForType("url", {
            placeholder: "Specifiy the path of the overview",
        })
        tilepath.SetClass("w-full")
        LocalStorageSource.Get("automation-tile_path").syncWith(tilepath.GetValue(), true)

        
        let tilesToRunOver = tilepath.GetValue().bind(path => {
            if (path === undefined) {
                return undefined
            }
            return UIEventSource.FromPromiseWithErr(Utils.downloadJsonCached(path,1000*60*60))
        })
        
        const targetZoom = 14

        const tilesPerIndex = tilesToRunOver.map(tiles => {
            
            if (tiles === undefined || tiles["error"] !== undefined) {
                return undefined
            }
            let indexes : number[] = [];
            const tilesS = tiles["success"]
            DynamicGeoJsonTileSource.RegisterWhitelist(tilepath.GetValue().data , tilesS)
            const z = Number(tilesS["zoom"])
            for (const key in tilesS) {
                if (key === "zoom") {
                    continue
                }
                const x = Number(key)
                const ys = tilesS[key]
                indexes.push(...ys.map(y => Tiles.tile_index(z, x, y)))
            }

            console.log("Got ", indexes.length, "indexes")
            let rezoomed = new Set<number>()
            for (const index of indexes) {
                let [z, x, y] = Tiles.tile_from_index(index)
                while (z > targetZoom) {
                    z--
                    x = Math.floor(x / 2)
                    y = Math.floor(y / 2)
                }
                rezoomed.add(Tiles.tile_index(z, x, y))
            }


            return Array.from(rezoomed)
        })

        const extraComment = ValidatedTextField.InputForType("text")
        LocalStorageSource.Get("automaton-extra-comment").syncWith(extraComment.GetValue())

        return new Combine([
            themeSelect,
            "Specify the path to a tile overview. This is a hosted .json of the format {x : [y0, y1, y2], x1: [y0, ...]} where x is a string and y are numbers",
            tilepath,
            "Add an extra comment:",
            extraComment,
            new VariableUiElement(extraComment.GetValue().map(c => "Your comment is "+(c?.length??0)+"/200 characters long")).SetClass("subtle"),
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
                if (tilesPerIndex.data === undefined || tilesPerIndex.data.length === 0) {
                    return "No tiles given"
                }

                const automatableTagRenderings: { layer: LayerConfig, tagRendering: TagRenderingConfig }[] = []
                for (const layer of layoutToUse.layers) {
                    for (const tagRendering of layer.tagRenderings) {
                        if (tagRendering.group === "auto") {
                            automatableTagRenderings.push({layer, tagRendering: tagRendering})
                        }
                    }
                }
                console.log("Automatable tag renderings:", automatableTagRenderings)
                if (automatableTagRenderings.length === 0) {
                    return new FixedUiElement('This theme does not have any tagRendering with "group": "auto" set').SetClass("alert")
                }
                const pickAuto = new DropDown("Pick the action to automate",
                    [
                        {
                            value: undefined,
                            shown: "Pick an option"
                        },
                        ...automatableTagRenderings.map(config => (
                            {
                                shown: config.layer.id + " - " + config.tagRendering.id,
                                value: config
                            }
                        ))
                    ]
                )


                return new Combine([
                    pickAuto,
                    new VariableUiElement(pickAuto.GetValue().map(auto => auto === undefined ? undefined : new AutomationPanel(layoutToUse, tilesPerIndex.data, extraComment.GetValue(), auto)))])

            }, [tilesPerIndex])).SetClass("flex flex-col")


        ]).SetClass("flex flex-col")


    }

}


MinimapImplementation.initialize()

new AutomatonGui()
   
