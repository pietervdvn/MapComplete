<script lang="ts">
    import EditLayerState from "./EditLayerState";
    import {UIEventSource} from "../../Logic/UIEventSource";
    import type {TagConfigJson} from "../../Models/ThemeConfig/Json/TagConfigJson";
    import TagInput from "./TagInput/TagInput.svelte";

    /**
     * Thin wrapper around 'TagInput' which registers the output with the state
     */
    export let path : (string | number)[]
    export let state : EditLayerState
    
    let tag: UIEventSource<TagConfigJson> = new UIEventSource<TagConfigJson>(undefined)
    
    state.register(path, tag)
</script>

<TagInput {tag} />
