<script lang="ts">
    
import SchemaBasedInput from "./SchemaBasedInput.svelte";
import EditLayerState from "./EditLayerState";
import TagRenderingConfig from "../../Models/ThemeConfig/TagRenderingConfig";

export let state: EditLayerState
export let path : (number | string)[]

let schema : TagRenderingConfig

</script>

XYZ
