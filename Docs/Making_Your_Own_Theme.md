Making your own theme
=====================

In MapComplete, it is relatively simple to make your own theme. This guide will give some information on how you can do
this.

Table of contents:

1. [Requirements](#requirements) which lists what you should know before starting to create a theme
2. [What is a good theme?](#what-is-a-good-theme)

Requirements
------------

Before you start, you should have the following qualifications:

- You are a longtime contributor and do know the OpenStreetMap tagging scheme very well.
- You are not afraid of editing a JSON file. If you don't know what a JSON file is, [read this intro](https://www.w3schools.com/whatis/whatis_json.asp)
- Your theme will add well-understood tags (aka: the tags have a wiki page, are not controversial and are objective)
- You are in contact with your local OpenStreetMap community and do know some other members to discuss tagging and to
  help testing

Please, do reach out to the MapComplete community channel
on [Telegram](https://t.me/MapComplete)
or [Matrix](https://app.element.io/#/room/#MapComplete:matrix.org).

Get started
-----------

You can create your own theme at https://mapcomplete.org/studio


What is a good theme?
---------------------

A **theme** (or _layout_) is a single map showing one or more layers.
The layers should work together in such a way that they serve a certain **audience**.
You should be able to state in a few sentences whom would be the user of such a map, e.g. 

- a cyclist searching for bike repair
- a thirsty person who needs water
- someone who wants to know what their street is named after
- ...

Some layers will be useful for many themes (e.g. _drinking water_, _toilets_, _shops_, ...). Due to this, MapComplete supports to reuse already existing official layers into a theme.

To include an already existing layer, simply type the layer id, e.g.:

```json
{
  "id": "my-theme",
  "title": "My theme for xyz",
  "...": "...",
  "layers": [
    {
      "id": "my super-awesome new layer"
    },
    "bench",
    "shops",
    "drinking_water",
    "toilet"
  ]
}
```

Note that it is good practice to use an existing layer and to tweak it:

```json
{
  "id": "my super awesome theme",
  "...": "...",
  "layers": [
    {
      "builtin": [
        "toilet",
        "bench"
      ],
      "override": {
        "#": "Override is a section which copies all the keys here and 'pastes' them into the existing layers. For example, the 'minzoom' defined here will redifine the minzoom of 'toilet' and 'bench'",
        "minzoom": 17,
        "#0": "Appending to lists is supported to, e.g. to add an extra question",
        "tagRenderings+": [
          {
            "id": "new-question",
            "question": "What is <some property>?",
            "render": "{property}",
            "...": "..."
          }
        ],
        "#1": "Note that paths will be followed: the below block will add/change the icon of the layer, without changing the other properties of the first tag rendering. (Assumption: the first mapRendering is the icon rendering)",
        "mapRendering": [
          {
            "icon": {
              "render": "new-icon.svg"
            }
          }
        ]
      }
    }
  ]
}

```

### What is a good layer?

A good layer is layer which shows **all** objects of a certain type, e.g. **all** shops, **all** restaurants, ...

It asks some relevant questions, with the most important and easiests questions first.

#### Don't: use a layer to filter

**Do not define a layer which filters on an attribute**, such as <del>all restaurants with a vegetarian diet</del>, <del>all shops which accept bitcoin</del>.
This makes _addition_ of new points difficult as information might not yet be known. Consider the following situation:

1. A theme defines a layer `vegetarian restaurants`, which matches `amenity=restaurant` & `diet:vegetarian=yes`.
2. An object exists in OSM with `amenity=restaurant`;`name=Fancy Food`;`diet:vegan=yes`;`phone=...`;...
3. A contributor visits the themes and will notice that _Fancy Food_ is missing
4. The contributor will add _Fancy Food_
5. There are now **two** _Fancy Food_ objects in OSM.

Instead, use the filter functionality instead. This can be used from the layer to hide some objects based on their properties.
When the contributor wants to add a new point, they'll be notified that some features might be hidden and only be allowed to add a new point when the points are shown.

![](./FilterFunctionality.gif)

```json
{
  "id": "my awesome layer",
  "tagRenderings": "... some relevant attributes and questions ...",
  "mapRenderings": "... display on the map ... ",
  "filter": [
    {
      "id": "vegetarian",
      "options": [
        {
          "question": {
            "en": "Has a vegetarian menu"
          },
          "osmTags": {
            "or": [
              "diet:vegetarian=yes",
              "diet:vegetarian=only",
              "diet:vegan=yes",
              "diet:vegan=only"
            ]
          }
        }
      ]
    }
  ]
}
```

If you want to show only features of a certain type, there is a workaround.
For example, the [fritures map](https://mapcomplete.org/fritures.html?z=1&welcome-control-toggle=true) will show french fries shop, aka every `amenity~fast_food|restaurant` with `cuisine=friture`.
However, quite a few fritures are already mapped as fastfood but have their `cuisine`-tag missing (or misspelled).

There is a workaround for this: show **all** food related items at zoomlevel 19 (or higher), and only show the fritures when zoomed out.

In order to achieve this:

1. The layer 'food' is defined in a separate file and reused
2. The layer food is imported in the theme 'fritures'. With 'override', some properties are changed, namely:
   - The `osmTags` are overwritten: `cuisine=friture` is now required
   - The presets are overwritten and _disabled_ 
   - The _id_ and _name_ of the layer are changed
3. The layer `food` is imported _a second time_, but now the minzoom is set to `19`. This will show _all_ restaurants.

In case of a friture which is already added as fastfood, they'll see the fastfood popup instead of adding a new item:

![](./FilteredByDepth.gif)

```json
{
  "layers": [
    {
      "builtin": "food",
      "override": {
        "id": "friture",
        "name": {
          "en": "Fries shop"
        },
        "=presets": [],
        "source": {
          "=osmTags": {
            "and": [
              "cuisine=friture",
              {
                "or": [
                  "amenity=fast_food",
                  "amenity=restaurant"
                ]
              }
            ]
          }
        }
      }
    },
    {
      "builtin": "food",
      "override": {
        "minzoom": 19,
        "filter": null,
        "name": null
      }
    }
  ]
}
```


### What is a good question and tagrendering?

A tagrendering maps an attribute onto a piece of human readable text. 
These should be **full sentences**, e.g. `"render": "The maximum speed of this road is {maxspeed} km/h"`

In some cases, there might be some predifined special values as mappings, such as `"mappings": [{"if": "maxspeed=30", "then": "The maxspeed is 30km/h"}]`

The question then follows logically: `{"question": "What is the maximum allowed speed for this road, in km/h?"}`
At last, you'll also want to say that the user can type an answer too and that it has to be a number: `"freeform":{"key": "maxspeed","type":"pnat"}`.

The entire tagRendering will thus be:

```json
{
  "question": "What is the maximum allowed speed for this road, in km/h?",
  "render": "The maximum speed of this road is {maxspeed} km/h",
  "freeform":{"key": "maxspeed","type":"pnat"},
  "mappings": [{"if": "maxspeed=30", "then": "The maxspeed is 30km/h"}]
}
```


## Make it official

Did you make an awesome theme that you want to share with the OpenStreetMap community? Have it included in the main
application. This makes sure that:

- Your theme will be discovered by more people
- It will be included in the translation program
- Metadata will be generated (such as links with TagInfo or layer documentation)
- Maintanence is included
- Parts of your theme might be reused by others

The following conditions must be met:

0) The theme must be relevant for a global audience
1) There must be an English translation. This makes it easier for me to understand what is going on and is needed for the translators. The more
   other languages, the better of course!
2) Make sure your theme has good tagging - i.e. a wiki page must exist for the used tags
3) Make sure there are somewhat decent icons. Note that there is _no_ styleguide at the moment though. Icons must be included and have license info in the corresponding `license_info.json`-files. (Run `npm run query:licenses` to build those)

The preferred way to add your theme is via a Pull Request. A Pull Request is less work for the maintainer (which makes
it really easy for me to add it) and your name will be included in the git history (so you'll be listed as
contributor). If that is not possible, send the JSON file and assets, e.g. as a zip in an issue, per email, ...

*Via a pull request:*

1) Fork this repository
2) Go to `assets/themes` and create a new directory named `yourtheme`
3) Create a new file named `yourtheme.json`, paste the theme configuration in there. You can find your theme configuration in
   the customThemeBuilder (the tab with the *Floppy disk* icon)
