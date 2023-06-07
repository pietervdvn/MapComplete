<script lang="ts">

    import {Square3Stack3dIcon} from "@babeard/svelte-heroicons/solid";
    import MapControlButton from "../Base/MapControlButton.svelte";
    import ThemeViewState from "../../Models/ThemeViewState";

    export let state: ThemeViewState
</script>

<MapControlButton on:click={() => state.guistate.backgroundLayerSelectionIsOpened.setData(true)}>
    <Square3Stack3dIcon class="w-6 h-6"/>
</MapControlButton>
