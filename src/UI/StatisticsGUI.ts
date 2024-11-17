import SvelteUIElement from "./Base/SvelteUIElement"
import { default as StatisticsSvelte } from "../UI/Statistics/StatisticsGui.svelte"

new SvelteUIElement(StatisticsSvelte).AttachTo("main")
