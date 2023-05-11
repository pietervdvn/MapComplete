<script lang="ts">
    
import ToSvelte from "./ToSvelte.svelte";
import Svg from "../../Svg";

export let generateShareData: () => {
    text: string
    title: string
    url: string
}
function share(){
    alert("Sharing...")
    if (!navigator.share) {
        console.log("web share not supported")
        return;
    }
    navigator
        .share(this._shareData())
        .then(() => {
            console.log("Thanks for sharing!")
        })
        .catch((err) => {
            console.log(`Couldn't share because of`, err.message)
        })
}

</script>


<button on:click={share} class="secondary w-8 h-8 m-0 p-0">
    <slot name="content">
        <ToSvelte construct={Svg.share_svg().SetClass("w-7 h-7 p-1")}/>
    </slot>
</button>
