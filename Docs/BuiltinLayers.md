

 Special and other useful layers 
=================================



## Table of contents

1. [Special and other useful layers](#special-and-other-useful-layers)
1. [Priviliged layers](#priviliged-layers)
1. [gps_location](#gps_location)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [gps_location_history](#gps_location_history)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [home_location](#home_location)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [gps_track](#gps_track)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [Privacy notice](#privacy-notice)
    + [export_as_gpx](#export_as_gpx)
    + [export_as_geojson](#export_as_geojson)
    + [uploadtoosm](#uploadtoosm)
    + [minimap](#minimap)
    + [delete](#delete)
1. [type_node](#type_node)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [note](#note)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [conversation](#conversation)
    + [add_image](#add_image)
    + [comment](#comment)
    + [nearby-images](#nearby-images)
    + [report-contributor](#report-contributor)
    + [report-note](#report-note)
1. [import_candidate](#import_candidate)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [all_tags](#all_tags)
1. [direction](#direction)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [conflation](#conflation)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [left_right_style](#left_right_style)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [split_point](#split_point)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [current_view](#current_view)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [matchpoint](#matchpoint)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
1. [Normal layers](#normal-layers)



MapComplete has a few data layers available in the theme which have special properties through builtin-hooks. Furthermore, there are some normal layers (which are built from normal Theme-config files) but are so general that they get a mention here.



 Priviliged layers 
===================





  - [gps_location](#gps_location)
  - [gps_location_history](#gps_location_history)
  - [home_location](#home_location)
  - [gps_track](#gps_track)
  - [type_node](#type_node)
  - [note](#note)
  - [import_candidate](#import_candidate)
  - [direction](#direction)
  - [conflation](#conflation)
  - [left_right_style](#left_right_style)
  - [split_point](#split_point)
  - [current_view](#current_view)
  - [matchpoint](#matchpoint)




 gps_location 
==============



<img src='https://mapcomplete.osm.be/crosshair:var(--catch-detail-color)' height="100px"> 

Meta layer showing the current location of the user. Add this to your theme and override the icon to change the appearance of the current location. The object will always have `id=gps` and will have _all_ the properties included in the [`Coordinates`-object](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates) returned by the browser.






  - This layer is shown at zoomlevel **0** and higher
  - **This layer is included automatically in every theme. This layer might contain no points**
  - Elements don't have a title set and cannot be toggled nor will they show up in the dashboard. If you import this layer in your theme, override `title` to make this toggleable.
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:id' target='_blank'>id</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:id%3Dgps' target='_blank'>gps</a>




 Supported attributes 
----------------------





 gps_location_history 
======================



<img src='https://mapcomplete.osm.be/square:red' height="100px"> 

Meta layer which contains the previous locations of the user as single points. This is mainly for technical reasons, e.g. to keep match the distance to the modified object






  - This layer is shown at zoomlevel **1** and higher
  - **This layer is included automatically in every theme. This layer might contain no points**
  - This layer is not visible by default and must be enabled in the filter by the user. 
  - Elements don't have a title set and cannot be toggled nor will they show up in the dashboard. If you import this layer in your theme, override `title` to make this toggleable.
  - This layer is not visible by default and the visibility cannot be toggled, effectively resulting in a fully hidden layer. This can be useful, e.g. to calculate some metatags. If you want to render this layer (e.g. for debugging), enable it by setting the URL-parameter layer-<id>=true
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:user:location' target='_blank'>user:location</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:user:location%3Dyes' target='_blank'>yes</a>




 Supported attributes 
----------------------





 home_location 
===============



<img src='https://mapcomplete.osm.be/circle:white;./assets/svg/home.svg' height="100px"> 

Meta layer showing the home location of the user. The home location can be set in the [profile settings](https://www.openstreetmap.org/profile/edit) of OpenStreetMap.






  - This layer is shown at zoomlevel **0** and higher
  - **This layer is included automatically in every theme. This layer might contain no points**
  - Elements don't have a title set and cannot be toggled nor will they show up in the dashboard. If you import this layer in your theme, override `title` to make this toggleable.
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:user:home' target='_blank'>user:home</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:user:home%3Dyes' target='_blank'>yes</a>




 Supported attributes 
----------------------





 gps_track 
===========





Meta layer showing the previous locations of the user as single line with controls, e.g. to erase, upload or download this track. Add this to your theme and override the maprendering to change the appearance of the travelled track.






  - This layer is shown at zoomlevel **0** and higher
  - **This layer is included automatically in every theme. This layer might contain no points**
  - This layer is not visible by default and must be enabled in the filter by the user. 
  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:id' target='_blank'>id</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:id%3Dlocation_track' target='_blank'>location_track</a>




 Supported attributes 
----------------------





### Privacy notice 



This tagrendering has no question and is thus read-only





### export_as_gpx 



Shows a button to export this feature as GPX. Especially useful for route relations

This tagrendering has no question and is thus read-only





### export_as_geojson 



Shows a button to export this feature as geojson. Especially useful for debugging or using this in other programs

This tagrendering has no question and is thus read-only





### uploadtoosm 



This tagrendering has no question and is thus read-only





### minimap 



Shows a small map with the feature. Added by default to every popup

This tagrendering has no question and is thus read-only





### delete 



This tagrendering has no question and is thus read-only





 type_node 
===========





This is a priviliged meta_layer which exports _every_ point in OSM. This only works if zoomed below the point that the full tile is loaded (and not loaded via Overpass). Note that this point will also contain a property `parent_ways` which contains all the ways this node is part of as a list. This is mainly used for extremely specialized themes, which do advanced conflations. Expert use only.






  - This layer is shown at zoomlevel **18** and higher
  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - id~^(node\/.*)$




 Supported attributes 
----------------------





 note 
======



<img src='https://mapcomplete.osm.be/./assets/svg/note.svg' height="100px"> 

This layer shows notes on OpenStreetMap. Having this layer in your theme will trigger the 'add new note' functionality in the 'addNewPoint'-popup (or if your theme has no presets, it'll enable adding notes)






  - This layer is shown at zoomlevel **10** and higher
  - <img src='../warning.svg' height='1rem'/> This layer is loaded from an external source, namely  `https://api.openstreetmap.org/api/0.6/notes.json?limit=10000&closed=7&bbox={x_min},{y_min},{x_max},{y_max}`




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - id~.+




 Supported attributes 
----------------------





### conversation 



This tagrendering has no question and is thus read-only





### add_image 



This tagrendering has no question and is thus read-only





### comment 



This tagrendering has no question and is thus read-only





### nearby-images 



This tagrendering has no question and is thus read-only





### report-contributor 



This tagrendering has no question and is thus read-only



This tagrendering is only visible in the popup if the following condition is met: `_opened_by_anonymous_user=false`



### report-note 



This tagrendering has no question and is thus read-only





 import_candidate 
==================



<img src='https://mapcomplete.osm.be/square:red;' height="100px"> 

Layer used in the importHelper






  - This layer is shown at zoomlevel **0** and higher
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:








 Supported attributes 
----------------------





### all_tags 



This tagrendering has no question and is thus read-only





 direction 
===========



<img src='https://mapcomplete.osm.be/direction_gradient:var(--catch-detail-color)' height="100px"> 

This layer visualizes directions






  - This layer is shown at zoomlevel **16** and higher
  - Elements don't have a title set and cannot be toggled nor will they show up in the dashboard. If you import this layer in your theme, override `title` to make this toggleable.




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - camera:direction~.+|direction~.+




 Supported attributes 
----------------------





 conflation 
============



<img src='https://mapcomplete.osm.be/addSmall:#000' height="100px"> 

If the import-button moves OSM points, the imported way points or conflates, a preview is shown. This layer defines how this preview is rendered. This layer cannot be included in a theme.






  - This layer is shown at zoomlevel **1** and higher
  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:move' target='_blank'>move</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:move%3Dyes' target='_blank'>yes</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:newpoint' target='_blank'>newpoint</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:newpoint%3Dyes' target='_blank'>yes</a>




 Supported attributes 
----------------------





 left_right_style 
==================





Special meta-style which will show one single line, either on the left or on the right depending on the id. This is used in the small popups with left_right roads. Cannot be included in a theme






  - This layer is shown at zoomlevel **0** and higher
  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:id' target='_blank'>id</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:id%3Dleft' target='_blank'>left</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:id' target='_blank'>id</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:id%3Dright' target='_blank'>right</a>




 Supported attributes 
----------------------





 split_point 
=============



<img src='https://mapcomplete.osm.be/circle:white;./assets/svg/scissors.svg' height="100px"> 

Layer rendering the little scissors for the minimap in the 'splitRoadWizard'






  - This layer is shown at zoomlevel **1** and higher
  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:_split_point' target='_blank'>_split_point</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:_split_point%3Dyes' target='_blank'>yes</a>




 Supported attributes 
----------------------





 current_view 
==============





A meta-layer which contains one single feature, namely the BBOX of the current map view. This can be used to trigger special actions. If a popup is defined for this layer, this popup will be accessible via an extra button on screen.

The icon on the button is the default icon of the layer, but can be customized by detecting 'button=yes'.






  - This layer is shown at zoomlevel **0** and higher
  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:current_view' target='_blank'>current_view</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:current_view%3Dyes' target='_blank'>yes</a>




 Supported attributes 
----------------------





 matchpoint 
============



<img src='https://mapcomplete.osm.be/./assets/svg/crosshair-empty.svg' height="100px"> 

The default rendering for a locationInput which snaps onto another object






  - This layer is shown at zoomlevel **0** and higher
  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:








 Supported attributes 
----------------------





 Normal layers 
===============



The following layers are included in MapComplete:



  - [address](./Layers/address.md)
  - [ambulancestation](./Layers/ambulancestation.md)
  - [artwork](./Layers/artwork.md)
  - [barrier](./Layers/barrier.md)
  - [bench](./Layers/bench.md)
  - [bench_at_pt](./Layers/bench_at_pt.md)
  - [bicycle_library](./Layers/bicycle_library.md)
  - [bicycle_rental](./Layers/bicycle_rental.md)
  - [bicycle_tube_vending_machine](./Layers/bicycle_tube_vending_machine.md)
  - [bike_cafe](./Layers/bike_cafe.md)
  - [bike_cleaning](./Layers/bike_cleaning.md)
  - [bike_parking](./Layers/bike_parking.md)
  - [bike_repair_station](./Layers/bike_repair_station.md)
  - [bike_shop](./Layers/bike_shop.md)
  - [bike_themed_object](./Layers/bike_themed_object.md)
  - [binocular](./Layers/binocular.md)
  - [birdhide](./Layers/birdhide.md)
  - [cafe_pub](./Layers/cafe_pub.md)
  - [charging_station](./Layers/charging_station.md)
  - [climbing](./Layers/climbing.md)
  - [climbing_area](./Layers/climbing_area.md)
  - [climbing_club](./Layers/climbing_club.md)
  - [climbing_gym](./Layers/climbing_gym.md)
  - [climbing_opportunity](./Layers/climbing_opportunity.md)
  - [climbing_route](./Layers/climbing_route.md)
  - [cluster_style](./Layers/cluster_style.md)
  - [conflation](./Layers/conflation.md)
  - [crab_address](./Layers/crab_address.md)
  - [crossings](./Layers/crossings.md)
  - [current_view](./Layers/current_view.md)
  - [cycleways_and_roads](./Layers/cycleways_and_roads.md)
  - [defibrillator](./Layers/defibrillator.md)
  - [dentist](./Layers/dentist.md)
  - [direction](./Layers/direction.md)
  - [doctors](./Layers/doctors.md)
  - [dogpark](./Layers/dogpark.md)
  - [drinking_water](./Layers/drinking_water.md)
  - [elevator](./Layers/elevator.md)
  - [entrance](./Layers/entrance.md)
  - [etymology](./Layers/etymology.md)
  - [extinguisher](./Layers/extinguisher.md)
  - [filters](./Layers/filters.md)
  - [fire_station](./Layers/fire_station.md)
  - [fitness_centre](./Layers/fitness_centre.md)
  - [fitness_station](./Layers/fitness_station.md)
  - [food](./Layers/food.md)
  - [ghost_bike](./Layers/ghost_bike.md)
  - [governments](./Layers/governments.md)
  - [gps_location](./Layers/gps_location.md)
  - [gps_location_history](./Layers/gps_location_history.md)
  - [gps_track](./Layers/gps_track.md)
  - [grass_in_parks](./Layers/grass_in_parks.md)
  - [hackerspace](./Layers/hackerspace.md)
  - [home_location](./Layers/home_location.md)
  - [hospital](./Layers/hospital.md)
  - [hotel](./Layers/hotel.md)
  - [hydrant](./Layers/hydrant.md)
  - [id_presets](./Layers/id_presets.md)
  - [import_candidate](./Layers/import_candidate.md)
  - [indoors](./Layers/indoors.md)
  - [information_board](./Layers/information_board.md)
  - [kerbs](./Layers/kerbs.md)
  - [kindergarten_childcare](./Layers/kindergarten_childcare.md)
  - [left_right_style](./Layers/left_right_style.md)
  - [map](./Layers/map.md)
  - [maproulette](./Layers/maproulette.md)
  - [maproulette_challenge](./Layers/maproulette_challenge.md)
  - [matchpoint](./Layers/matchpoint.md)
  - [maxspeed](./Layers/maxspeed.md)
  - [named_streets](./Layers/named_streets.md)
  - [nature_reserve](./Layers/nature_reserve.md)
  - [note](./Layers/note.md)
  - [observation_tower](./Layers/observation_tower.md)
  - [osm_community_index](./Layers/osm_community_index.md)
  - [parcel_lockers](./Layers/parcel_lockers.md)
  - [parking](./Layers/parking.md)
  - [parking_spaces](./Layers/parking_spaces.md)
  - [pedestrian_path](./Layers/pedestrian_path.md)
  - [pharmacy](./Layers/pharmacy.md)
  - [physiotherapist](./Layers/physiotherapist.md)
  - [picnic_table](./Layers/picnic_table.md)
  - [play_forest](./Layers/play_forest.md)
  - [playground](./Layers/playground.md)
  - [postboxes](./Layers/postboxes.md)
  - [postoffices](./Layers/postoffices.md)
  - [public_bookcase](./Layers/public_bookcase.md)
  - [rainbow_crossings](./Layers/rainbow_crossings.md)
  - [reception_desk](./Layers/reception_desk.md)
  - [recycling](./Layers/recycling.md)
  - [school](./Layers/school.md)
  - [shelter](./Layers/shelter.md)
  - [shops](./Layers/shops.md)
  - [slow_roads](./Layers/slow_roads.md)
  - [speed_camera](./Layers/speed_camera.md)
  - [speed_display](./Layers/speed_display.md)
  - [split_point](./Layers/split_point.md)
  - [sport_pitch](./Layers/sport_pitch.md)
  - [sports_centre](./Layers/sports_centre.md)
  - [stairs](./Layers/stairs.md)
  - [street_lamps](./Layers/street_lamps.md)
  - [surveillance_camera](./Layers/surveillance_camera.md)
  - [tertiary_education](./Layers/tertiary_education.md)
  - [toilet](./Layers/toilet.md)
  - [toilet_at_amenity](./Layers/toilet_at_amenity.md)
  - [trail](./Layers/trail.md)
  - [transit_routes](./Layers/transit_routes.md)
  - [transit_stops](./Layers/transit_stops.md)
  - [tree_node](./Layers/tree_node.md)
  - [type_node](./Layers/type_node.md)
  - [veterinary](./Layers/veterinary.md)
  - [viewpoint](./Layers/viewpoint.md)
  - [village_green](./Layers/village_green.md)
  - [visitor_information_centre](./Layers/visitor_information_centre.md)
  - [walls_and_buildings](./Layers/walls_and_buildings.md)
  - [waste_basket](./Layers/waste_basket.md)
  - [waste_disposal](./Layers/waste_disposal.md)
  - [watermill](./Layers/watermill.md)
  - [windturbine](./Layers/windturbine.md)
 

This document is autogenerated from [Customizations/AllKnownLayouts.ts](https://github.com/pietervdvn/MapComplete/blob/develop/Customizations/AllKnownLayouts.ts)