/**
 * Asks to add a feature at the last clicked location, at least if zoom is sufficient
 */
import BaseUIElement from "../BaseUIElement"
import PresetConfig from "../../Models/ThemeConfig/PresetConfig"
import FilteredLayer from "../../Models/FilteredLayer"

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
