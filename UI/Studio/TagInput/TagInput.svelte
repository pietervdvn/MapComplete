<script lang="ts">/**
 * An element input a tag; has `and`, `or`, `regex`, ...
 */
import type {TagConfigJson} from "../../../Models/ThemeConfig/Json/TagConfigJson";
import {UIEventSource} from "../../../Logic/UIEventSource";
import TagExpression from "../TagExpression.svelte";


export let tag: UIEventSource<TagConfigJson>
export let uploadableOnly: boolean
export let overpassSupportNeeded: boolean
</script>

<div class="m-4">
    <TagExpression {overpassSupportNeeded} {tag} {uploadableOnly}/>
</div>
