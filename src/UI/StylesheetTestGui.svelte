<script lang="ts">
  import Svg from "../Svg"
  import Loading from "./Base/Loading.svelte"
  import ToSvelte from "./Base/ToSvelte.svelte"
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
    .
    <span class="alert">Alert: something went wrong</span>
    <span class="thanks">Thank you! Operation successful</span>
    <ToSvelte construct={Svg.login_svg().SetClass("w-12 h-12")} />
    <Loading>Loading...</Loading>
  </div>

  <div class="low-interaction flex flex-col">
    <h2>Low interaction</h2>
    <p>
      There are <span class="literal-code">low-interaction</span>
      areas, where some buttons might appear.
    </p>

    <div class="flex">
      <button class="primary">
        <ToSvelte construct={Svg.community_svg().SetClass("w-6 h-6")} />
        Main action
      </button>
      <button class="primary disabled">
        <ToSvelte construct={Svg.community_svg().SetClass("w-6 h-6")} />
        Main action (disabled)
      </button>

      <button class="small primary">Small button</button>
      <button class="small primary disabled">Small, disabled button</button>
    </div>
    <div class="flex">
      <button>
        <ToSvelte construct={Svg.community_svg().SetClass("w-6 h-6")} />
        Secondary action
      </button>
      <button class="disabled">
        <ToSvelte construct={Svg.community_svg().SetClass("w-6 h-6")} />
        Secondary action (disabled)
      </button>
    </div>
    <input type="text" />

    <div>
      <label class="checked" for="html">
        <input id="html" name="fav_language" type="radio" value="HTML" />
        HTML (mimicks a
        <span class="literal-code">checked</span>
        -element)
      </label>
      <label for="css">
        <input id="css" name="fav_language" type="radio" value="CSS" />
        CSS
      </label>
      <label for="javascript">
        <input id="javascript" name="fav_language" type="radio" value="JavaScript" />
        <ToSvelte construct={Svg.community_svg().SetClass("w-8 h-8")} />
        JavaScript
      </label>
    </div>

    <span class="alert">Alert: something went wrong</span>
    <span class="thanks">Thank you! Operation successful</span>
    <ToSvelte construct={Svg.login_svg().SetClass("w-12 h-12")} />
    <Loading>Loading...</Loading>
  </div>

  <div class="interactive flex flex-col">
    <h2>Interactive area</h2>
    <p>
      There are <span class="literal-code">interactive</span>
      areas, where many buttons and input elements will appear.
    </p>

    <div class="flex">
      <button class="primary">
        <ToSvelte construct={Svg.community_svg().SetClass("w-6 h-6")} />
        Main action
      </button>
      <button class="primary disabled">
        <ToSvelte construct={Svg.community_svg().SetClass("w-6 h-6")} />
        Main action (disabled)
      </button>
    </div>
    <div class="flex">
      <button>
        <ToSvelte construct={Svg.community_svg().SetClass("w-6 h-6")} />
        Secondary action
      </button>
      <button class="disabled">
        <ToSvelte construct={Svg.community_svg().SetClass("w-6 h-6")} />
        Secondary action (disabled)
      </button>
    </div>
    <span class="alert">Alert: something went wrong</span>
    <span class="thanks">Thank you! Operation successful</span>
    <ToSvelte construct={Svg.login_svg().SetClass("w-12 h-12")} />
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

    <select>
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
    </select>
  </div>
</div>