4) Copy all the images into this new directory. **No external sources are allowed!** External image sources leak privacy
   or can break.
    - Make sure the license is suitable, preferable a Creative Commons license or CC0-license.
    - If an SVG version is available, use the SVG version
    - Make sure all the links in `yourtheme.json` are updated. You can use a relative link like `./assets/themes/yourtheme/yourimage.svg`
      instead of an HTML link
    - Create the file `license_info.json` in the theme directory, which contains metadata on every artwork source
5) Add your theme to the code base: add it into `assets/themes` and make sure all the images are there too. Running `
   ts-node scripts/fixTheme <path to your theme>` will help downloading the images and attempts to get the licenses if
   on Wikimedia.
6) Add some finishing touches, such as a social image.
   See [this blog post](https://www.h3xed.com/web-and-internet/how-to-use-og-image-meta-tag-facebook-reddit) for some
   hints.
7) Test your theme: run the project as described in [development_deployment](Development_deployment.md)
8) Happy with your theme? Time to open a Pull Request!
9) Thanks a lot for improving MapComplete!

The theme JSON format
----------------

There are three important levels in the JSON file:

- The toplevel describes the metadata of the entire theme. It contains the `title`, `description`, `icon`... of the
  theme. The most important object is `layers`, which is a list of objects describing layers.
- A `layer` describes a layer. It contains the `name`, `icon`, `tags of objects to download from overpass`, and
  especially the `icon` and a way to dynamically render tags and ask questions. A lot of those fields (`icon`
  , `title`, ...) are actually a `TagRendering`.
- A `TagRendering` is an object describing a relationship between what should be shown on screen and the OSM tagging. It
  works in two ways: if the correct tag is known, the appropriate text will be shown. If the tag is missing (and a
  question is defined), the question will be shown.

