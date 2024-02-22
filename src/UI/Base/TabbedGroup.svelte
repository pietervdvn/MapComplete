<script lang="ts">
  /**
   * Thin wrapper around 'TabGroup' which binds the state
   */

  import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@rgossiaux/svelte-headlessui"
  import { ImmutableStore, Store, UIEventSource } from "../../Logic/UIEventSource"
  import { twJoin } from "tailwind-merge"

  /**
   * If a condition is given for a certain tab, it will only be shown if this condition is true.
   * E.g.
   * condition3 = new ImmutableStore(false) will always hide tab3 (the fourth tab)
   */
  const tr = new ImmutableStore(true)
  export let condition0: Store<boolean> = tr
  export let condition1: Store<boolean> = tr
  export let condition2: Store<boolean> = tr
  export let condition3: Store<boolean> = tr
  export let condition4: Store<boolean> = tr
  export let condition5: Store<boolean> = tr
  export let condition6: Store<boolean> = tr
  export let tab: UIEventSource<number> = new UIEventSource<number>(0)
  let tabElements: HTMLElement[] = []
  $: tabElements[$tab]?.click()
  $: {
    if (tabElements[tab.data]) {
      window.setTimeout(() => tabElements[tab.data].click(), 50)
    }
  }
  export function getTab() {
    return tab
  }
</script>

<div class="tabbedgroup flex h-full w-full">
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
        {#if $$slots.title0}
          <Tab
            class={({ selected }) => twJoin("tab", selected && "primary", !$condition0 && "hidden")}
          >
            <div bind:this={tabElements[0]} class="flex">
              <slot name="title0">Tab 0</slot>
            </div>
          </Tab>
        {/if}
        {#if $$slots.title1}
          <Tab
            class={({ selected }) => twJoin("tab", selected && "primary", !$condition1 && "hidden")}
          >
            <div bind:this={tabElements[1]} class="flex">
              <slot name="title1" />
            </div>
          </Tab>
        {/if}
        {#if $$slots.title2}
          <Tab
            class={({ selected }) => twJoin("tab", selected && "primary", !$condition2 && "hidden")}
          >
            <div bind:this={tabElements[2]} class="flex">
              <slot name="title2" />
            </div>
          </Tab>
        {/if}
        {#if $$slots.title3}
          <Tab
            class={({ selected }) => twJoin("tab", selected && "primary", !$condition3 && "hidden")}
          >
            <div bind:this={tabElements[3]} class="flex">
              <slot name="title3" />
            </div>
          </Tab>
        {/if}
        {#if $$slots.title4}
          <Tab
            class={({ selected }) => twJoin("tab", selected && "primary", !$condition4 && "hidden")}
          >
            <div bind:this={tabElements[4]} class="flex">
              <slot name="title4" />
            </div>
          </Tab>
        {/if}
        {#if $$slots.title5}
          <Tab
            class={({ selected }) => twJoin("tab", selected && "primary", !$condition5 && "hidden")}
          >
            <div bind:this={tabElements[5]} class="flex">
              <slot name="title5" />
            </div>
          </Tab>
        {/if}
        {#if $$slots.title6}
          <Tab
            class={({ selected }) => twJoin("tab", selected && "primary", !$condition6 && "hidden")}
          >
            <div bind:this={tabElements[6]} class="flex">
              <slot name="title6" />
            </div>
          </Tab>
        {/if}
      </TabList>
      <slot name="post-tablist" />
    </div>
    <div class="normal-background h-full overflow-y-auto">
      <TabPanels class="tabpanels" defaultIndex={$tab}>
        <TabPanel class="tabpanel">
          <slot name="content0">
            <div>Empty</div>
          </slot>
        </TabPanel>
        <TabPanel class="tabpanel">
          <slot name="content1">
            <div />
          </slot>
        </TabPanel>
        <TabPanel class="tabpanel">
          <slot name="content2">
            <div />
          </slot>
        </TabPanel>
        <TabPanel class="tabpanel">
          <slot name="content3">
            <div />
          </slot>
        </TabPanel>
        <TabPanel class="tabpanel">
          <slot name="content4">
            <div />
          </slot>
        </TabPanel>
        <TabPanel class="tabpanel">
          <slot name="content5">
            <div />
          </slot>
        </TabPanel>
        <TabPanel class="tabpanel">
          <slot name="content6">
            <div />
          </slot>
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

  :global(.tabpanel) {
    height: 100%;
  }

  :global(.tabpanels) {
    height: calc(100% - 2rem);
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
