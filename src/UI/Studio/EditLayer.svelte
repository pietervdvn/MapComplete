<script lang="ts">

    import EditLayerState from "./EditLayerState";
    import layerSchemaRaw from "../../../assets/layerconfigmeta.json"
    import Region from "./Region.svelte";
    import TabbedGroup from "../Base/TabbedGroup.svelte";
    import {UIEventSource} from "../../Logic/UIEventSource";
    import type {ConfigMeta} from "./configMeta";
    import {Utils} from "../../Utils";

    import drinking_water from "../../../assets/layers/drinking_water/drinking_water.json"

    const layerSchema: ConfigMeta[] = layerSchemaRaw
    let state = new EditLayerState(layerSchema)
    state.configuration.setData(drinking_water)
    /**
     * Blacklist for the general area tab
     */
    const regionBlacklist = ["hidden",undefined,"infobox", "tagrenderings","maprendering", "editing"]
    const allNames =  Utils.Dedup(layerSchema.map(meta => meta.hints.group))

    const perRegion: Record<string, ConfigMeta[]> = {}
    for (const region of allNames) {
        perRegion[region] = layerSchema.filter(meta => meta.hints.group === region)
    }
    
    const baselayerRegions: string[] = ["Basic", "presets","filters","advanced","expert"]
    for (const baselayerRegion of baselayerRegions) {
        if(perRegion[baselayerRegion] === undefined){
            console.error("BaseLayerRegions in editLayer: no items have group '"+baselayerRegion+'"')
        }
    }
    const leftoverRegions : string[] = allNames.filter(r => regionBlacklist.indexOf(r) <0 && baselayerRegions.indexOf(r) <0 )
</script>

<h3>Edit layer</h3>

<div class="m4">
    {allNames}
<TabbedGroup tab={new UIEventSource(1)}>
    <div slot="title0">General properties</div>
    <div class="flex flex-col" slot="content0">
        {#each baselayerRegions as region}
            <Region {state} configs={perRegion[region]} title={region}/>
        {/each}
        
        {#each leftoverRegions as region}
            <Region {state} configs={perRegion[region]} title={region}/>
        {/each}
    </div>

    <div slot="title1">Information panel (questions and answers)</div>
    <div slot="content1">
        <Region {state} configs={perRegion["title"]} title="Title"/>
        <Region {state} configs={perRegion["tagrenderings"]} title="Infobox"/>
        <Region {state} configs={perRegion["editing"]} title="Other editing elements"/>
    </div>

    <div slot="title2">Rendering on the map</div>
    <div slot="content2">
        TODO: rendering on the map
    </div>
</TabbedGroup>

</div>
