<script lang="ts">/**
 * Input helper to create a tag. The tag is JSON-encoded
 */
import { UIEventSource } from "../../../Logic/UIEventSource";
import BasicTagInput from "../../Studio/TagInput/BasicTagInput.svelte";

export let value: UIEventSource<undefined | string>;
export let uploadableOnly: boolean;
export let overpassSupportNeeded: boolean;

/**
 * Only show the taginfo-statistics if they are suspicious (thus: less then 250 entries)
 */
export let silent: boolean = false;


</script>


<BasicTagInput {overpassSupportNeeded} {silent} tag={value} {uploadableOnly} />
