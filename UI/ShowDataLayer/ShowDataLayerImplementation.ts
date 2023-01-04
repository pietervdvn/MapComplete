import { Store, UIEventSource } from "../../Logic/UIEventSource"
import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
import { ShowDataLayerOptions } from "./ShowDataLayerOptions"
import { ElementStorage } from "../../Logic/ElementStorage"
import RenderingMultiPlexerFeatureSource from "../../Logic/FeatureSource/Sources/RenderingMultiPlexerFeatureSource"
import ScrollableFullScreen from "../Base/ScrollableFullScreen"
import { LeafletMouseEvent, PathOptions } from "leaflet"
import Hash from "../../Logic/Web/Hash"
import { BBox } from "../../Logic/BBox"
import { Utils } from "../../Utils"
/*
// import 'leaflet-polylineoffset';
We don't actually import it here. It is imported in the 'MinimapImplementation'-class, which'll result in a patched 'L' object.
 Even though actually importing this here would seem cleaner, we don't do this as this breaks some scripts:
 - Scripts are ran in ts-node
 - ts-node doesn't define the 'window'-object
 - Importing this will execute some code which needs the window object

 */

/**
 * The data layer shows all the given geojson elements with the appropriate icon etc
 */
export default class ShowDataLayerImplementation {
    private static dataLayerIds = 0
    private readonly _leafletMap: Store<L.Map>
    private readonly _enablePopups: boolean
    private readonly _features: RenderingMultiPlexerFeatureSource
    private readonly _layerToShow: LayerConfig
    private readonly _selectedElement: UIEventSource<any>
    private readonly allElements: ElementStorage
    // Used to generate a fresh ID when needed
    private _cleanCount = 0
    private geoLayer = undefined

    /**
     * A collection of functions to call when the current geolayer is unregistered
     */
    private unregister: (() => void)[] = []
    private isDirty = false
    /**
     * If the selected element triggers, this is used to lookup the correct layer and to open the popup
     * Used to avoid a lot of callbacks on the selected element
     *
     * Note: the key of this dictionary is 'feature.properties.id+features.geometry.type' as one feature might have multiple presentations
     * @private
     */
    private readonly leafletLayersPerId = new Map<
        string,
        { feature: any; activateFunc: (event: LeafletMouseEvent) => void }
    >()

    private readonly showDataLayerid: number
    private readonly createPopup: (
        tags: UIEventSource<any>,
        layer: LayerConfig
    ) => ScrollableFullScreen

    /**
     * Creates a datalayer.
     *
     * If 'createPopup' is set, this function is called every time that 'popupOpen' is called
     * @param options
     */
    constructor(options: ShowDataLayerOptions & { layerToShow: LayerConfig }) {
        this._leafletMap = options.leafletMap
        this.showDataLayerid = ShowDataLayerImplementation.dataLayerIds
        ShowDataLayerImplementation.dataLayerIds++
        if (options.features === undefined) {
            console.error("Invalid ShowDataLayer invocation: options.features is undefed")
            throw "Invalid ShowDataLayer invocation: options.features is undefed"
        }
        this._features = new RenderingMultiPlexerFeatureSource(
            options.features,
            options.layerToShow
        )
        this._layerToShow = options.layerToShow
        this._selectedElement = options.selectedElement
        this.allElements = options.state?.allElements
        this.createPopup = undefined
        this._enablePopups = options.popup !== undefined
        if (options.popup !== undefined) {
            this.createPopup = options.popup
        }
        const self = this

        options.leafletMap.addCallback(() => {
            return self.update(options)
        })

        this._features.features.addCallback((_) => self.update(options))
        options.doShowLayer?.addCallback((doShow) => {
            const mp = options.leafletMap.data
            if (mp === null) {
                self.Destroy()
                return true
            }
            if (mp == undefined) {
                return
            }

            if (doShow) {
                if (self.isDirty) {
                    return self.update(options)
                } else {
                    mp.addLayer(this.geoLayer)
                }
            } else {
                if (this.geoLayer !== undefined) {
                    mp.removeLayer(this.geoLayer)
                    this.unregister.forEach((f) => f())
                    this.unregister = []
                }
            }
        })

        this._selectedElement?.addCallbackAndRunD((selected) => {
            self.openPopupOfSelectedElement(selected)
        })

        this.update(options)
    }

