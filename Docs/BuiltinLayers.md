

 Special and other useful layers 
=================================

 ## Table of contents

1. [Special and other useful layers](#Special_and_other_useful_layers)
1. [Priviliged layers](#Priviliged_layers)
    + [gps_location](#gps_location)
    + [gps_location_history](#gps_location_history)
    + [home_location](#home_location)
    + [gps_track](#gps_track)
    + [type_node](#type_node)
    + [conflation](#conflation)
    + [left_right_style](#left_right_style)
1. [Frequently reused layers](#Frequently_reused_layers)
    + [bicycle_library](#bicycle_library)
      * [Themes using this layer](#Themes_using_this_layer)
    + [drinking_water](#drinking_water)
      * [Themes using this layer](#Themes_using_this_layer)
    + [food](#food)
      * [Themes using this layer](#Themes_using_this_layer)
    + [map](#map)
      * [Themes using this layer](#Themes_using_this_layer)
    + [all_streets](#all_streets)
      * [Themes using this layer](#Themes_using_this_layer)

 MapComplete has a few data layers available in the theme which have special properties through builtin-hooks. Furthermore, there are some normal layers (which are built from normal Theme-config files) but are so general that they get a mention here. 

 Priviliged layers 
===================

 

  - [gps_location](#gps_location)
  - [gps_location_history](#gps_location_history)
  - [home_location](#home_location)
  - [gps_track](#gps_track)
  - [type_node](#type_node)
  - [conflation](#conflation)
  - [left_right_style](#left_right_style)
 

### gps_location 



Meta layer showing the current location of the user. Add this to your theme and override the icon to change the appearance of the current location. The object will always have `id=gps` and will have _all_ the properties included in the [`Coordinates`-object](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates) returned by the browser.

[Go to the source code](../assets/layers/gps_location/gps_location.json)



  - **This layer is included automatically in every theme. This layer might contain no points**
  - Not clickable by default. If you import this layer in your theme, override `title` to make this clickable
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`
 

### gps_location_history 



Meta layer which contains the previous locations of the user as single points. This is mainly for technical reasons, e.g. to keep match the distance to the modified object

[Go to the source code](../assets/layers/gps_location_history/gps_location_history.json)



  - **This layer is included automatically in every theme. This layer might contain no points**
  - Not clickable by default. If you import this layer in your theme, override `title` to make this clickable
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`
  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`
 

### home_location 



Meta layer showing the home location of the user. The home location can be set in the [profile settings](https://www.openstreetmap.org/profile/edit) of OpenStreetMap.

[Go to the source code](../assets/layers/home_location/home_location.json)



  - **This layer is included automatically in every theme. This layer might contain no points**
  - Not clickable by default. If you import this layer in your theme, override `title` to make this clickable
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`
 

### gps_track 



Meta layer showing the previous locations of the user as single line. Add this to your theme and override the icon to change the appearance of the current location.

[Go to the source code](../assets/layers/gps_track/gps_track.json)



  - **This layer is included automatically in every theme. This layer might contain no points**
  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`
 

### type_node 



This is a priviliged meta_layer which exports _every_ point in OSM. This only works if zoomed below the point that the full tile is loaded (and not loaded via Overpass). Note that this point will also contain a property `parent_ways` which contains all the ways this node is part of as a list. This is mainly used for extremely specialized themes, which do advanced conflations. Expert use only.

[Go to the source code](../assets/layers/type_node/type_node.json)



  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`
 

### conflation 



If the import-button is set to conflate two ways, a preview is shown. This layer defines how this preview is rendered. This layer cannot be included in a theme.

[Go to the source code](../assets/layers/conflation/conflation.json)



  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.
 

### left_right_style 



Special meta-style which will show one single line, either on the left or on the right depending on the id. This is used in the small popups with left_right roads. Cannot be included in a theme

[Go to the source code](../assets/layers/left_right_style/left_right_style.json)



  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.
 

 Frequently reused layers 
==========================

 The following layers are used by at least 2 mapcomplete themes and might be interesting for your custom theme too 

  - [bicycle_library](#bicycle_library)
  - [drinking_water](#drinking_water)
  - [food](#food)
  - [map](#map)
  - [all_streets](#all_streets)
 

### bicycle_library 



A facility where bicycles can be lent for longer period of times

[Go to the source code](../assets/layers/bicycle_library/bicycle_library.json)








#### Themes using this layer 





  - [bicyclelib](https://mapcomplete.osm.be/bicyclelib)
  - [cyclofix](https://mapcomplete.osm.be/cyclofix)
 

### drinking_water 



[Go to the source code](../assets/layers/drinking_water/drinking_water.json)








#### Themes using this layer 





  - [cyclofix](https://mapcomplete.osm.be/cyclofix)
  - [drinking_water](https://mapcomplete.osm.be/drinking_water)
  - [nature](https://mapcomplete.osm.be/nature)
 

### food 



[Go to the source code](../assets/layers/food/food.json)








#### Themes using this layer 





  - [food](https://mapcomplete.osm.be/food)
  - [fritures](https://mapcomplete.osm.be/fritures)
 

### map 



A map, meant for tourists which is permanently installed in the public space

[Go to the source code](../assets/layers/map/map.json)








#### Themes using this layer 





  - [maps](https://mapcomplete.osm.be/maps)
  - [nature](https://mapcomplete.osm.be/nature)
 

### all_streets 



[Go to the source code](../assets/layers/all_streets/all_streets.json)



  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`




#### Themes using this layer 





  - [cyclestreets](https://mapcomplete.osm.be/cyclestreets)
  - [street_lighting](https://mapcomplete.osm.be/street_lighting)
 

This document is autogenerated from AllKnownLayers.ts