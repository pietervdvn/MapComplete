<script lang="ts">
  import { UIEventSource } from "../Logic/UIEventSource";
  import { Map as MlMap } from "maplibre-gl";
  import MaplibreMap from "./Map/MaplibreMap.svelte";
  import { MapLibreAdaptor } from "./Map/MapLibreAdaptor";
  import LayoutConfig from "../Models/ThemeConfig/LayoutConfig";
  import InitialMapPositioning from "../Logic/Actors/InitialMapPositioning";
  import { GeoLocationState } from "../Logic/State/GeoLocationState";
  import FeatureSwitchState from "../Logic/State/FeatureSwitchState";
  import { OsmConnection } from "../Logic/Osm/OsmConnection";
  import { QueryParameters } from "../Logic/Web/QueryParameters";
  import UserRelatedState from "../Logic/State/UserRelatedState";
  import GeoLocationHandler from "../Logic/Actors/GeoLocationHandler";
  import { ElementStorage } from "../Logic/ElementStorage";
  import { Changes } from "../Logic/Osm/Changes";
  import ChangeToElementsActor from "../Logic/Actors/ChangeToElementsActor";
  import PendingChangesUploader from "../Logic/Actors/PendingChangesUploader";
  import SelectedElementTagsUpdater from "../Logic/Actors/SelectedElementTagsUpdater";
  import MapControlButton from "./Base/MapControlButton.svelte";
  import ToSvelte from "./Base/ToSvelte.svelte";
  import Svg from "../Svg";
  import If from "./Base/If.svelte";
  import { GeolocationControl } from "./BigComponents/GeolocationControl.js";
  import FeaturePipeline from "../Logic/FeatureSource/FeaturePipeline";
  import { BBox } from "../Logic/BBox";
  import ShowDataLayer from "./Map/ShowDataLayer";
  import StaticFeatureSource from "../Logic/FeatureSource/Sources/StaticFeatureSource";

  export let layout: LayoutConfig;

  const maplibremap: UIEventSource<MlMap> = new UIEventSource<MlMap>(undefined);
  const initial = new InitialMapPositioning(layout);
  const mapproperties = new MapLibreAdaptor(maplibremap, initial);
  const geolocationState = new GeoLocationState();

  const featureSwitches = new FeatureSwitchState(layout);

  const osmConnection = new OsmConnection({
    dryRun: featureSwitches.featureSwitchIsTesting,
    fakeUser: featureSwitches.featureSwitchFakeUser.data,
    oauth_token: QueryParameters.GetQueryParameter(
      "oauth_token",
      undefined,
      "Used to complete the login"
    ),
    osmConfiguration: <"osm" | "osm-test">featureSwitches.featureSwitchApiURL.data
  });
  const userRelatedState = new UserRelatedState(osmConnection, layout?.language);
  const selectedElement = new UIEventSource<any>(undefined, "Selected element");
  const geolocation = new GeoLocationHandler(geolocationState, selectedElement, mapproperties, userRelatedState.gpsLocationHistoryRetentionTime);

  const allElements = new ElementStorage();
  const changes = new Changes({
    allElements,
    osmConnection,
    historicalUserLocations: geolocation.historicalUserLocations
  }, layout?.isLeftRightSensitive() ?? false);
  
  Map
  
  {
    // Various actors that we don't need to reference 
    new ChangeToElementsActor(changes, allElements);
    new PendingChangesUploader(changes, selectedElement);
    new SelectedElementTagsUpdater({
      allElements, changes, selectedElement, layoutToUse: layout, osmConnection
    });
    // Various initial setup
    userRelatedState.markLayoutAsVisited(layout);
    if(layout?.lockLocation){
      const bbox = new BBox(layout.lockLocation)
      mapproperties.maxbounds.setData(bbox)
      ShowDataLayer.showRange(
        maplibremap,
        new StaticFeatureSource([bbox.asGeoJson({})]),
        featureSwitches.featureSwitchIsTesting
      )
    }
    
  }
</script>


<div class="h-screen w-screen absolute top-0 left-0 border-3 border-red-500">
  <MaplibreMap class="w-full h-full border border-black" map={maplibremap}></MaplibreMap>
</div>

<div class="absolute top-0 left-0">
  <!-- Top-left elements -->
</div>

<div class="absolute bottom-0 left-0">
</div>

<div class="absolute bottom-0 right-0 mb-4 mr-4">

  <If condition={mapproperties.allowMoving}>
    <MapControlButton on:click={() => mapproperties.zoom.update(z => z+1)}>
      <ToSvelte class="w-7 h-7 block" construct={Svg.plus_ui}></ToSvelte>
    </MapControlButton>
    <MapControlButton on:click={() => mapproperties.zoom.update(z => z-1)}>
      <ToSvelte class="w-7 h-7 block" construct={Svg.min_ui}></ToSvelte>
    </MapControlButton>
  </If>
  <If condition={featureSwitches.featureSwitchGeolocation}>
    <MapControlButton>
      <ToSvelte construct={() => new GeolocationControl(geolocation, mapproperties).SetClass("block w-8 h-8")}></ToSvelte>
    </MapControlButton>
  </If>
</div>

<div class="absolute top-0 right-0">
</div>

