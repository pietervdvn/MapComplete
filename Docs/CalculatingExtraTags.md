# Extra, automatically created tags

In some cases, it is useful to have some tags calculated based on other properties.

Some useful tags are available by default (e.g. `_lat`, `_lon`, `_country`) and are always available (have a lookt at [CalculatedTags.md](CalculatedTags.md) to see an overview).

It is also possible to calculate your own tags - but this requires some javascript knowledge. 

Before proceeding, some warnings:

- **DO NOT DO THIS AS BEGINNER**
- **Only do this if all other techniques fail**. This should _not_ be done to create a rendering effect, only to calculate a specific vaue
- **THIS MIGHT BE DISABLED WITHOUT ANY NOTICE ON UNOFFICIAL THEMES**. As unofficial themes might be loaded from the internet, this is the equivalent of injecting arbitrary code into the client. It'll be disabled if abuse occurs.

In the layer object, add a field `calculatedTags`, e.g.:

```
  "calculatedTags": {
    "_someKey": "javascript-expression",
    "name": "tags.name ?? tags.ref ?? tags.operator"
  }
```
