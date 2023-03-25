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
  import { BBox } from "../Logic/BBox";
  import ShowDataLayer from "./Map/ShowDataLayer";
  import StaticFeatureSource from "../Logic/FeatureSource/Sources/StaticFeatureSource";
  import type FeatureSource from "../Logic/FeatureSource/FeatureSource";
  import LayerState from "../Logic/State/LayerState";
  import Constants from "../Models/Constants";
  import type { Feature } from "geojson";
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
  const selectedElement = new UIEventSource<Feature | undefined>(undefined, "Selected element");
  const geolocation = new GeoLocationHandler(geolocationState, selectedElement, mapproperties, userRelatedState.gpsLocationHistoryRetentionTime);

  const allElements = new ElementStorage();
  const changes = new Changes({
    allElements,
    osmConnection,
    historicalUserLocations: geolocation.historicalUserLocations
  }, layout?.isLeftRightSensitive() ?? false);
  console.log("Setting up layerstate...")
  const layerState = new LayerState(osmConnection, layout.layers, layout.id)
  {
    // Various actors that we don't need to reference 
    // TODO enable new TitleHandler(selectedElement,layout,allElements)
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


    type AddedByDefaultTypes = typeof Constants.added_by_default[number]
    /**
     * A listing which maps the layerId onto the featureSource
     */
    const empty = []
    const specialLayers : Record<AddedByDefaultTypes | "current_view", FeatureSource> = {
      "home_location": userRelatedState.homeLocation,
      gps_location: geolocation.currentUserLocation,
      gps_location_history: geolocation.historicalUserLocations,
      gps_track: geolocation.historicalUserLocationsTrack,
      selected_element: new StaticFeatureSource(selectedElement.map(f => f === undefined ? empty : [f])),
      range: new StaticFeatureSource(mapproperties.maxbounds.map(bbox => bbox === undefined ? empty : <Feature[]> [bbox.asGeoJson({id:"range"})])) ,
      current_view: new StaticFeatureSource(mapproperties.bounds.map(bbox => bbox === undefined ? empty : <Feature[]> [bbox.asGeoJson({id:"current_view"})])),
    }
    layerState.filteredLayers.get("range")?.isDisplayed?.syncWith(featureSwitches.featureSwitchIsTesting, true)
console.log("RAnge fs", specialLayers.range)
    specialLayers.range.features.addCallbackAndRun(fs => console.log("Range.features:", JSON.stringify(fs)))
    layerState.filteredLayers.forEach((flayer) => {
      const features = specialLayers[flayer.layerDef.id]
      if(features === undefined){
        return
      }
      new ShowDataLayer(maplibremap, {
        features,
        doShowLayer: flayer.isDisplayed,
        layer: flayer.layerDef,
        selectedElement
      })
    })
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
  <MapControlButton on:click={() => mapproperties.zoom.update(z => z+1)}>
    <ToSvelte class="w-7 h-7 block" construct={Svg.plus_ui}></ToSvelte>
  </MapControlButton>
  <MapControlButton on:click={() => mapproperties.zoom.update(z => z-1)}>
    <ToSvelte class="w-7 h-7 block" construct={Svg.min_ui}></ToSvelte>
  </MapControlButton>
  <If condition={featureSwitches.featureSwitchGeolocation}>
    <MapControlButton>
      <ToSvelte construct={() => new GeolocationControl(geolocation, mapproperties).SetClass("block w-8 h-8")}></ToSvelte>
    </MapControlButton>
  </If>
</div>

<div class="absolute top-0 right-0">
</div>

