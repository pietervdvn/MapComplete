<script lang="ts">

    import EditLayerState from "./EditLayerState";
    import layerSchemaRaw from "../../assets/layerconfigmeta.json"
    import Region from "./Region.svelte";
    import TabbedGroup from "../Base/TabbedGroup.svelte";
    import {UIEventSource} from "../../Logic/UIEventSource";
    import type {ConfigMeta} from "./configMeta";
    import {Utils} from "../../Utils";


    let state = new EditLayerState()
    let layer = state.layer

    const layerSchema: ConfigMeta[] = layerSchemaRaw
    const regions = Utils.Dedup(layerSchema.map(meta => meta.hints.group))
        .filter(region => region !== undefined)

    const perRegion: Record<string, ConfigMeta[]> = {}
    for (const region of regions) {
        perRegion[region] = layerSchema.filter(meta => meta.hints.group === region)
    }
    console.log({perRegion})
</script>

<h3>Edit layer {$layer?.id}</h3>

<TabbedGroup tab={new UIEventSource(0)}>
    <div slot="title0">General properties</div>
    <div class="flex flex-col" slot="content0">
        {#each regions as region}
            <Region {state} configs={perRegion[region]} title={region}/>
        {/each}
    </div>

    <div slot="title1">Information panel (questions and answers)</div>
    <div slot="content1">
        Information panel (todo)
    </div>

    <div slot="title2">Rendering on the map</div>
    <div slot="content2">
        TODO: rendering on the map
    </div>
</TabbedGroup>
