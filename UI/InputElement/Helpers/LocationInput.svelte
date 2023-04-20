<script lang="ts">
  import { Store, UIEventSource } from "../../../Logic/UIEventSource";
  import type { MapProperties } from "../../../Models/MapProperties";
  import { Map as MlMap } from "maplibre-gl";
  import { MapLibreAdaptor } from "../../Map/MapLibreAdaptor";
  import MaplibreMap from "../../Map/MaplibreMap.svelte";
  import DragInvitation from "../../Base/DragInvitation.svelte";

  /**
   * A visualisation to pick a direction on a map background
   */
  export let value: UIEventSource<{lon: number, lat: number}>;
  export let mapProperties: Partial<MapProperties> & { readonly location: UIEventSource<{ lon: number; lat: number }> } = undefined;
  /**
   * Called when setup is done, can be used to add more layers to the map
   */
  export let onCreated : (value: Store<{lon: number, lat: number}> , map: Store<MlMap>, mapProperties: MapProperties ) => void = undefined
  
  export let map: UIEventSource<MlMap> = new UIEventSource<MlMap>(undefined);
  let mla = new MapLibreAdaptor(map, mapProperties);
  mapProperties.location.syncWith(value)
  if(onCreated){
    onCreated(value, map, mla)
  }
</script>

<div class="relative h-full min-h-32 cursor-pointer overflow-hidden">
  <div class="w-full h-full absolute top-0 left-0 cursor-pointer">
    <MaplibreMap {map} attribution={false}></MaplibreMap>
  </div>

  <div class="w-full h-full absolute top-0 left-0 p-8 pointer-events-none opacity-50 flex items-center">
    <img src="./assets/svg/move-arrows.svg" class="h-full max-h-24"/>
  </div>
  
  <DragInvitation hideSignal={mla.location.stabilized(3000)}></DragInvitation>

</div>
