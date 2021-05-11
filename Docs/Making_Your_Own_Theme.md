Making your own theme
=====================

In MapComplete, it is relatively simple to make your own theme. This guide will give some information on how you can do this.

Requirements
------------

Before you start, you should have the following qualifications:

- You are a longtime contributor and do know the OpenStreetMap tagging scheme very well.
- You are not afraid of editing a .JSON-file
- You're theme will add well-understood tags (aka: the tags have a wiki page, are not controversial and are objective)
- You are in contact with your local OpenStreetMap community and do know some other members to discuss tagging and to help testing

If you do not have those qualifications, reach out to the MapComplete community channel on [Telegram](https://t.me/joinchat/HiMUavahRG--SCvC)

The custom theme generator
--------------------------

The custom theme generator is a special page of MapComplete, where one can create their own theme. It makes it easier to get started.

However, the custom theme generator is extremely buggy and built before some updates. This means that some features are _not_ available through the custom theme generator. The custom theme generator is good to get the basics of the theme set up, but you will have to edit the raw JSON-file anyway afterwards.

[A quick tutorial for the custom theme generator can be found here](https://www.youtube.com/watch?v=nVbFrNVPxPw).

Loading your theme
------------------

If you have your .json file, there are three ways to distribute your theme:

- Take the entire JSON-file and [base64](https://www.base64encode.org/) encode it. Then open up the url `https://mapcomplete.osm.be?userlayout=true#<base64-encoded-json-here>`. Yes, this URL will be huge; and updates are difficult to distribute as you have to send a new URL to everyone. This is however excellent to have a 'quick and dirty' test version up and running as these links can be generated from the customThemeGenerator and can be quickly shared with a few other contributors.
- Host the JSON file on a publicly accessible webserver (e.g. github) and open up `https://mapcomplete.osm.be?userlayout=<url-to-the-raw.json>`
- Ask to have your theme included into the official MapComplete - requirements below

### Getting your theme included into the official mapcomplete

Did you make an awesome theme that you want to share with the OpenStreetMap community? Have it included in the main application, which makes it more discoverable.

Your theme has to be:

0) Make sure the theme has an English version. This makes it easier for me to understand what is going on. The more other languages, the better of course!
1) Make sure your theme has good tagging
3) Make sure there are somewhat decent icons. Note that there is _no_ styleguide at the moment though.

The preferred way to add your theme is via a Pull Request. A Pull Request is less work for the maintainer (which makes it really easy and for me to add it) and your name will be included in the git history (so you'll be listed as contributor). If that is not possible, send the .Json-file and assets, e.g. as a zip in an issue, per email, ...

*Via a pull request:*

1) Fork this repository
2) Go to `assets/themes` and create a new directory `yourtheme`
3) Create a new file `yourtheme.json`, paste the theme configuration in there. You can find your theme configuration in the customThemeBuilder (the tab with the *Floppy disk* icon)
4) Copy all the images into this new directory. **No external sources are allowed!** External image sources leak privacy or can break.
    - Make sure the license is suitable, preferable a Creative Commons license or CC0-license.
    - If an SVG version is available, use the SVG version
    - Make sure all the links in `yourtheme.json` are updated. You can use `./assets/themes/yourtheme/yourimage.svg` instead of the HTML link
    - Create a file `license_info.json` in the theme directory, which contains metadata on every artwork source 
 5) Add your theme to the code base:
    - Open [AllKnownLayouts.ts](https://github.com/pietervdvn/MapComplete/blob/master/Customizations/AllKnownLayouts.ts)
    - Add an import statement, e.g. `import * as yourtheme from "../assets/themes/yourtheme/yourthemes.json";`
    - Add your theme to the `LayoutsList`, by adding a line `new LayoutConfig(yourtheme)`
 6) Add some finishing touches, such as a social image. See [this blog post](https://www.h3xed.com/web-and-internet/how-to-use-og-image-meta-tag-facebook-reddit) for some hints
 7) Test your theme: run the project as described [above](../README.md#Dev)
 8) Happy with your theme? Time to open a Pull Request!
 9) Thanks a lot for improving MapComplete!
 
 
 The .JSON-format
 ----------------
 
There are three important levels in the .JSON-file:

