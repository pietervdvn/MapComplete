<script lang="ts">
    import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig";
    import {UIEventSource} from "../../../Logic/UIEventSource";
    import type {Feature} from "geojson";
    import type {SpecialVisualizationState} from "../../SpecialVisualization";
    import TagRenderingAnswer from "./TagRenderingAnswer.svelte";
    import {PencilAltIcon, XCircleIcon} from "@rgossiaux/svelte-heroicons/solid";
    import TagRenderingQuestion from "./TagRenderingQuestion.svelte";
    import {onDestroy} from "svelte";
    import Tr from "../../Base/Tr.svelte";
    import Translations from "../../i18n/Translations.js";
    import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
    import {Utils} from "../../../Utils";

    export let config: TagRenderingConfig;
    export let tags: UIEventSource<Record<string, string>>;
    export let selectedElement: Feature;
    export let state: SpecialVisualizationState;
    export let layer: LayerConfig;

    export let editingEnabled = state.featureSwitchUserbadge

    export let highlightedRendering: UIEventSource<string> = undefined;
    export let showQuestionIfUnknown: boolean = false;
    let editMode = false;
    onDestroy(tags.addCallbackAndRunD(tags => {
        editMode = showQuestionIfUnknown && !config.IsKnown(tags);

    }));

    let htmlElem: HTMLBaseElement;
    $: {
        if (editMode && htmlElem !== undefined) {
            // EditMode switched to true, so the person wants to make a change
            // Make sure that the question is in the scrollview!

            // Some delay is applied to give Svelte the time to render the _question_
            window.setTimeout(() => {

                Utils.scrollIntoView(htmlElem)
            }, 50)
        }
    }

    const _htmlElement = new UIEventSource<HTMLElement>(undefined);
    $: _htmlElement.setData(htmlElem);

    function setHighlighting() {
        if (highlightedRendering === undefined) {
            return;
        }
        if (htmlElem === undefined) {
            return;
        }
        const highlighted = highlightedRendering.data;
        if (config.id === highlighted) {
            htmlElem.classList.add("glowing-shadow");
        } else {
            htmlElem.classList.remove("glowing-shadow");
        }
    }

    if (highlightedRendering) {
        onDestroy(highlightedRendering?.addCallbackAndRun(() => setHighlighting()))
        onDestroy(_htmlElement.addCallbackAndRun(() => setHighlighting()))
    }


</script>

<div bind:this={htmlElem} class="">
    {#if config.question && $editingEnabled}
        {#if editMode}
            <div class="m-1 mx-2">
                <TagRenderingQuestion {config} {tags} {selectedElement} {state} {layer}>
                    <button slot="cancel" class="secondary" on:click={() => {editMode = false}}>
                        <Tr t={Translations.t.general.cancel}/>
                    </button>
                    <XCircleIcon slot="upper-right" class="w-8 h-8" on:click={() => {editMode = false}}/>
                </TagRenderingQuestion>
            </div>
        {:else}
            <div class="flex justify-between low-interaction items-center m-1 mx-2 p-1 px-2 rounded">
                <TagRenderingAnswer {config} {tags} {selectedElement} {state} {layer}/>
                <button on:click={() => {editMode = true}} class="shrink-0 w-8 h-8 rounded-full p-1 secondary self-start">
                    <PencilAltIcon/>
                </button>
            </div>
        {/if}
    {:else }
        <div class="m-1 p-1 px-2 mx-2">
            <TagRenderingAnswer {config} {tags} {selectedElement} {state} {layer}/>
        </div>
    {/if}
</div>