    private Destroy() {
        this.unregister.forEach((f) => f())
    }

    private openPopupOfSelectedElement(selected) {
        if (selected === undefined) {
            return
        }
        if (this._leafletMap.data === undefined) {
            return
        }
        const v = this.leafletLayersPerId.get(selected.properties.id + selected.geometry.type)
        if (v === undefined) {
            return
        }
        const feature = v.feature
        if (selected.properties.id !== feature.properties.id) {
            return
        }

        if (feature.id !== feature.properties.id) {
            // Probably a feature which has renamed
            // the feature might have as id 'node/-1' and as 'feature.properties.id' = 'the newly assigned id'. That is no good too
            console.log("Not opening the popup for", feature, "as probably renamed")
            return
        }
        v.activateFunc(null)
    }

    private update(options: ShowDataLayerOptions): boolean {
        if (this._features.features.data === undefined) {
            return
        }
        this.isDirty = true
        if (options?.doShowLayer?.data === false) {
            return
        }
        const mp = options.leafletMap.data

        if (mp === null) {
            return true // Unregister as the map has been destroyed
        }
        if (mp === undefined) {
            return
        }

        this._cleanCount++
        // clean all the old stuff away, if any
        if (this.geoLayer !== undefined) {
            mp.removeLayer(this.geoLayer)
        }

        const self = this

        this.geoLayer = new L.LayerGroup()

        const selfLayer = this.geoLayer
        const allFeats = this._features.features.data
        for (const feat of allFeats) {
            if (feat === undefined) {
                continue
            }

            // Why not one geojson layer with _all_ features, and attaching a right-click onto every feature individually?
            // Because that somehow doesn't work :(
            const feature = feat
            const geojsonLayer = L.geoJSON(feature, {
                style: (feature) => <PathOptions>self.createStyleFor(feature),
                pointToLayer: (feature, latLng) => self.pointToLayer(feature, latLng),
                onEachFeature: (feature, leafletLayer) =>
                    self.postProcessFeature(feature, leafletLayer),
            })
            if (feature.geometry.type === "Point") {
                geojsonLayer.on({
                    contextmenu: (e) => {
                        const o = self.leafletLayersPerId.get(feature?.properties?.id)
                        o?.activateFunc(<LeafletMouseEvent>e)
                        Utils.preventDefaultOnMouseEvent(e.originalEvent)
                    },
                    dblclick: (e) => {
                        const o = self.leafletLayersPerId.get(feature?.properties?.id)
                        o?.activateFunc(<LeafletMouseEvent>e)
                        Utils.preventDefaultOnMouseEvent(e.originalEvent)
                    },
                })
            }
            this.geoLayer.addLayer(geojsonLayer)
            try {
                if (feat.geometry.type === "LineString") {
                    const coords = L.GeoJSON.coordsToLatLngs(feat.geometry.coordinates)
                    const tagsSource =
                        this.allElements?.addOrGetElement(feat) ??
                        new UIEventSource<any>(feat.properties)
                    let offsettedLine
                    tagsSource
                        .map((tags) =>
                            this._layerToShow.lineRendering[
                                feat.lineRenderingIndex
                            ].GenerateLeafletStyle(tags)
                        )
                        .withEqualityStabilized((a, b) => {
                            if (a === b) {
                                return true
                            }
                            if (a === undefined || b === undefined) {
                                return false
                            }
                            return (
                                a.offset === b.offset &&
                                a.color === b.color &&
                                a.weight === b.weight &&
                                a.dashArray === b.dashArray
                            )
                        })
                        .addCallbackAndRunD((lineStyle) => {
                            if (offsettedLine !== undefined) {
                                self.geoLayer.removeLayer(offsettedLine)
                            }
                            // @ts-ignore
                            offsettedLine = L.polyline(coords, lineStyle)
                            this.postProcessFeature(feat, offsettedLine)
                            offsettedLine.addTo(this.geoLayer)

                            // If 'self.geoLayer' is not the same as the layer the feature is added to, we can safely remove this callback
                            return self.geoLayer !== selfLayer
                        })
                } else {
                    geojsonLayer.addData(feat)
                }
            } catch (e) {
                console.error(
                    "Could not add ",
                    feat,
                    "to the geojson layer in leaflet due to",
                    e,
                    e.stack
                )
            }
        }

        if ((options.zoomToFeatures ?? false) && allFeats.length > 0) {
            let bound = undefined
            for (const feat of allFeats) {
                const fbound = BBox.get(feat)
                bound = bound?.unionWith(fbound) ?? fbound
            }
            if (bound !== undefined) {
                mp.fitBounds(bound?.toLeaflet(), { animate: false })
            }
        }

        if (options.doShowLayer?.data ?? true) {
            mp.addLayer(this.geoLayer)
        }
        this.isDirty = false
        this.openPopupOfSelectedElement(this._selectedElement?.data)
    }

