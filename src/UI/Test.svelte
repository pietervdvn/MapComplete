<script lang="ts">
  // Testing grounds
  import MarkAsFavourite from "./Popup/MarkAsFavourite.svelte";
  import { UIEventSource } from "../Logic/UIEventSource";
  import { OsmConnection } from "../Logic/Osm/OsmConnection";
  
  const osmConnection = new OsmConnection({attemptLogin: true})
  function resetFavs(){
    osmConnection.preferencesHandler.removeAllWithPrefix("mapcomplete-favourite-")
    console.log("CLEARED!")
  }
  
</script>


<button on:click={() => resetFavs()} >Clear</button>