- The toplevel describes the metadata of the entire theme. It contains the `title`, `description`, `icon`... of the theme. The most important object is `layers`, which is a list of objects describing layers.
- A `layer` describes a layer. It contains the `name`, `icon`, `tags of objects to download from overpass`, and especially the `icon` and a way to ask dynamically render tags and ask questions. A lot of those fields (`icon`, `title`, ...) are actually a `TagRendering`
- A `TagRendering` is an object describing a relationship between what should be shown on screen and the OSM-tagging. It works in two ways: if the correct tag is known, the appropriate text will be shown. If the tag is missing (and a question is defined), the question will be shown.


Every field is documented in the source code itself - you can find them here:

- [The top level `LayoutConfig`](https://github.com/pietervdvn/MapComplete/blob/master/Customizations/JSON/LayoutConfigJson.ts)
- [A layer object `LayerConfig`](https://github.com/pietervdvn/MapComplete/blob/master/Customizations/JSON/LayerConfigJson.ts)
- [The `TagRendering`](https://github.com/pietervdvn/MapComplete/blob/master/Customizations/JSON/TagRenderingConfigJson.ts)
- At last, the exact semantics of tags is documented [here](Tags_format.md)

### MetaTags

There are few tags available that are calculated for convenience - e.g. the country an object is located at. [An overview of all these metatags is available here](Docs/CalculatedTags.md)

 Some hints
------------

### Everything is HTML

All the texts are actually *HTML*-snippets, so you can use `<b>` to add bold, or `<img src=...>` to add images to mappings or tagrenderings. 

Some remarks: 

- links are disabled when answering a question (e.g. a link in a mapping) as it should trigger the answer - not trigger to open the link.
- If you include images, e.g. to clarify a type, make sure these are _icons_ or _diagrams_ - not actual pictures! If users see a picture, they think it is a picture of _that actual object_, not a type to clarify the type. An icon is however perceived as something more abstract. 

 Some pitfalls
---------------

### Not publishing

Not publishing because 'it is not good enough'. _Share your theme, even if it is still not great, let the community help it improve_

### Thinking in terms of a question

Making a tagrendering as if it were a question only. If you have a question such as: _Does this bench have a backrest?_, it is very tempting to have as options _yes_ for `backrest=yes` and _no_ for `backrest=no`. However, when this data is known, it will simply show a lone _yes_ or _no_ which is very unclear.

The correct way to handle this is to use _This bench does have a backrest_ and _This bench does not have a backrest_ as answers.

One has to think first in terms of _what is shown to the user if it is known_, only then in terms of _what is the question I want to ask_

### Forgetting the casual/noob mapper

MapComplete is in the first place a tool to help *non-technical* people visualize their interest and contribute to it. In order to maximize contribution:

1. Use simple language. Avoid difficult words and explain jargon
2. Put the simple questions first and the difficult ones on the back. The contributor can then stop at a difficult point and go to the next POI
3. Use symbols and images, also in the mappings on questions
4. Make sure the icons (on the map and in the questions) are big enough, clear enough and contrast enough with the background map

### Using layers to distinguish on attributes

One layer should portray one kind of physical object, e.g. "benches" or "restaurants". It should contain all of them, disregarding other properties.

One should not make one layer for benches with a backrest and one layer for benches without. This is confusing for users and poses problems: what if the backrest status is unknown? What if it is some weird value?
Also, it isn't possible to 'move' an attribute to another layer.

Instead, make one layer for one kind of object and change the icon based on attributes.

### Using layers as filters

Using layers as filters - this doesn't work!

_All_ data is downloaded in one go and cached locally first. The layer selection (bottom left of the live app) then selects _anything_ that matches the criteria. This match is then passed of to the rendering layer, which selects the layer independently. This means that a feature can show up, even if it's layer is unselected!

For example, in the [cyclofix-theme](https://mapcomplete.osm.org/cyclofix), there is the layer with _bike-wash_ for do it yourself bikecleaning - points marked with `service:bicycle:cleaning`. However, a bicycle repair shop can offer this service too!

If all the layers are deselected except the bike wash layer, a shop having this tag will still match and will still show up as shop.

### Not reading the .JSON-specs

There are a few advanced features to do fancy stuff available, which are documented only in the spec above - for example, reusing background images and substituting the colours or HTML-rendering. If you need advanced stuff, read it through!
