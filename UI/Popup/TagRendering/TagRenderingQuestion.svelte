<script lang="ts">
    import {Store, UIEventSource} from "../../../Logic/UIEventSource";
    import type {SpecialVisualizationState} from "../../SpecialVisualization";
    import Tr from "../../Base/Tr.svelte";
    import type {Feature} from "geojson";
    import type {Mapping} from "../../../Models/ThemeConfig/TagRenderingConfig";
    import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig";
    import {TagsFilter} from "../../../Logic/Tags/TagsFilter";
    import FreeformInput from "./FreeformInput.svelte";
    import Translations from "../../i18n/Translations.js";
    import ChangeTagAction from "../../../Logic/Osm/Actions/ChangeTagAction";
    import {createEventDispatcher} from "svelte";
    import LayerConfig from "../../../Models/ThemeConfig/LayerConfig";
    import SpecialTranslation from "./SpecialTranslation.svelte";
    import TagHint from "../TagHint.svelte";
    import LoginToggle from "../../Base/LoginToggle.svelte";
    import SubtleButton from "../../Base/SubtleButton.svelte";
    import Loading from "../../Base/Loading.svelte";
    import TagRenderingMappingInput from "./TagRenderingMappingInput.svelte";
    import {Translation} from "../../i18n/Translation";

    export let config: TagRenderingConfig;
    export let tags: UIEventSource<Record<string, string>>;
    export let selectedElement: Feature;
    export let state: SpecialVisualizationState;
    export let layer: LayerConfig;

    let feedback: UIEventSource<Translation> = new UIEventSource<Translation>(undefined);

    // Will be bound if a freeform is available
    let freeformInput = new UIEventSource<string>(tags?.[config.freeform?.key]);
    let selectedMapping: number = undefined;
    let checkedMappings: boolean[];
    $: {
        mappings = config.mappings?.filter(m => {
            if (typeof m.hideInAnswer === "boolean") {
                return !m.hideInAnswer
            }
            return m.hideInAnswer.matchesProperties(tags.data)
        })
        // We received a new config -> reinit
        if (config.mappings?.length > 0 && (checkedMappings === undefined || checkedMappings?.length < config.mappings.length)) {
            checkedMappings = [...config.mappings.map(_ => false), false /*One element extra in case a freeform value is added*/];
        }
        if (config.freeform?.key) {
            freeformInput.setData(tags.data[config.freeform.key]);
        } else {
            freeformInput.setData(undefined)
        }
        feedback.setData(undefined)
    }
    let selectedTags: TagsFilter = undefined;


    let mappings: Mapping[] = config?.mappings;
    let searchTerm: Store<string> = new UIEventSource("")

    $: {
        try {
            selectedTags = config?.constructChangeSpecification($freeformInput, selectedMapping, checkedMappings, tags.data);
        } catch (e) {
            console.error("Could not calculate changeSpecification:", e);
            selectedTags = undefined;
        }
    }


    let dispatch = createEventDispatcher<{
        "saved": {
            config: TagRenderingConfig,
            applied: TagsFilter
        }
    }>();

    function onSave() {
        if(selectedTags === undefined){
            return
        }
        if (layer.source === null) {
            /**
             * This is a special, priviliged layer.
             * We simply apply the tags onto the records
             */
            const kv = selectedTags.asChange(tags.data);
            for (const {k, v} of kv) {
                if (v === undefined) {
                    delete tags.data[k];
                } else {
                    tags.data[k] = v;
                }
            }
            tags.ping();
            return;
        }

        dispatch("saved", {config, applied: selectedTags});
        const change = new ChangeTagAction(
            tags.data.id,
            selectedTags,
            tags.data,
            {
                theme: state.layout.id,
                changeType: "answer"
            }
        );
        freeformInput.setData(undefined);
        selectedMapping = undefined;
        selectedTags = undefined;

        change.CreateChangeDescriptions().then(changes =>
            state.changes.applyChanges(changes)
        ).catch(console.error);
    }

    let featureSwitchIsTesting = state.featureSwitchIsTesting
    let featureSwitchIsDebugging = state.featureSwitches.featureSwitchIsDebugging
    let showTags = state.userRelatedState.showTags
</script>

