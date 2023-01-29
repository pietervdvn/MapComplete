<!-- A contact link indicates how a mapper can contact their local community -->
<script lang="ts">
    import {Store} from "../../Logic/UIEventSource";

    <!-- The _properties_ of a community feature -->
    export let country: Store<{ resources; nameEn: string }>
    let resources = country.mapD(country => Object.values(country?.resources ?? {}))

</script>

<div>
    {#if $country?.nameEn}
        <h3>{$country?.nameEn}</h3>
    {/if}
    {#each $resources as resource}
        <div class="flex link-underline items-center">
            <img
                    class="w-8 h-8 m-2"
                    src={"https://raw.githubusercontent.com/osmlab/osm-community-index/main/dist/img/" +
      resource.type +
      ".svg"}
            />
            <div class="flex flex-col">
                <a href={resource.resolved.url} target="_blank" class="font-bold">
                    {resource.resolved.name ?? resource.resolved.url}
                </a>
                {resource.resolved?.description}
            </div>
        </div>
    {/each}
</div>
