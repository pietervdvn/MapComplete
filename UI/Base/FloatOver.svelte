<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import {XCircleIcon} from "@rgossiaux/svelte-heroicons/solid";

    /**
     * The slotted element will be shown on top, with a lower-opacity border
     */
    const dispatch = createEventDispatcher<{ close }>();
</script>

<div class="absolute top-0 right-0 w-screen h-screen p-4 md:p-6" style="background-color: #00000088">
    <div class="content normal-background">
        <div class="rounded-xl h-full">
            <slot></slot>
        </div>
        <slot name="close-button">
            <!-- The close button is placed _after_ the default slot in order to always paint it on top -->
            <div class="w-8 h-8 absolute right-10 top-10 cursor-pointer" on:click={() => dispatch("close")}>
                <XCircleIcon/>
            </div>
        </slot>
    </div>
</div>


<style>
  .content {
    height: calc( 100vh - 2rem );
    border-radius: 0.5rem;
    overflow-x: auto;
    box-shadow: 0 0 1rem #00000088;
  }
</style>
