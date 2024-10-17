<script lang="ts">
  /**
   * Show nearby images which can be clicked
   */
  import type { OsmTags } from "../../Models/OsmFeature"
  import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
  import type { SpecialVisualizationState } from "../SpecialVisualization"
  import type { P4CPicture } from "../../Logic/Web/NearbyImagesSearch"
  import LinkableImage from "./LinkableImage.svelte"
  import type { Feature, Point } from "geojson"
  import LayerConfig from "../../Models/ThemeConfig/LayerConfig"
  import Loading from "../Base/Loading.svelte"
  import AllImageProviders from "../../Logic/ImageProviders/AllImageProviders"
  import Tr from "../Base/Tr.svelte"
  import Translations from "../i18n/Translations"
  import MapillaryLink from "../BigComponents/MapillaryLink.svelte"
  import MaplibreMap from "../Map/MaplibreMap.svelte"
  import { Map as MlMap } from "maplibre-gl"
  import { MapLibreAdaptor } from "../Map/MapLibreAdaptor"
  import ShowDataLayer from "../Map/ShowDataLayer"
  import StaticFeatureSource from "../../Logic/FeatureSource/Sources/StaticFeatureSource"
  import * as geocoded_image from "../../assets/generated/layers/geocoded_image.json"
  import type { LayerConfigJson } from "../../Models/ThemeConfig/Json/LayerConfigJson"
  import { onDestroy } from "svelte"
  import { BBox } from "../../Logic/BBox"
  import PanoramaxLink from "../BigComponents/PanoramaxLink.svelte"


  export let tags: UIEventSource<OsmTags>
  export let state: SpecialVisualizationState
  export let lon: number
  export let lat: number
  export let feature: Feature

  export let linkable: boolean = true
  export let layer: LayerConfig

  let imagesProvider = state.nearbyImageSearcher

  let loadedImages = AllImageProviders.LoadImagesFor(tags).mapD(
    (loaded) => new Set(loaded.map((img) => img.url)),
  )
  let imageState = imagesProvider.getImagesAround(lon, lat)
  let result: Store<P4CPicture[]> = imageState.images.mapD(
    (pics: P4CPicture[]) =>
      pics
        .filter(
          (p: P4CPicture) =>
            !loadedImages.data.has(p.pictureUrl) && // We don't show any image which is already linked
            !p.details.isSpherical,
        )
        .slice(0, 25),
    [loadedImages],
  )

  let asFeatures = result.map(p4cs => p4cs.map(p4c => (<Feature<Point>>{
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [p4c.coordinates.lng, p4c.coordinates.lat],
    },
    properties: {
      id: p4c.pictureUrl,
      rotation: p4c.direction,
    },
  })))

  let selected = new UIEventSource<P4CPicture>(undefined)
  let selectedAsFeature = selected.mapD(s => {
    return [<Feature<Point>>{
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [s.coordinates.lng, s.coordinates.lat],
      },
      properties: {
        id: s.pictureUrl,
        selected: "yes",
        rotation: s.direction,
      },
    }]
  })

  let someLoading = imageState.state.mapD((stateRecord) =>
    Object.values(stateRecord).some((v) => v === "loading"),
  )
  let errors = imageState.state.mapD((stateRecord) =>
    Object.keys(stateRecord).filter((k) => stateRecord[k] === "error"),
  )
  let highlighted = new UIEventSource<string>(undefined)

  onDestroy(highlighted.addCallbackD(hl => {
      const p4c = result.data?.find(i => i.pictureUrl === hl)
      selected.set(p4c)
    },
  ))

  let map: UIEventSource<MlMap> = new UIEventSource<MlMap>(undefined)
  let mapProperties = new MapLibreAdaptor(map, {
    rasterLayer: state.mapProperties.rasterLayer,
    rotation: state.mapProperties.rotation,
    pitch: state.mapProperties.pitch,
    zoom: new UIEventSource<number>(16),
    location: new UIEventSource({ lon, lat }),
  })


  const geocodedImageLayer = new LayerConfig(<LayerConfigJson>geocoded_image)
  new ShowDataLayer(map, {
    features: new StaticFeatureSource(asFeatures),
    layer: geocodedImageLayer,
    zoomToFeatures: true,
    onClick: (feature) => {
      highlighted.set(feature.properties.id)
    },
  })


  ShowDataLayer.showMultipleLayers(
    map,
    new StaticFeatureSource([feature]),
    state.theme.layers,
  )

  onDestroy(
    asFeatures.addCallbackAndRunD(features => {
      if (features.length == 0) {
        return
      }
      let bbox = BBox.get(features[0])
      for (const f of features) {
        bbox = bbox.unionWith(BBox.get(f))
      }
      mapProperties.maxbounds.set(bbox.pad(4))
    }),
  )

  new ShowDataLayer(map, {
    features: new StaticFeatureSource(selectedAsFeature),
    layer: geocodedImageLayer,
    onClick: (feature) => {
      highlighted.set(feature.properties.id)
    },
  })


</script>

<div class="flex flex-col">
  {#if $result.length === 0}
    {#if $someLoading}
      <div class="m-4 flex justify-center">
        <Loading />
      </div>
    {:else}
      <Tr t={Translations.t.image.nearby.noNearbyImages} cls="alert" />
    {/if}
  {:else}
    <div class="flex w-full space-x-4 overflow-x-auto" style="scroll-snap-type: x proximity">
      {#each $result as image (image.pictureUrl)}
        <span class="w-fit shrink-0" style="scroll-snap-align: start"
              on:mouseenter={() => {highlighted.set(image.pictureUrl)}}
              on:mouseleave={() =>{ highlighted.set(undefined); selected.set(undefined)}}
        >
          <LinkableImage {tags} {image} {state} {feature} {layer} {linkable} {highlighted} />
        </span>
      {/each}
    </div>
  {/if}
  <div class="w-full flex flex-wrap justify-end gap-x-8 pt-2">
    <PanoramaxLink
      large={false}
      mapProperties={{ zoom: new ImmutableStore(16), location: new ImmutableStore({ lon, lat }) }}
    />
    <MapillaryLink
      large={false}
      mapProperties={{ zoom: new ImmutableStore(16), location: new ImmutableStore({ lon, lat }) }}
    />
  </div>


  <div class="my-2 flex justify-between">
    <div>
      {#if $someLoading && $result.length > 0}
        <Loading />
      {/if}
      {#if $errors.length > 0}
        <Tr
          cls="alert font-sm block"
          t={Translations.t.image.nearby.failed.Subs({ service: $errors.join(", ") })}
        />
      {/if}
    </div>
  </div>


  <div class="h-48">
    <MaplibreMap interactive={false} {map} {mapProperties} />
  </div>
</div>
