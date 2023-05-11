<script lang="ts">
    import {UIEventSource} from "../../../Logic/UIEventSource";
    import {Translation} from "../../i18n/Translation";
    import ValidatedInput from "../../InputElement/ValidatedInput.svelte";
    import Tr from "../../Base/Tr.svelte";
    import TagRenderingConfig from "../../../Models/ThemeConfig/TagRenderingConfig";
    import Inline from "./Inline.svelte";
    import {createEventDispatcher, onDestroy} from "svelte";
    import InputHelper from "../../InputElement/InputHelper.svelte";
    import type {Feature} from "geojson";

    export let value: UIEventSource<string>;
    export let config: TagRenderingConfig;
    export let tags: UIEventSource<Record<string, string>>;

    export let feature: Feature = undefined;

    let placeholder = config.freeform?.placeholder
    $: {
        placeholder = config.freeform?.placeholder
    }

    export let feedback: UIEventSource<Translation> = new UIEventSource<Translation>(undefined);

    let dispatch = createEventDispatcher<{ "selected" }>();
    onDestroy(value.addCallbackD(() => {
        dispatch("selected")
    }))

    function getCountry() {
        return tags.data["_country"]
    }
</script>

<div class="inline-flex flex-col">

    {#if config.freeform.inline}
        <Inline key={config.freeform.key} {tags} template={config.render}>
            <ValidatedInput {feedback} {getCountry} on:selected={() => dispatch("selected")}
                            type={config.freeform.type} {placeholder} {value}></ValidatedInput>
        </Inline>
    {:else}
        <ValidatedInput {feedback} {getCountry} on:selected={() => dispatch("selected")}
                        type={config.freeform.type} {placeholder} {value}></ValidatedInput>

    {/if}
    <InputHelper args={config.freeform.helperArgs} {feature} type={config.freeform.type} {value}/>
</div>
