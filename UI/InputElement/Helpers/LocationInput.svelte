<script lang="ts">
  import { Store, UIEventSource } from "../../../Logic/UIEventSource";
  import type { MapProperties } from "../../../Models/MapProperties";
  import { Map as MlMap } from "maplibre-gl";
  import { MapLibreAdaptor } from "../../Map/MapLibreAdaptor";
  import MaplibreMap from "../../Map/MaplibreMap.svelte";
  import Svg from "../../../Svg";
  import ToSvelte from "../../Base/ToSvelte.svelte";
  import DragInvitation from "../../Base/DragInvitation.svelte";

  /**
   * A visualisation to pick a direction on a map background
   */
  export let value: UIEventSource<{lon: number, lat: number}>;
  export let mapProperties: Partial<MapProperties> & { readonly location: UIEventSource<{ lon: number; lat: number }> };
  /**
   * Called when setup is done, cna be used to add layrs to the map
   */
  export let onCreated : (value: Store<{lon: number, lat: number}> , map: Store<MlMap>, mapProperties: MapProperties ) => void
  
  let map: UIEventSource<MlMap> = new UIEventSource<MlMap>(undefined);
  let mla = new MapLibreAdaptor(map, mapProperties);
  mla.allowMoving.setData(true)
  mla.allowZooming.setData(true)

  if(onCreated){
    onCreated(value, map, mla)
  }
</script>

<div class="relative h-32 cursor-pointer overflow-hidden">
  <div class="w-full h-full absolute top-0 left-0 cursor-pointer">
    <MaplibreMap {map} attribution={false}></MaplibreMap>
  </div>

  <div class="w-full h-full absolute top-0 left-0 p-8 pointer-events-none opacity-50">
      <ToSvelte construct={() => Svg.move_arrows_svg().SetClass("h-full")}></ToSvelte>
  </div>
  
  <DragInvitation></DragInvitation>

</div>
