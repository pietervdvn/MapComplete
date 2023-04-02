<script lang="ts">
  /**
   * The slotted element will be shown on top, with a lower-opacity border
   */
</script>

<div class="absolute top-0 right-0 w-screen h-screen overflow-auto" style="background-color: #00000088">
  <div class="flex flex-col m-4 sm:m-6 md:m-8 p-4 sm:p-6 md:m-8 normal-background rounded normal-background">
    <slot></slot>
  </div>
</div>
