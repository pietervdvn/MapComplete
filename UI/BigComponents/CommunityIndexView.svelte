<script lang="ts">
     import {BBox} from "../../Logic/BBox";
     import {Store} from "../../Logic/UIEventSource";
     import Loc from "../../Models/Loc";

     export let bbox: Store<BBox>
     export let currentLocation: Store<Loc>
     bbox.mapD(bbox => {
         if(currentLocation.data.zoom <= 6){
             // only return the global data
         }
         return bbox.expandToTileBounds(6);
     }, [currentLocation])
</script>
