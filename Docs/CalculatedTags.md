
 Metatags 
==========



Metatags are extra tags available, in order to display more data or to give better questions.

The are calculated automatically on every feature when the data arrives in the webbrowser. This document gives an overview of the available metatags.

**Hint:** when using metatags, add the [query parameter](URL_Parameters.md) `debug=true` to the URL. This will include a box in the popup for features which shows all the properties of the object


 Metatags calculated by MapComplete 
------------------------------------



The following values are always calculated, by default, by MapComplete and are available automatically on all elements in every theme


### _lat, _lon 



The latitude and longitude of the point (or centerpoint in the case of a way/area)




### _layer 



The layer-id to which this feature belongs. Note that this might be return any applicable if `passAllFeatures` is defined.




### _surface, _surface:ha 



The surface area of the feature, in square meters and in hectare. Not set on points and ways

This is a lazy metatag and is only calculated when needed


### _length, _length:km 



The total length of a feature in meters (and in kilometers, rounded to one decimal for '_length:km'). For a surface, the length of the perimeter




### Theme-defined keys 



If 'units' is defined in the layoutConfig, then this metatagger will rewrite the specified keys to have the canonical form (e.g. `1meter` will be rewritten to `1m`)




### _country 



The country code of the property (with latlon2country)




### _isOpen, _isOpen:description 



If 'opening_hours' is present, it will add the current state of the feature (being 'yes' or 'no')

This is a lazy metatag and is only calculated when needed


### _direction:numerical, _direction:leftright 



_direction:numerical is a normalized, numerical direction based on 'camera:direction' or on 'direction'; it is only present if a valid direction is found (e.g. 38.5 or NE). _direction:leftright is either 'left' or 'right', which is left-looking on the map or 'right-looking' on the map




### _now:date, _now:datetime, _loaded:date, _loaded:_datetime 



Adds the time that the data got loaded - pretty much the time of downloading from overpass. The format is YYYY-MM-DD hh:mm, aka 'sortable' aka ISO-8601-but-not-entirely




### _last_edit:contributor, _last_edit:contributor:uid, _last_edit:changeset, _last_edit:timestamp, _version_number, _backend 



Information about the last edit of this object.




### sidewalk:left, sidewalk:right, generic_key:left:property, generic_key:right:property 



Rewrites tags from 'generic_key:both:property' as 'generic_key:left:property' and 'generic_key:right:property' (and similar for sidewalk tagging). Note that this rewritten tags _will be reuploaded on a change_. To prevent to much unrelated retagging, this is only enabled if the layer has at least some lineRenderings with offset defined




 Calculating tags with Javascript 
----------------------------------



In some cases, it is useful to have some tags calculated based on other properties. Some useful tags are available by default (e.g. `lat`, `lon`, `_country`), as detailed above.

It is also possible to calculate your own tags - but this requires some javascript knowledge.



Before proceeding, some warnings:



  - DO NOT DO THIS AS BEGINNER
  - **Only do this if all other techniques fail**  This should _not_ be done to create a rendering effect, only to calculate a specific value
  - **THIS MIGHT BE DISABLED WITHOUT ANY NOTICE ON UNOFFICIAL THEMES** As unofficial themes might be loaded from the internet, this is the equivalent of injecting arbitrary code into the client. It'll be disabled if abuse occurs.


To enable this feature,  add a field `calculatedTags` in the layer object, e.g.:

````

"calculatedTags": [

    "_someKey=javascript-expression",

    "name=feat.properties.name ?? feat.properties.ref ?? feat.properties.operator",

    "_distanceCloserThen3Km=feat.distanceTo( some_lon, some_lat) < 3 ? 'yes' : 'no'" 

  ]

````



The above code will be executed for every feature in the layer. The feature is accessible as `feat` and is an amended geojson object:



  - `area` contains the surface area (in square meters) of the object
  - `lat` and `lon` contain the latitude and longitude


Some advanced functions are available on **feat** as well: 

  - distanceTo
  - overlapWith
  - closest
  - closestn
  - memberships
  - get
 
### distanceTo 

 Calculates the distance between the feature and a specified point in kilometer. The input should either be a pair of coordinates, a geojson feature or the ID of an object 

  0. feature OR featureID OR longitude
  1. undefined OR latitude
 
### overlapWith 

 Gives a list of features from the specified layer which this feature (partly) overlaps with. If the current feature is a point, all features that embed the point are given. The returned value is `{ feat: GeoJSONFeature, overlap: number}[]` where `overlap` is the overlapping surface are (in m²) for areas, the overlapping length (in meter) if the current feature is a line or `undefined` if the current feature is a point.

For example to get all objects which overlap or embed from a layer, use `_contained_climbing_routes_properties=feat.overlapWith('climbing_route')` 

  0. ...layerIds - one or more layer ids  of the layer from which every feature is checked for overlap)
 
### closest 

 Given either a list of geojson features or a single layer name, gives the single object which is nearest to the feature. In the case of ways/polygons, only the centerpoint is considered. Returns a single geojson feature or undefined if nothing is found (or not yet laoded) 

  0. list of features or a layer name or '*' to get all features
 
### closestn 

 Given either a list of geojson features or a single layer name, gives the n closest objects which are nearest to the feature (excluding the feature itself). In the case of ways/polygons, only the centerpoint is considered. Returns a list of `{feat: geojson, distance:number}` the empty list if nothing is found (or not yet loaded)

If a 'unique tag key' is given, the tag with this key will only appear once (e.g. if 'name' is given, all features will have a different name) 

  0. list of features or layer name or '*' to get all features
  1. amount of features
  2. unique tag key (optional)
  3. maxDistanceInMeters (optional)
 
### memberships 

 Gives a list of `{role: string, relation: Relation}`-objects, containing all the relations that this feature is part of. 

For example: `_part_of_walking_routes=feat.memberships().map(r => r.relation.tags.name).join(';')` 


 
### get 

 Gets the property of the feature, parses it (as JSON) and returns it. Might return 'undefined' if not defined, null, ... 

  0. key
 Generated from SimpleMetaTagger, ExtraFunction