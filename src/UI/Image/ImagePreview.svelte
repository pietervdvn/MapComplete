<script lang="ts">

    /**
     * The image preview allows to drag and zoom in to the image
     */
    import panzoom from "panzoom"
    import type { ProvidedImage } from "../../Logic/ImageProviders/ImageProvider"

    export let image : ProvidedImage
    let panzoomInstance = undefined
    let panzoomEl: HTMLElement

    $: {
        if (panzoomEl) {
            panzoomInstance = panzoom(panzoomEl, { bounds: true,
                boundsPadding: 1,
                minZoom: 1,
                maxZoom: 25
            })
        } else {
            panzoomInstance?.dispose()
        }
    }

</script>

<img bind:this={panzoomEl} src={image.url}/>