    private createStyleFor(feature) {
        const tagsSource =
            this.allElements?.addOrGetElement(feature) ?? new UIEventSource<any>(feature.properties)
        // Every object is tied to exactly one layer
        const layer = this._layerToShow

        const pointRenderingIndex = feature.pointRenderingIndex
        const lineRenderingIndex = feature.lineRenderingIndex

        if (pointRenderingIndex !== undefined) {
            const style = layer.mapRendering[pointRenderingIndex].GenerateLeafletStyle(
                tagsSource,
                this._enablePopups
            )
            return {
                icon: style,
            }
        }
        if (lineRenderingIndex !== undefined) {
            return layer.lineRendering[lineRenderingIndex].GenerateLeafletStyle(tagsSource.data)
        }

        throw "Neither lineRendering nor mapRendering defined for " + feature
    }

    private pointToLayer(feature, latLng): L.Layer {
        // Leaflet cannot handle geojson points natively
        // We have to convert them to the appropriate icon
        // Click handling is done in the next step
        const layer: LayerConfig = this._layerToShow
        if (layer === undefined) {
            return
        }
        let tagSource =
            this.allElements?.getEventSourceById(feature.properties.id) ??
            new UIEventSource<any>(feature.properties)
        const clickable =
            !(layer.title === undefined && (layer.tagRenderings ?? []).length === 0) &&
            this._enablePopups
        let style: any = layer.mapRendering[feature.pointRenderingIndex].GenerateLeafletStyle(
            tagSource,
            clickable
        )
        const baseElement = style.html
        if (!this._enablePopups) {
            baseElement.SetStyle("cursor: initial !important")
        }
        style.html = style.html.ConstructElement()
        return L.marker(latLng, {
            icon: L.divIcon(style),
        })
    }
    private createActivateFunction(feature, key: string, layer: LayerConfig): (event) => void {
        let infobox: ScrollableFullScreen = undefined
        const self = this

        function activate(event: LeafletMouseEvent) {
            if (infobox === undefined) {
                const tags =
                    self.allElements?.getEventSourceById(key) ??
                    new UIEventSource<any>(feature.properties)
                infobox = self.createPopup(tags, layer)

                self.unregister.push(() => {
                    console.log("Destroying infobox")
                    infobox.Destroy()
                })
            }
            infobox.Activate()
            self._selectedElement.setData(
                self.allElements.ContainingFeatures.get(feature.id) ?? feature
            )
        }
        return activate
    }
    /**
     * Post processing - basically adding the popup
     * @param feature
     * @param leafletLayer
     * @private
     */
    private postProcessFeature(feature, leafletLayer: L.Evented) {
        const layer: LayerConfig = this._layerToShow
        if (layer.title === undefined || !this._enablePopups) {
            // No popup action defined -> Don't do anything
            // or probably a map in the popup - no popups needed!
            return
        }
        const key = feature.properties.id
        let activate: (event) => void
        if (this.leafletLayersPerId.has(key)) {
            activate = this.leafletLayersPerId.get(key).activateFunc
        } else {
            activate = this.createActivateFunction(feature, key, layer)
        }

        // We also have to open on rightclick, doubleclick, ... as users sometimes do this. See #1219
        leafletLayer.on({
            dblclick: activate,
            contextmenu: activate,
            click: activate,
        })
        // Add the feature to the index to open the popup when needed
        this.leafletLayersPerId.set(key, {
            feature: feature,
            activateFunc: activate,
        })
        if (Hash.hash.data === key) {
            activate(null)
        }
    }
}
