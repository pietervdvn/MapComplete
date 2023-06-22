<script lang="ts">

    import ValidatedInput from "../../InputElement/ValidatedInput.svelte";
    import {UIEventSource} from "../../../Logic/UIEventSource";
    import {onDestroy} from "svelte";
    import Tr from "../../Base/Tr.svelte";
    import {TagUtils} from "../../../Logic/Tags/TagUtils";
    import TagInfoStats from "../TagInfoStats.svelte";

    export let tag: UIEventSource<string> = new UIEventSource<string>(undefined)
    export let uploadableOnly: boolean
    export let overpassSupportNeeded: boolean
    tag.addCallback(tag => console.log("Current tag is", tag))

    console.log({uploadableOnly, overpassSupportNeeded})


    let feedbackGlobal = tag.map(tag => {
        if (!tag) {
            return undefined
        }
        try {
            TagUtils.Tag(tag)
            return undefined
        } catch (e) {
            return e
        }

    })

    let feedbackKey = new UIEventSource<string>(undefined)
    let keyValue = new UIEventSource<string>(undefined)


    let feedbackValue = new UIEventSource<string>(undefined)
    /**
     * The value of the tag. The name is a bit confusing
     */
    let valueValue = new UIEventSource<string>(undefined)


    let mode: string = "="
    let modes: string[] = []

    for (const k in TagUtils.modeDocumentation) {
        const docs = TagUtils.modeDocumentation[k]
        if (overpassSupportNeeded && !docs.overpassSupport) {
            continue
        }
        if (uploadableOnly && !docs.uploadable) {
            continue
        }
        modes.push(k)
    }
    if (!uploadableOnly && !overpassSupportNeeded) {
        modes.push(...TagUtils.comparators.map(c => c[0]))
    }

    onDestroy(valueValue.addCallbackAndRun(setTag))
    onDestroy(keyValue.addCallbackAndRun(setTag))

    $: {
        setTag(mode)
    }

    function setTag(_) {
        const k = keyValue.data
        const v = valueValue.data
        tag.setData(k + mode + v)
    }

</script>


<div>

    <ValidatedInput feedback={feedbackKey} placeholder="The key of the tag" type="key"
                    value={keyValue}></ValidatedInput>
    <select bind:value={mode}>
        {#each modes as option}
            <option value={option}>
                {option}
            </option>
        {/each}
    </select>
    <ValidatedInput feedback={feedbackValue} placeholder="The value of the tag" type="string"
                    value={valueValue}></ValidatedInput>

    {#if $feedbackKey}
        <Tr cls="alert" t={$feedbackKey}/>
    {:else if $feedbackValue}
        <Tr cls="alert" t={$feedbackValue}/>
    {:else if $feedbackGlobal}
        <Tr cls="alert" t={$feedbackGlobal}/>
    {/if}

    <TagInfoStats {tag}/>
</div>
