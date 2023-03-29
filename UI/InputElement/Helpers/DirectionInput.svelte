<script lang="ts">
  import { UIEventSource } from "../../../Logic/UIEventSource";
  import type { MapProperties } from "../../../Models/MapProperties";
  import { Map as MlMap } from "maplibre-gl";
  import { MapLibreAdaptor } from "../../Map/MapLibreAdaptor";
  import MaplibreMap from "../../Map/MaplibreMap.svelte";
  import ToSvelte from "../../Base/ToSvelte.svelte";
  import Svg from "../../../Svg.js";

  /**
   * A visualisation to pick a direction on a map background
   */
  export let value: UIEventSource<undefined | number>;
  export let mapProperties: Partial<MapProperties> & { readonly location: UIEventSource<{ lon: number; lat: number }> };
  let map: UIEventSource<MlMap> = new UIEventSource<MlMap>(undefined);
  let mla = new MapLibreAdaptor(map, mapProperties);
  mla.allowMoving.setData(false)
  mla.allowZooming.setData(false)
  let directionElem: HTMLElement | undefined;
  $: value.addCallbackAndRunD(degrees => {
    console.log("Degrees are", degrees, directionElem);
    if (directionElem === undefined) {
      return;
    }
    directionElem.style.rotate = degrees + "deg";
  });

  let mainElem : HTMLElement
  function onPosChange(x: number, y: number) {
    const rect = mainElem.getBoundingClientRect();
    const dx = -(rect.left + rect.right) / 2 + x;
    const dy = (rect.top + rect.bottom) / 2 - y;
    const angle = (180 * Math.atan2(dy, dx)) / Math.PI;
    const angleGeo = Math.floor((450 - angle) % 360);
    value.setData(angleGeo);
  }

  let isDown = false;
</script>

<div bind:this={mainElem} class="relative w-48 h-48 cursor-pointer overflow-hidden"
     on:click={e => onPosChange(e.x, e.y)}
     on:mousedown={e => {
         isDown = true
         onPosChange(e.clientX, e.clientY)
       } }
     on:mousemove={e => {
      if(isDown){
      onPosChange(e.clientX, e.clientY)
        
      }}}

     on:mouseup={() => {
         isDown = false
       } }
     on:touchmove={e => onPosChange(e.touches[0].clientX, e.touches[0].clientY)}


     on:touchstart={e => onPosChange(e.touches[0].clientX, e.touches[0].clientY)}>
  <div class="w-full h-full absolute top-0 left-0 cursor-pointer">
    <MaplibreMap {map} attribution={false}></MaplibreMap>
  </div>

  <div bind:this={directionElem} class="absolute w-full h-full top-0 left-0 border border-red-500">

    <ToSvelte construct={ Svg.direction_stroke_svg}>

    </ToSvelte>
  </div>
</div>