{#if config.question !== undefined}
    <div class="interactive border-interactive p-1 px-2 flex flex-col">
        <div class="flex justify-between">
            <span class="font-bold">
              <SpecialTranslation t={config.question} {tags} {state} {layer}
                                  feature={selectedElement}></SpecialTranslation>
            </span>
            <slot name="upper-right"/>

        </div>

        {#if config.questionhint}
            <div>
                <SpecialTranslation t={config.questionhint} {tags} {state} {layer}
                                    feature={selectedElement}></SpecialTranslation>
            </div>
        {/if}

        {#if config.mappings?.length >= 8}
            <div class="flex w-full">
                <img src="./assets/svg/search.svg" class="w-6 h-6"/>
                <input type="text" bind:value={$searchTerm} class="w-full">
            </div>
        {/if}

        {#if config.freeform?.key && !(mappings?.length > 0)}
            <!-- There are no options to choose from, simply show the input element: fill out the text field -->
            <FreeformInput {config} {tags} {feedback} feature={selectedElement} value={freeformInput}/>
        {:else if mappings !== undefined && !config.multiAnswer}
            <!-- Simple radiobuttons as mapping -->
            <div class="flex flex-col">
                {#each config.mappings as mapping, i (mapping.then)}
                    <!-- Even though we have a list of 'mappings' already, we still iterate over the list as to keep the original indices-->
                    <TagRenderingMappingInput {mapping} {tags} {state} {selectedElement}
                                              {layer} {searchTerm} mappingIsSelected={selectedMapping === i}>
                        <input type="radio" bind:group={selectedMapping} name={"mappings-radio-"+config.id}
                               value={i}>

                    </TagRenderingMappingInput>
                {/each}
                {#if config.freeform?.key}
                    <label class="flex">
                        <input type="radio" bind:group={selectedMapping} name={"mappings-radio-"+config.id}
                               value={config.mappings?.length}>
                        <FreeformInput {config} {tags} feature={selectedElement} value={freeformInput}
                                       on:selected={() => selectedMapping = config.mappings?.length }/>
                    </label>
                {/if}
            </div>
        {:else if mappings !== undefined && config.multiAnswer}
            <!-- Multiple answers can be chosen: checkboxes -->
            <div class="flex flex-col">
                {#each config.mappings as mapping, i (mapping.then)}
                    <TagRenderingMappingInput {mapping} {tags} {state} {selectedElement}
                                              {layer} {searchTerm} mappingIsSelected={checkedMappings[i]}>
                        <input type="checkbox" name={"mappings-checkbox-"+config.id+"-"+i}
                               bind:checked={checkedMappings[i]}>
                    </TagRenderingMappingInput>
                {/each}
                {#if config.freeform?.key}
                    <label class="flex">
                        <input type="checkbox" name={"mappings-checkbox-"+config.id+"-"+config.mappings?.length}
                               bind:checked={checkedMappings[config.mappings.length]}>
                        <FreeformInput {config} {tags} {feedback} feature={selectedElement} value={freeformInput}
                                       on:selected={() => checkedMappings[config.mappings.length] = true}/>
                    </label>
                {/if}
            </div>
        {/if}

        <LoginToggle {state}>
            <Loading slot="loading"/>
            <SubtleButton slot="not-logged-in" on:click={() => state.osmConnection.AttemptLogin()}>
                <img slot="image" src="./assets/svg/login.svg" class="w-8 h-8"/>
                <Tr t={Translations.t.general.loginToStart} slot="message"></Tr>
            </SubtleButton>
            {#if $feedback !== undefined}
                <div class="alert">
                    <Tr t={$feedback}/>
                </div>
            {/if}
            <div class="flex justify-end flex-wrap-reverse sm:flex-nowrap items-stretch">
                <!-- TagRenderingQuestion-buttons -->
                <slot name="cancel"></slot>
                <button on:click={onSave} class={(selectedTags === undefined ? "disabled" : "button-shadow")+" primary"}>
                    <Tr t={Translations.t.general.save}></Tr>
                </button>
            </div>
            {#if $showTags === "yes" || $showTags === "always" || $featureSwitchIsTesting || $featureSwitchIsDebugging}
                <span class="flex justify-between flex-wrap">
                    <TagHint {state} tags={selectedTags}></TagHint>
                    <span class="flex flex-wrap">
                        {#if $featureSwitchIsTesting}
                        Testmode &nbsp;
                        {/if}
                        {#if $featureSwitchIsTesting || $featureSwitchIsDebugging}
                            <span class="subtle">{config.id}</span>
                        {/if}
                           
                    </span>
                </span>
            {/if}
        </LoginToggle>
    </div>
{/if}
