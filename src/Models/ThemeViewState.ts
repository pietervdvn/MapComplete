import ThemeConfig from "./ThemeConfig/ThemeConfig"
import { WithImageState } from "./ThemeViewState/WithImageState"

/**
 *
 * The themeviewState contains all the state needed for the themeViewGUI.
 *
 * This is pretty much the 'brain' or the HQ of MapComplete
 *
 * It ties up all the needed elements and starts some actors.
 */
export default class ThemeViewState extends WithImageState {
    constructor(layout: ThemeConfig, mvtAvailableLayers: Set<string>) {
        super(layout, mvtAvailableLayers)
    }
}
