<script lang="ts">
  /**
   * Thin wrapper around 'TabGroup' which binds the state
   */

  import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@rgossiaux/svelte-headlessui"
  import { UIEventSource } from "../../Logic/UIEventSource"
  import { twJoin } from "tailwind-merge"

  export let tab: UIEventSource<number>
  let tabElements: HTMLElement[] = []
  $: tabElements[$tab]?.click()
  $: {
    if (tabElements[tab.data]) {
      window.setTimeout(() => tabElements[tab.data].click(), 50)
    }
  }
</script>

<div class="tabbedgroup h-full w-full">
  <TabGroup
    class="flex h-full w-full flex-col"
    defaultIndex={1}
    on:change={(e) => {
      if (e.detail >= 0) {
        tab.setData(e.detail)
      }
    }}
  >
    <div class="interactive sticky top-0 flex items-center justify-between">
      <TabList class="flex flex-wrap">
        {#if $$slots.title1}
          <Tab class={({ selected }) => twJoin("tab", selected && "primary")}>
            <div bind:this={tabElements[0]} class="flex">
              <slot name="title0">Tab 0</slot>
            </div>
          </Tab>
        {/if}
        {#if $$slots.title1}
          <Tab class={({ selected }) => twJoin("tab", selected && "primary")}>
            <div bind:this={tabElements[1]} class="flex">
              <slot name="title1" />
            </div>
          </Tab>
        {/if}
        {#if $$slots.title2}
          <Tab class={({ selected }) => twJoin("tab", selected && "primary")}>
            <div bind:this={tabElements[2]} class="flex">
              <slot name="title2" />
            </div>
          </Tab>
        {/if}
        {#if $$slots.title3}
          <Tab class={({ selected }) => twJoin("tab", selected && "primary")}>
            <div bind:this={tabElements[3]} class="flex">
              <slot name="title3" />
            </div>
          </Tab>
        {/if}
        {#if $$slots.title4}
          <Tab class={({ selected }) => twJoin("tab", selected && "primary")}>
            <div bind:this={tabElements[4]} class="flex">
              <slot name="title4" />
            </div>
          </Tab>
        {/if}
      </TabList>
      <slot name="post-tablist" />
    </div>
    <div class="normal-background overflow-y-auto">
      <TabPanels defaultIndex={$tab}>
        <TabPanel>
          <slot name="content0">
            <div>Empty</div>
          </slot>
        </TabPanel>
        <TabPanel>
          <slot name="content1" />
        </TabPanel>
        <TabPanel>
          <slot name="content2" />
        </TabPanel>
        <TabPanel>
          <slot name="content3" />
        </TabPanel>
        <TabPanel>
          <slot name="content4" />
        </TabPanel>
      </TabPanels>
    </div>
  </TabGroup>
</div>

<style>
  .tabbedgroup {
    max-height: 100vh;
    height: 100%;
  }

  :global(.tab) {
    margin: 0.25rem;
    padding: 0.25rem;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    border-radius: 1rem;
  }

  :global(.tab .flex) {
    align-items: center;
    gap: 0.25rem;
  }

  :global(.tab span|div) {
    align-items: center;
    gap: 0.25rem;
    display: flex;
  }

  :global(.tab-selected svg) {
    fill: var(--catch-detail-color-contrast);
  }

  :global(.tab-unselected) {
    background-color: var(--background-color) !important;
    color: var(--foreground-color) !important;
  }
</style>
