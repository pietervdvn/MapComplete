<script lang="ts">
  import Loading from "./Base/Loading.svelte"
  import Community from "../assets/svg/Community.svelte"
  import Login from "../assets/svg/Login.svelte"
  import Dropdown from "./Base/Dropdown.svelte"
  import { UIEventSource } from "../Logic/UIEventSource"
</script>

<div>
  <h1>Stylesheet testing grounds</h1>

  This document exists to explore the style hierarchy.

  <div class="normal-background">
    <h2>Normal background</h2>
    There are a few styles, such as the
    <span class="literal-code">normal-background</span>
    -style which is used if there is nothing special going on. Some general information, with at most
    <a href="https://example.com" target="_blank">a link to someplace</a>
    <div class="subtle">Subtle</div>

    <div class="alert">Alert: something went wrong</div>
    <div class="warning">Warning</div>
    <div class="information">Some important information</div>
    <div class="thanks">Thank you! Operation successful</div>

    <Login class="h-12 w-12" />
    <Loading>Loading...</Loading>
  </div>

  <div class="low-interaction flex flex-col">
    <h2>Low interaction</h2>
    <p>
      There are <span class="literal-code">low-interaction</span>
      areas, where some buttons might appear.
    </p>

    <div class="border-interactive interactive">
      Highly interactive area (mostly: active question)
    </div>
    <div class="subtle">Subtle</div>

    <div class="flex">
      <button class="primary">
        <Community class="h-6 w-6" />
        Main action
      </button>
      <button class="primary disabled">
        <Community class="h-6 w-6" />
        Main action (disabled)
      </button>

      <button class="small">
        <Community class="h-6 w-6" />
        Small button
      </button>

      <button class="small primary">Small button</button>
      <button class="small primary disabled">Small, disabled button</button>
    </div>
    <div class="flex">
      <button>
        <Community class="h-6 w-6" />
        Secondary action
      </button>
      <button class="disabled">
        <Community class="h-6 w-6" />
        Secondary action (disabled)
      </button>
    </div>
    <input type="text" />

    <div class="flex flex-col">
      <label class="checked" for="html">
        <input id="html" name="fav_language" type="radio" value="HTML" />
        HTML (mimicks a
        <span class="literal-code">checked</span>
        -element)
        <Dropdown value={new UIEventSource("abc")}>
          <option>abc</option>
          <option>def</option>
        </Dropdown>
      </label>
      <label for="css">
        <input id="css" name="fav_language" type="radio" value="CSS" />
        CSS
      </label>
      <label for="javascript">
        <input id="javascript" name="fav_language" type="radio" value="JavaScript" />
        <Community class="h-8 w-8" />
        JavaScript
      </label>
    </div>

    <div class="alert">Alert: something went wrong</div>
    <div class="warning">Warning</div>
    <div class="information">Some important information</div>
    <div class="thanks">Thank you! Operation successful</div>

    <Login class="h-12 w-12" />
    <Loading>Loading...</Loading>
  </div>

  <div class="interactive flex flex-col">
    <h2>Interactive area</h2>
    <p>
      There are <span class="literal-code">interactive</span>
      areas, where many buttons and input elements will appear.
    </p>
    <div class="subtle">Subtle</div>

    <div class="flex">
      <button class="primary">
        <Community class="h-6 w-6" />
        Main action
      </button>
      <button class="primary disabled">
        <Community class="h-6 w-6" />
        Main action (disabled)
      </button>
      <button class="small">
        <Community class="h-6 w-6" />
        Small button
      </button>
    </div>

    <div class="flex">
      <button>
        <Community class="h-6 w-6" />
        Secondary action
      </button>
      <button class="disabled">
        <Community class="h-6 w-6" />
        Secondary action (disabled)
      </button>
    </div>
    <div class="alert">Alert: something went wrong</div>
    <div class="warning">Warning</div>
    <div class="information">Some important information</div>
    <div class="thanks">Thank you! Operation successful</div>

    <Login class="h-12 w-12" />
    <Loading>Loading...</Loading>
    <div>
      <label for="html0">
        <input id="html0" name="fav_language" type="radio" value="HTML" />
        HTML
      </label>
      <label for="css0">
        <input id="css0" name="fav_language" type="radio" value="CSS" />
        CSS
      </label>
      <label for="javascript0">
        <input id="javascript0" name="fav_language" type="radio" value="JavaScript" />
        JavaScript
      </label>
    </div>

    <div class="border-interactive">
      Area with extreme high interactivity due to `border-interactive`
    </div>

    <select>
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
    </select>
  </div>
</div>
