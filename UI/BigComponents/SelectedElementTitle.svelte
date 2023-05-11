<script lang="ts">
    import type {Feature} from "geojson";
    import {UIEventSource} from "../../Logic/UIEventSource";
    import LayerConfig from "../../Models/ThemeConfig/LayerConfig";
    import type {SpecialVisualizationState} from "../SpecialVisualization";
    import TagRenderingAnswer from "../Popup/TagRendering/TagRenderingAnswer.svelte";
    import TagRenderingEditable from "../Popup/TagRendering/TagRenderingEditable.svelte";
    import {onDestroy} from "svelte";
    import Translations from "../i18n/Translations";
    import Tr from "../Base/Tr.svelte";
    import {XCircleIcon} from "@rgossiaux/svelte-heroicons/solid";

    export let state: SpecialVisualizationState;
    export let layer: LayerConfig;
    export let selectedElement: Feature;
    export let tags: UIEventSource<Record<string, string>>;


    let _tags: Record<string, string>;
    onDestroy(tags.addCallbackAndRun(tags => {
        _tags = tags;
    }));

    let _metatags: Record<string, string>;
    onDestroy(state.userRelatedState.preferencesAsTags.addCallbackAndRun(tags => {
        _metatags = tags;
    }));
</script>


{#if _tags._deleted === "yes"}
    <Tr t={ Translations.t.delete.isDeleted}/>
{:else}
        <div class="flex border-b-2 border-black drop-shadow-md justify-between items-center low-interaction px-3 active-links">
            <div class="flex flex-col">

                <!-- Title element-->
                <h3>
                    <TagRenderingAnswer config={layer.title} {selectedElement} {state} {tags}
                                        {layer}></TagRenderingAnswer>
                </h3>

                <div class="flex flex-row flex-wrap pt-0.5 sm:pt-1 items-center mr-2 gap-x-0.5 p-1">
                    {#each layer.titleIcons as titleIconConfig}
                        {#if (titleIconConfig.condition?.matchesProperties(_tags) ?? true) && (titleIconConfig.metacondition?.matchesProperties({..._metatags, ..._tags}) ?? true) && titleIconConfig.IsKnown(_tags)}
                            <div class="w-8 h-8 flex items-center">
                                <TagRenderingAnswer config={titleIconConfig} {tags} {selectedElement} {state}
                                                    {layer} extraClasses="h-full justify-center" ></TagRenderingAnswer>
                            </div>
                        {/if}
                    {/each}
                </div>
                
            </div>
            <XCircleIcon class="w-8 h-8 cursor-pointer" on:click={() => state.selectedElement.setData(undefined)}/>
        </div>
{/if}

<style>
  
</style>
