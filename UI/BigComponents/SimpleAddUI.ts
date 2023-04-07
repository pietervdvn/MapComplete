/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
import { UIEventSource } from "../../Logic/UIEventSource"
import Translations from "../i18n/Translations"
import BaseUIElement from "../BaseUIElement"
import { VariableUiElement } from "../Base/VariableUIElement"
import Toggle from "../Input/Toggle"
import CreateNewNodeAction from "../../Logic/Osm/Actions/CreateNewNodeAction"
import { OsmObject, OsmWay } from "../../Logic/Osm/OsmObject"
import PresetConfig from "../../Models/ThemeConfig/PresetConfig"
import FilteredLayer from "../../Models/FilteredLayer"
import Loading from "../Base/Loading"
import Hash from "../../Logic/Web/Hash"
import { WayId } from "../../Models/OsmFeature"
import { Tag } from "../../Logic/Tags/Tag"
import { SpecialVisualizationState } from "../SpecialVisualization"
import { Feature } from "geojson"
import { FixedUiElement } from "../Base/FixedUiElement"
import Combine from "../Base/Combine"

/*
 * The SimpleAddUI is a single panel, which can have multiple states:
 * - A list of presets which can be added by the user
 * - A 'confirm-selection' button (or alternatively: please enable the layer)
 * - A 'something is wrong - please soom in further'
 * - A 'read your unread messages before adding a point'
 */

export interface PresetInfo extends PresetConfig {
    name: string | BaseUIElement
    icon: () => BaseUIElement
    layerToAddTo: FilteredLayer
    boundsFactor?: 0.25 | number
}
