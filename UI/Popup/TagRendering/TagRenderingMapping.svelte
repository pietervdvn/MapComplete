<script lang="ts">
    import {Translation} from "../../i18n/Translation";
    import SpecialTranslation from "./SpecialTranslation.svelte";
    import type {SpecialVisualizationState} from "../../SpecialVisualization";
    import type {Feature} from "geojson";
    import {Store, UIEventSource} from "../../../Logic/UIEventSource";
    import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
    import Locale from "../../i18n/Locale";
    import {onDestroy} from "svelte";

    export let selectedElement: Feature
    export let tags: UIEventSource<Record<string, string>>;
    export let state: SpecialVisualizationState
    export let layer: LayerConfig

    export let mapping: {
        readonly then: Translation;
        readonly searchTerms?: Record<string, string[]>
        readonly icon?: string;
        readonly iconClass?: | "small"
            | "medium"
            | "large"
            | "small-height"
            | "medium-height"
            | "large-height"
    };
    let iconclass = "mapping-icon-" + mapping.iconClass;

</script>

{#if mapping.icon !== undefined}
    <div class="inline-flex">
        <img class={iconclass+" mr-1"} src={mapping.icon}>
        <SpecialTranslation t={mapping.then} {tags} {state} {layer} feature={selectedElement}></SpecialTranslation>
    </div>
{:else if mapping.then !== undefined}
    <SpecialTranslation t={mapping.then} {tags} {state} {layer} feature={selectedElement}></SpecialTranslation>
{/if}
