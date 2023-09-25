<script lang="ts">/**
 * Shows an 'upload'-button which will start the upload for this feature
 */

import type { SpecialVisualizationState } from "../SpecialVisualization";
import type { Feature } from "geojson";
import { Store } from "../../Logic/UIEventSource";
import type { OsmTags } from "../../Models/OsmFeature";
import { ImageUploader } from "../../Logic/ImageProviders/ImageUploader";
import LoginToggle from "../Base/LoginToggle.svelte";
import Translations from "../i18n/Translations";
import Tr from "../Base/Tr.svelte";
import { ImageUploadManager } from "../../Logic/ImageProviders/ImageUploadManager";

export let state: SpecialVisualizationState;
export let feature: Feature;

export let tags: Store<OsmTags>;
export let state: SpecialVisualizationState;
export let lon: number;
export let lat: number;
const t = Translations.t.image

</script>


<LoginToggle>
  
  <Tr slot="not-logged-in" t={t.pleaseLogin}/>
  
</LoginToggle>