Every field is documented in the source code itself - you can find them here:

- [The top level `LayoutConfig`](/src/Models/ThemeConfig/Json/LayoutConfigJson.ts)
- [A layer object `LayerConfig`](/src/Models/ThemeConfig/Json/LayerConfigJson.ts)
- [The `TagRendering`](/src/Models/ThemeConfig/Json/TagRenderingConfigJson.ts)
- At last, the exact semantics of tags are documented [here](Tags_format.md)

A JSON schema file is available in `Docs/Schemas` - use `LayoutConfig.schema.json` to validate a theme file.

### MetaTags

There are a few tags available that are calculated for convenience - e.g. the country an object is located
in. [An overview of all these metatags is available here](CalculatedTags.md).

### TagRendering groups

A `tagRendering` can have a `group` attribute, which acts as a tag. All `tagRendering`s with the same group name will be
rendered together, in the same order as they were defined.

For example, if the defined `tagRendering`s have groups `A A B A A B B B`, the group order is `A B` and first all
`tagRendering`s from group A will be rendered (thus numbers 0, 1, 3 and 4) followed by the question box for this group.
Then, all the `tagRendering`s for group B will be shown, thus number 2, 5, 6 and 7, again followed by their question box.

Additionally, every `tagRendering` will receive the group name as class in the HTML, which can be used to hook up custom
CSS.

If no group tag is given, the group is `` (empty string).

### Deciding the questions position

By default, the questions are shown just beneath their group.

To override this behaviour, one can add a `tagRendering` with id `questions` to move the questions up.

To add a title to the questions, one can add a `render` and a `condition`.

To change the behaviour of the question box to show _all_ questions at once, one can use the `helperArgs` field in the `freeform`
field with the option `showAllQuestions`.

For example, to show the questions on top, use:

```json
"tagRenderings": [
    { "id": "questions" }
    { ... some tagrendering ... }
    { ... more tagrendering ...}
]
```

To show _all_ the questions of a group at once in the middle of the tagrenderings, with a header, use:

```json
"tagRenderings": [
    { 
      "id": "questions" ,
      "group": "groupname",
      "render": {
        "en": "<h3>Technical questions</h3>The following questions are very technical!<br />{questions}"
      },
      "freeform": {
        "key": "questions",
        "helperArgs": {
            "showAllQuestions": true
        }
      }
    }
    { ... some tagrendering ... }
    { ... more tagrendering ...}
]
```

Some hints
------------

### Everything is HTML

All the texts are actually *HTML* snippets, so you can use `<b>` to add bold, or `<img src=...>` to add images to
mappings or tagrenderings.

Some remarks:

- links are disabled when answering a question (e.g. a link in a `mapping`) as it should trigger the answer - not trigger
  to open the link.
- If you include images, e.g. to clarify a type, make sure these are _icons_ or _diagrams_ - not actual pictures! If
  users see a picture, they think it is a picture of _that actual object_, not a type to clarify the type. An icon is
  however perceived as something more abstract.

Some pitfalls
---------------

### Not publishing

Not publishing because 'it is not good enough'. _Share your theme, even if it is still not great, let the community help
improve it._

### Thinking in terms of a question

Making a tagrendering as if it were a question only. If you have a question such as: _Does this bench have a backrest?_,
it is very tempting to have as options _yes_ for `backrest=yes` and _no_ for `backrest=no`. However, when this data is
known, it will simply show a lone _yes_ or _no_ which is very unclear.

The correct way to handle this is to use _This bench does have a backrest_ and _This bench does not have a backrest_ as
answers.

One has to think first in terms of _what is shown to the user if it is known_, only then in terms of _what is the
question I want to ask_.

### Forgetting the casual/noob mapper

MapComplete is in the first place a tool to help *non-technical* people visualize their interest and contribute to it.
In order to maximize contribution:

1. Use simple language. Avoid difficult words and explain jargon
2. Put the simple questions first and the difficult ones on the back. The contributor can then stop at a difficult point
   and go to the next POI
3. Use symbols and images, also in the mappings on questions
4. Make sure the icons (on the map and in the questions) are big enough, clear enough and contrast enough with the
   background map

### Using layers to distinguish different object subtypes by attributes

One layer should portray one kind of physical object, e.g. "benches" or "restaurants". It should contain all of them,
disregarding other properties.

One should not make one layer for benches with a backrest and one layer for benches without. This is confusing for users
and poses problems: what if the backrest status is unknown? What if it is some weird value? Also, it isn't possible to '
move' a feature to another layer.

Instead, make one layer for one kind of object and change the icon based on attributes.

### Not reading the theme JSON specs

There are a few advanced features to do fancy stuff available, which are documented only in the spec above - for
example, reusing background images and substituting the colours or HTML rendering. If you need advanced stuff, read it
through!

### Forgetting adjacent concepts

Some new contributors might add a POI to indicate something that resembles it, but quite isn't.

For example, if they are only offered a layer with public bookcases, they might map their local library with a public bookcase.
The perfect solution for this is to provide both the library layer and public bookcases layer - but this requires having both layers.

A good solution is to clearly explain what a certain feature is and what it is not.
