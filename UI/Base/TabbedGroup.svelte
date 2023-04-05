<script lang="ts">
  /**
   * Thin wrapper around 'TabGroup' which binds the state
   */

  import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@rgossiaux/svelte-headlessui";
  import { UIEventSource } from "../../Logic/UIEventSource";

  export let tab: UIEventSource<number>;
  let tabElements: HTMLElement[] = [];
  $: tabElements[$tab]?.click();
  $: {
    if (tabElements[tab.data]) {
      window.setTimeout(() =>   tabElements[tab.data].click(), 50)
    }
  }
</script>

<TabGroup defaultIndex={1} on:change={(e) =>{if(e.detail >= 0){tab.setData( e.detail); }} }>
  <TabList>
    <Tab class={({selected}) => selected ? "tab-selected" : "tab-unselected"}>
      <div bind:this={tabElements[0]} class="flex">
        <slot name="title0">
          Tab 0
        </slot>
      </div>
    </Tab>
    <Tab class={({selected}) => selected ? "tab-selected" : "tab-unselected"}>
      <div bind:this={tabElements[1]} class="flex">
        <slot name="title1" />
      </div>
    </Tab>
    <Tab class={({selected}) => selected ? "tab-selected" : "tab-unselected"}>
      <div bind:this={tabElements[2]} class="flex">
        <slot name="title2" />
      </div>
    </Tab>
    <Tab class={({selected}) => selected ? "tab-selected" : "tab-unselected"}>
      <div bind:this={tabElements[3]} class="flex">
        <slot name="title3" />
      </div>
    </Tab>
    <Tab class={({selected}) => selected ? "tab-selected" : "tab-unselected"}>
      <div bind:this={tabElements[4]} class="flex">
        <slot name="title4" />
      </div>
    </Tab>
  </TabList>
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
</TabGroup>
