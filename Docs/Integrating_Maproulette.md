# Integrating MapRoulette

## Importing points

[MapRoulette](https://www.maproulette.org/) is a website which has challenges. A challenge is a collection of _microtasks_, i.e. mapping tasks which can be solved in a few minutes.

A perfect example of this is to setup such a challenge to e.g. import new points. 

> [Important: always follow the import guidelines if you want to import data.](https://wiki.openstreetmap.org/wiki/Import/Guidelines)

(Another approach to set up a guided import is to create a map note for every point with the [import helper](https://mapcomplete.org/import_helper). This however litters the map notes and will upset mappers if used with to much points. However, this flow is easier to setup as no changes to theme files are needed, nor is a maproulette-account needed)

## Preparing the data

Convert your source data into a geojson. Use *`tags`* as field where all the OSM-properties should go. Make sure to include all tags there.

Hint: MapRoulette has a button 'rebuild task', where you can first 'remove all incomplete tasks'. This is perfect to start over in case of small data errors.

## The API

**Most of the heavy lifting is done in [layer `maproulette-challenge`](./Docs/Layers/maproulette_challenge.md). Extend this layer with your needs.**
The API is shortly discussed here for future reference only.

There is an API-endpoint at `https://maproulette.org/api/v2/tasks/box/{x_min}/{y_min}/{x_max}/{y_max}` which can be used
to query _all_ tasks in a bbox and returns this as geojson. Hint:
use [the maproulette theme in debug mode](https://mapcomplete.org/maproulette?debug=true) to inspect all properties.

To view the overview a single challenge, visit `https://maproulette.org/browse/challenges/<challenge-id>` with your
browser.
The API endpoint for a single challenge is `https://maproulette.org/api/v2/challenge/view/<challenge-id>` which returns a
geojson.

Override the geojson-source in order to use the challenge:

``` 
{
    "builtin": "maproulette_challenge",
    "override" : {
        "source": {
            "geoJson": "https://maproulette.org/api/v2/challenge/view/<challenge-id>"
        }
    }
}
```


## Displaying MapRoulette data in MapComplete

As you'll probably want to link MapComplete to your challenge, reuse [maproulette_challenge](Docs/Layers/maproulette_challenge.md).
It has a basic framework already to load the tags.

Of course, interacting with the tasks is the next step.

### Detecting nearby features

You can use [`calculatedTags`](./Docs/CalculatedTags.md) to add a small piece of code to e.g. detect nearby entities.

The following example is to match hotels:

```
    "calculatedTags": [
      "_closest_osm_poi=feat.closest('hotel')?.properties?.id",
      "_closest_osm_poi_distance=feat.distanceTo(feat.properties._closest_osm_poi)",
      "_has_closeby_feature=Number(feat.properties._closest_osm_poi_distance) < 50 ? 'yes' : 'no'"
    ], 
```

This can be used to decide if tags should be applied on an existing object or a new point should be created.


### Creating a new point based on a maproulette challenge (Guided import)

**Requirement**: the MapRoulette task should have `tags` added.

One can add `import`-button in the featureInfoBox ([documentation here](./Docs/SpecialRenderings.md#importbutton)).
Note that the import button has support for MapRoulette and is able to close the task if the property containing the maproulette-id is given:

```json
{
    "id": "import-button",
    "condition": "_has_closeby_feature=no",
    "render": {
      "special": {
        "type": "import_button",
        "targetLayer": "<the layer in which the point should appear afterwards>",
        "tags": "tags", -- should stay 'tags', unless you took a different name while creating the data
        "maproulette_id": "mr_taskId",  -- important to get the task closed
        "text": {
          "en": "Import this point" -- or a nice message
        },
        "icon": "./assets/svg/addSmall.svg", -- optional, feel free to change
        "location_picker": "photo", -- optional, background layer to pinpoint the hotel
      }
    }
}
```


### Applying tags to already existing features

For this, [the `tag_apply`-button can be used](./Docs/SpecialRenderings.md#tagapply).

The following example uses the calculated tags `_has_closeby_feature` and `_closest_osm_hotel`. These were added by a small extra script using `calculatedTagss`.

```json

 {
    "id": "tag-apply-button",
    "condition": "_has_closeby_feature=yes", -- don't show if no feature to add to
    "render": {
      "special": {
        "type": "tag_apply",
        "tags_to_apply": "$tags", -- note the '$', property containing the tags
        "id_of_object_to_apply_this_one": "_closest_osm_poi" -- id of the feature to add those tags to
        "message": {
          "en": "Add all the suggested tags"
        },
        "image": "./assets/svg/addSmall.svg"
      }
    }
  }

```

### Changing the status of the task

The easiest way is to reuse a tagrendering from the [Maproulette-layer](./Docs/Layers/maproulette.md) (_not_ the `maproulette-challenge`-layer!), such as [`maproulette.mark_fixed`](./Docs/Layers/maproulette.md#markfixed),[`maproulette.mark_duplicate`](./Docs/Layers/maproulette.md#markduplicate),[`maproulette.mark_too_hard`](./Docs/Layers/maproulette.md#marktoohard).

In the background, these use the special visualisation [`maproulette_set_status`](./Docs/SpecialRenderings.md#maproulettesetstatus) - which allows to apply different status codes or different messages/icons.

## Creating a maproulette challenge

A challenge can be created on https://maproulette.org/admin/projects

This can be done with a geojson-file (or by other means).

MapRoulette works as a geojson-store with status fields added. As such, you have a bit of freedom in creating the data, but an **id** field is mandatory. A **name** tag is recommended

To setup a guided import, add a `tags`-field with tags formatted in such a way that they are compatible with the [import-button](./Docs/SpecialRenderings.md#specifying-which-tags-to-copy-or-add)


(The following example is not tested and might be wrong.)

```
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [1.234, 5.678]},
            "properties": {
                "id": ...
                "tags": "foo=bar;name=xyz",
            }
        
        }
    
    ] 
}

```
