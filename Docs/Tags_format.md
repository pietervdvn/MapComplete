 Tags format
=============

When creating the `json` file describing your layer or theme, you'll have to add a few tags to describe what you want. This document gives an overview of what every expression means and how it behaves in edge cases.

Strict equality
---------------

Strict equality is denoted by `key=value`. This key matches __only if__ the keypair is present exactly as stated.

**Only normal tags (eventually in an `and`) can be used in places where they are uploaded**. Normal tags are used in the `mappings` of a [TagRendering] (unless `hideInAnswer` is specified), they are used in `addExtraTags` of [Freeform] and are used in the `tags`-list of a preset.

If a different kind of tag specification is given, your theme will fail to parse.

### If key is not present

If you want to check if a key is not present, use `key=` (pronounce as *key is empty*). A tag collection will match this if `key` is missing or if `key` is a literal empty value.

### Removing a key

If a key should be deleted in the OpenStreetMap-database, specify `key=` as well. This can be used e.g. to remove a fixme or value from another mapping if another field is filled out.

Strict not equals
-----------------

To check if a key does _not_ equal a certain value, use `key!=value`. This is converted behind the scenes to `key!~^value$`

### If key is present

This implies that, to check if a key is present, `key!=` can be used. This will only match if the key is present and not empty.

Number comparison
-----------------

If the value of a tag is a number (e.g. `key=42`), one can use a filter `key<=42`, `key>=35`, `key>40` or `key<50` to match this, e.g. in conditions for renderings.
These tags cannot be used to generate an answer nor can they be used to request data upstream from overpass.

Note that the value coming from OSM will first be stripped by removing all non-numeric characters. For example, `length=42 meter` will be interpreted as `length=42` and will thus match `length<=42` and `length>=42`.
In special circumstances (e.g. `surface_area=42 m2` or `length=100 feet`), this will result in erronous values (`surface=422` or if a length in meters is compared to).
However, this can be partially alleviated by using 'Units' to rewrite to a default format.

Regex equals
------------

A tag can also be tested against a regex with `key~regex`. Note that this regex __must match__ the entire value. If the value is allowed to appear anywhere as substring, use `key~.*regex.*`

Equivalently, `key!~regex` can be used if you _don't_ want to match the regex in order to appear.


Using other tags as variables
-----------------------------

**This is an advanced feature - use with caution**

Some tags are automatically set or calculated - see [CalculatedTags](CalculatedTags.md) for an entire overview.
If one wants to apply such a value as tag, use a substituting-tag such, for example`survey:date:={_date:now}`. Note that the separator between key and value here is `:=`.
The text between `{` and `}` is interpreted as a key, and the respective value is substituted into the string.

One can also append, e.g. `key:={some_key} fixed text {some_other_key}`.

An assigning tag _cannot_ be used to query OpenStreetMap/Overpass.

If using a key or variable which might not be defined, add a condition in the mapping to hide the option.
This is because, if `some_other_key` is not defined, one might actually upload the literal text `key={some_other_key}` to OSM - which we do not want.

To mitigate this, use:

```
"mappings": [
{
    "if":"key:={some_other_key}"
    "then": "...",
    "hideInAnswer": "some_other_key="
}
]
```