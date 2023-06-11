<script lang="ts">
  /**
   * Shows a 'floorSelector' and maps the selected floor onto a global filter
   */
  import LayerState from "../../Logic/State/LayerState";
  import FloorSelector from "../InputElement/Helpers/FloorSelector.svelte";
  import { Store, UIEventSource } from "../../Logic/UIEventSource";

  export let layerState: LayerState;
  export let floors: Store<string[]>;
  export let zoom: Store<number>;
  const maxZoom = 16

  let selectedFloor: UIEventSource<string> = new UIEventSource<string>(undefined);
  
  selectedFloor.stabilized(5).map(floor => {
    if(floors.data === undefined || floors.data.length <= 1 || zoom.data < maxZoom){
      // Only a single floor is visible -> disable the 'level' global filter
      // OR we might have zoomed out to much ant want to show all
      layerState.setLevelFilter(undefined)
    }else{
      layerState.setLevelFilter(floor)
    }
  }, [floors, zoom])
  
</script>
{#if $zoom >= maxZoom}
<FloorSelector {floors} value={selectedFloor} />
  {/if}
