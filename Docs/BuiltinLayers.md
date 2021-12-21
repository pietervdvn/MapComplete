

 Special and other useful layers 
=================================

 ## Table of contents

1. [Special and other useful layers](#special-and-other-useful-layers)
1. [Priviliged layers](#priviliged-layers)
    + [gps_location](#gps_location)
    + [gps_location_history](#gps_location_history)
    + [home_location](#home_location)
    + [gps_track](#gps_track)
    + [type_node](#type_node)
    + [conflation](#conflation)
    + [left_right_style](#left_right_style)
    + [split_point](#split_point)
    + [current_view](#current_view)
1. [Normal layers](#normal-layers)
  - [Frequently reused layers](#frequently-reused-layers)
    + [bicycle_library](#bicycle_library)
      * [Themes using this layer](#themes-using-this-layer)
    + [drinking_water](#drinking_water)
      * [Themes using this layer](#themes-using-this-layer)
    + [food](#food)
      * [Themes using this layer](#themes-using-this-layer)
    + [map](#map)
      * [Themes using this layer](#themes-using-this-layer)
    + [walls_and_buildings](#walls_and_buildings)
      * [Themes using this layer](#themes-using-this-layer)
    + [ambulancestation](#ambulancestation)
      * [Themes using this layer](#themes-using-this-layer)
    + [artwork](#artwork)
      * [Themes using this layer](#themes-using-this-layer)
    + [barrier](#barrier)
      * [Themes using this layer](#themes-using-this-layer)
    + [bench](#bench)
      * [Themes using this layer](#themes-using-this-layer)
    + [bench_at_pt](#bench_at_pt)
      * [Themes using this layer](#themes-using-this-layer)
    + [bicycle_tube_vending_machine](#bicycle_tube_vending_machine)
      * [Themes using this layer](#themes-using-this-layer)
    + [bike_cafe](#bike_cafe)
      * [Themes using this layer](#themes-using-this-layer)
    + [bike_cleaning](#bike_cleaning)
      * [Themes using this layer](#themes-using-this-layer)
    + [bike_parking](#bike_parking)
      * [Themes using this layer](#themes-using-this-layer)
    + [bike_repair_station](#bike_repair_station)
      * [Themes using this layer](#themes-using-this-layer)
    + [bike_shop](#bike_shop)
      * [Themes using this layer](#themes-using-this-layer)
    + [bike_themed_object](#bike_themed_object)
      * [Themes using this layer](#themes-using-this-layer)
    + [binocular](#binocular)
      * [Themes using this layer](#themes-using-this-layer)
    + [birdhide](#birdhide)
      * [Themes using this layer](#themes-using-this-layer)
    + [cafe_pub](#cafe_pub)
      * [Themes using this layer](#themes-using-this-layer)
    + [charging_station](#charging_station)
      * [Themes using this layer](#themes-using-this-layer)
    + [crossings](#crossings)
      * [Themes using this layer](#themes-using-this-layer)
    + [cycleways_and_roads](#cycleways_and_roads)
      * [Themes using this layer](#themes-using-this-layer)
    + [defibrillator](#defibrillator)
      * [Themes using this layer](#themes-using-this-layer)
    + [direction](#direction)
      * [Themes using this layer](#themes-using-this-layer)
    + [entrance](#entrance)
      * [Themes using this layer](#themes-using-this-layer)
    + [etymology](#etymology)
      * [Themes using this layer](#themes-using-this-layer)
    + [extinguisher](#extinguisher)
      * [Themes using this layer](#themes-using-this-layer)
    + [fire_station](#fire_station)
      * [Themes using this layer](#themes-using-this-layer)
    + [ghost_bike](#ghost_bike)
      * [Themes using this layer](#themes-using-this-layer)
    + [hydrant](#hydrant)
      * [Themes using this layer](#themes-using-this-layer)
    + [information_board](#information_board)
      * [Themes using this layer](#themes-using-this-layer)
    + [nature_reserve](#nature_reserve)
      * [Themes using this layer](#themes-using-this-layer)
    + [observation_tower](#observation_tower)
      * [Themes using this layer](#themes-using-this-layer)
    + [parking](#parking)
      * [Themes using this layer](#themes-using-this-layer)
    + [pedestrian_path](#pedestrian_path)
      * [Themes using this layer](#themes-using-this-layer)
    + [picnic_table](#picnic_table)
      * [Themes using this layer](#themes-using-this-layer)
    + [playground](#playground)
      * [Themes using this layer](#themes-using-this-layer)
    + [public_bookcase](#public_bookcase)
      * [Themes using this layer](#themes-using-this-layer)
    + [shops](#shops)
      * [Themes using this layer](#themes-using-this-layer)
    + [sport_pitch](#sport_pitch)
      * [Themes using this layer](#themes-using-this-layer)
    + [street_lamps](#street_lamps)
      * [Themes using this layer](#themes-using-this-layer)
    + [surveillance_camera](#surveillance_camera)
      * [Themes using this layer](#themes-using-this-layer)
    + [toilet](#toilet)
      * [Themes using this layer](#themes-using-this-layer)
    + [tree_node](#tree_node)
      * [Themes using this layer](#themes-using-this-layer)
    + [waste_basket](#waste_basket)
      * [Themes using this layer](#themes-using-this-layer)

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
  - [split_point](#split_point)
  - [current_view](#current_view)
 

### gps_location 



Meta layer showing the current location of the user. Add this to your theme and override the icon to change the appearance of the current location. The object will always have `id=gps` and will have _all_ the properties included in the [`Coordinates`-object](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates) returned by the browser.

[Go to the source code](../assets/layers/gps_location/gps_location.json)



  - **This layer is included automatically in every theme. This layer might contain no points**
  - This layer cannot be toggled in the filter view. If you import this layer in your theme, override `title` to make this toggleable.
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`
 

### gps_location_history 



Meta layer which contains the previous locations of the user as single points. This is mainly for technical reasons, e.g. to keep match the distance to the modified object

[Go to the source code](../assets/layers/gps_location_history/gps_location_history.json)



  - **This layer is included automatically in every theme. This layer might contain no points**
  - This layer cannot be toggled in the filter view. If you import this layer in your theme, override `title` to make this toggleable.
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`
  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`
 

### home_location 



Meta layer showing the home location of the user. The home location can be set in the [profile settings](https://www.openstreetmap.org/profile/edit) of OpenStreetMap.

[Go to the source code](../assets/layers/home_location/home_location.json)



  - **This layer is included automatically in every theme. This layer might contain no points**
  - This layer cannot be toggled in the filter view. If you import this layer in your theme, override `title` to make this toggleable.
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`
 

### gps_track 



Meta layer showing the previous locations of the user as single line. Add this to your theme and override the icon to change the appearance of the current location.

[Go to the source code](../assets/layers/gps_track/gps_track.json)



  - **This layer is included automatically in every theme. This layer might contain no points**
  - This layer is not visible by default and must be enabled in the filter by the user. 
  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`
 

### type_node 



This is a priviliged meta_layer which exports _every_ point in OSM. This only works if zoomed below the point that the full tile is loaded (and not loaded via Overpass). Note that this point will also contain a property `parent_ways` which contains all the ways this node is part of as a list. This is mainly used for extremely specialized themes, which do advanced conflations. Expert use only.

[Go to the source code](../assets/layers/type_node/type_node.json)



  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`
 

### conflation 



If the import-button moves OSM points, the imported way points or conflates, a preview is shown. This layer defines how this preview is rendered. This layer cannot be included in a theme.

[Go to the source code](../assets/layers/conflation/conflation.json)



  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.
 

### left_right_style 



Special meta-style which will show one single line, either on the left or on the right depending on the id. This is used in the small popups with left_right roads. Cannot be included in a theme

[Go to the source code](../assets/layers/left_right_style/left_right_style.json)



  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.
 

### split_point 



Layer rendering the little scissors for the minimap in the 'splitRoadWizard'

[Go to the source code](../assets/layers/split_point/split_point.json)



  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.
 

### current_view 



A meta-layer which contains one single feature, namely the BBOX of the current map view. This can be used to trigger special actions. If a popup is defined for this layer, this popup will be accessible via an extra button on screen.

The icon on the button is the default icon of the layer, but can be customized by detecting 'button=yes'.

[Go to the source code](../assets/layers/current_view/current_view.json)



  - This layer can **not** be included in a theme. It is solely used by [special renderings](SpecialRenderings.md) showing a minimap with custom data.
 

 Normal layers 
===============

 The following layers are included in MapComplete 

 Frequently reused layers 
--------------------------

 The following layers are used by at least 2 mapcomplete themes and might be interesting for your custom theme too 

  - [bicycle_library](#bicycle_library)
  - [drinking_water](#drinking_water)
  - [food](#food)
  - [map](#map)
  - [walls_and_buildings](#walls_and_buildings)
 

### bicycle_library 



A facility where bicycles can be lent for longer period of times

[Go to the source code](../assets/layers/bicycle_library/bicycle_library.json)








#### Themes using this layer 





  - [bicyclelib](https://mapcomplete.osm.be/bicyclelib)
  - [cyclofix](https://mapcomplete.osm.be/cyclofix)
 

### drinking_water 



A layer showing drinking water fountains

[Go to the source code](../assets/layers/drinking_water/drinking_water.json)



  - This layer will automatically load  [drinking_water](#drinking_water)  into the layout as it depends on it:  A calculated tag loads features from this layer (calculatedTag[0] which calculates the value for _closest_other_drinking_water)
  - This layer is needed as dependency for layer [drinking_water](#drinking_water)




#### Themes using this layer 





  - [cyclofix](https://mapcomplete.osm.be/cyclofix)
  - [drinking_water](https://mapcomplete.osm.be/drinking_water)
  - [nature](https://mapcomplete.osm.be/nature)
 

### food 



A layer showing restaurants and fast-food amenities (with a special rendering for friteries)

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
 

### walls_and_buildings 



Special builtin layer providing all walls and buildings. This layer is useful in presets for objects which can be placed against walls (e.g. AEDs, postboxes, entrances, addresses, surveillance cameras, ...). This layer is invisible by default and not toggleable by the user.

[Go to the source code](../assets/layers/walls_and_buildings/walls_and_buildings.json)



  - This layer is not visible by default and must be enabled in the filter by the user. 
  - Not visible in the layer selection by default. If you want to make this layer toggable, override `name`
  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`
  - This layer is needed as dependency for layer [defibrillator](#defibrillator)
  - This layer is needed as dependency for layer [entrance](#entrance)
  - This layer is needed as dependency for layer [surveillance_camera](#surveillance_camera)




#### Themes using this layer 





  - [aed](https://mapcomplete.osm.be/aed)
  - [entrances](https://mapcomplete.osm.be/entrances)
  - [surveillance](https://mapcomplete.osm.be/surveillance)
 

  - [ambulancestation](#ambulancestation)
  - [artwork](#artwork)
  - [barrier](#barrier)
  - [bench](#bench)
  - [bench_at_pt](#bench_at_pt)
  - [bicycle_tube_vending_machine](#bicycle_tube_vending_machine)
  - [bike_cafe](#bike_cafe)
  - [bike_cleaning](#bike_cleaning)
  - [bike_parking](#bike_parking)
  - [bike_repair_station](#bike_repair_station)
  - [bike_shop](#bike_shop)
  - [bike_themed_object](#bike_themed_object)
  - [binocular](#binocular)
  - [birdhide](#birdhide)
  - [cafe_pub](#cafe_pub)
  - [charging_station](#charging_station)
  - [crossings](#crossings)
  - [cycleways_and_roads](#cycleways_and_roads)
  - [defibrillator](#defibrillator)
  - [direction](#direction)
  - [entrance](#entrance)
  - [etymology](#etymology)
  - [extinguisher](#extinguisher)
  - [fire_station](#fire_station)
  - [ghost_bike](#ghost_bike)
  - [hydrant](#hydrant)
  - [information_board](#information_board)
  - [nature_reserve](#nature_reserve)
  - [observation_tower](#observation_tower)
  - [parking](#parking)
  - [pedestrian_path](#pedestrian_path)
  - [picnic_table](#picnic_table)
  - [playground](#playground)
  - [public_bookcase](#public_bookcase)
  - [shops](#shops)
  - [sport_pitch](#sport_pitch)
  - [street_lamps](#street_lamps)
  - [surveillance_camera](#surveillance_camera)
  - [toilet](#toilet)
  - [tree_node](#tree_node)
  - [waste_basket](#waste_basket)
 

### ambulancestation 



An ambulance station is an area for storage of ambulance vehicles, medical equipment, personal protective equipment, and other medical supplies.

[Go to the source code](../assets/layers/ambulancestation/ambulancestation.json)








#### Themes using this layer 





  - [hailhydrant](https://mapcomplete.osm.be/hailhydrant)
 

### artwork 



Diverse pieces of artwork

[Go to the source code](../assets/layers/artwork/artwork.json)








#### Themes using this layer 





  - [artwork](https://mapcomplete.osm.be/artwork)
 

### barrier 



Obstacles while cycling, such as bollards and cycle barriers

[Go to the source code](../assets/layers/barrier/barrier.json)



  - This layer will automatically load  [cycleways_and_roads](#cycleways_and_roads)  into the layout as it depends on it:  a preset snaps to this layer (presets[0])
  - This layer will automatically load  [cycleways_and_roads](#cycleways_and_roads)  into the layout as it depends on it:  a preset snaps to this layer (presets[1])




#### Themes using this layer 





  - [cycle_infra](https://mapcomplete.osm.be/cycle_infra)
 

### bench 



A bench is a wooden, metal, stone, ... surface where a human can sit. This layers visualises them and asks a few questions about them.

[Go to the source code](../assets/layers/bench/bench.json)








#### Themes using this layer 





  - [benches](https://mapcomplete.osm.be/benches)
 

### bench_at_pt 



A layer showing all public-transport-stops which do have a bench

[Go to the source code](../assets/layers/bench_at_pt/bench_at_pt.json)








#### Themes using this layer 





  - [benches](https://mapcomplete.osm.be/benches)
 

### bicycle_tube_vending_machine 



A layer showing vending machines for bicycle tubes (either purpose-built bicycle tube vending machines or classical vending machines with bicycle tubes and optionally additional bicycle related objects such as lights, gloves, locks, ...)

[Go to the source code](../assets/layers/bicycle_tube_vending_machine/bicycle_tube_vending_machine.json)








#### Themes using this layer 





  - [cyclofix](https://mapcomplete.osm.be/cyclofix)
 

### bike_cafe 



A bike café is a café geared towards cyclists, for example with services such as a pump, with lots of bicycle-related decoration, ...

[Go to the source code](../assets/layers/bike_cafe/bike_cafe.json)








#### Themes using this layer 





  - [cyclofix](https://mapcomplete.osm.be/cyclofix)
 

### bike_cleaning 



A layer showing facilities where one can clean their bike

[Go to the source code](../assets/layers/bike_cleaning/bike_cleaning.json)








#### Themes using this layer 





  - [cyclofix](https://mapcomplete.osm.be/cyclofix)
 

### bike_parking 



A layer showing where you can park your bike

[Go to the source code](../assets/layers/bike_parking/bike_parking.json)








#### Themes using this layer 





  - [cyclofix](https://mapcomplete.osm.be/cyclofix)
 

### bike_repair_station 



A layer showing bicycle pumps and bicycle repair tool stands

[Go to the source code](../assets/layers/bike_repair_station/bike_repair_station.json)








#### Themes using this layer 





  - [cyclofix](https://mapcomplete.osm.be/cyclofix)
 

### bike_shop 



A shop specifically selling bicycles or related items

[Go to the source code](../assets/layers/bike_shop/bike_shop.json)








#### Themes using this layer 





  - [cyclofix](https://mapcomplete.osm.be/cyclofix)
 

### bike_themed_object 



A layer with bike-themed objects but who don't match any other layer

[Go to the source code](../assets/layers/bike_themed_object/bike_themed_object.json)








#### Themes using this layer 





  - [cyclofix](https://mapcomplete.osm.be/cyclofix)
 

### binocular 



Binoculas

[Go to the source code](../assets/layers/binocular/binocular.json)








#### Themes using this layer 





  - [binoculars](https://mapcomplete.osm.be/binoculars)
 

### birdhide 



Een vogelkijkhut

[Go to the source code](../assets/layers/birdhide/birdhide.json)








#### Themes using this layer 





  - [nature](https://mapcomplete.osm.be/nature)
 

### cafe_pub 



A layer showing cafés and pubs where one can gather around a drink. The layer asks for some relevant questions

[Go to the source code](../assets/layers/cafe_pub/cafe_pub.json)








#### Themes using this layer 





  - [cafes_and_pubs](https://mapcomplete.osm.be/cafes_and_pubs)
 

### charging_station 



A charging station

[Go to the source code](../assets/layers/charging_station/charging_station.json)








#### Themes using this layer 





  - [charging_stations](https://mapcomplete.osm.be/charging_stations)
 

### crossings 



Crossings for pedestrians and cyclists

[Go to the source code](../assets/layers/crossings/crossings.json)



  - This layer will automatically load  [cycleways_and_roads](#cycleways_and_roads)  into the layout as it depends on it:  a preset snaps to this layer (presets[0])
  - This layer will automatically load  [cycleways_and_roads](#cycleways_and_roads)  into the layout as it depends on it:  a preset snaps to this layer (presets[1])




#### Themes using this layer 





  - [cycle_infra](https://mapcomplete.osm.be/cycle_infra)
 

### cycleways_and_roads 



All infrastructure that someone can cycle over, accompanied with questions about this infrastructure"

[Go to the source code](../assets/layers/cycleways_and_roads/cycleways_and_roads.json)



  - This layer is needed as dependency for layer [barrier](#barrier)
  - This layer is needed as dependency for layer [barrier](#barrier)
  - This layer is needed as dependency for layer [crossings](#crossings)
  - This layer is needed as dependency for layer [crossings](#crossings)




#### Themes using this layer 





  - [cycle_infra](https://mapcomplete.osm.be/cycle_infra)
 

### defibrillator 



A layer showing defibrillators which can be used in case of emergency. This contains public defibrillators, but also defibrillators which might need staff to fetch the actual device

[Go to the source code](../assets/layers/defibrillator/defibrillator.json)



  - This layer will automatically load  [walls_and_buildings](#walls_and_buildings)  into the layout as it depends on it:  a preset snaps to this layer (presets[1])




#### Themes using this layer 





  - [aed](https://mapcomplete.osm.be/aed)
 

### direction 



This layer visualizes directions

[Go to the source code](../assets/layers/direction/direction.json)



  - This layer cannot be toggled in the filter view. If you import this layer in your theme, override `title` to make this toggleable.




#### Themes using this layer 





  - [surveillance](https://mapcomplete.osm.be/surveillance)
 

### entrance 



A layer showing entrances and offering capabilities to survey some advanced data which is important for e.g. wheelchair users (but also bicycle users, people who want to deliver, ...)

[Go to the source code](../assets/layers/entrance/entrance.json)



  - This layer will automatically load  [walls_and_buildings](#walls_and_buildings)  into the layout as it depends on it:  a preset snaps to this layer (presets[0])
  - This layer will automatically load  [pedestrian_path](#pedestrian_path)  into the layout as it depends on it:  a preset snaps to this layer (presets[0])




#### Themes using this layer 





  - [entrances](https://mapcomplete.osm.be/entrances)
 

### etymology 



All objects which have an etymology known

[Go to the source code](../assets/layers/etymology/etymology.json)








#### Themes using this layer 





  - [etymology](https://mapcomplete.osm.be/etymology)
 

### extinguisher 



Map layer to show fire hydrants.

[Go to the source code](../assets/layers/extinguisher/extinguisher.json)








#### Themes using this layer 





  - [hailhydrant](https://mapcomplete.osm.be/hailhydrant)
 

### fire_station 



Map layer to show fire stations.

[Go to the source code](../assets/layers/fire_station/fire_station.json)








#### Themes using this layer 





  - [hailhydrant](https://mapcomplete.osm.be/hailhydrant)
 

### ghost_bike 



A layer showing memorials for cyclists, killed in road accidents

[Go to the source code](../assets/layers/ghost_bike/ghost_bike.json)








#### Themes using this layer 





  - [ghostbikes](https://mapcomplete.osm.be/ghostbikes)
 

### hydrant 



Map layer to show fire hydrants.

[Go to the source code](../assets/layers/hydrant/hydrant.json)








#### Themes using this layer 





  - [hailhydrant](https://mapcomplete.osm.be/hailhydrant)
 

### information_board 



A layer showing touristical, road side information boards (e.g. giving information about the landscape, a building, a feature, a map, ...)

[Go to the source code](../assets/layers/information_board/information_board.json)








#### Themes using this layer 





  - [nature](https://mapcomplete.osm.be/nature)
 

### nature_reserve 



Een natuurgebied is een gebied waar actief ruimte gemaakt word voor de natuur. Typisch zijn deze in beheer van Natuurpunt of het Agentschap Natuur en Bos of zijn deze erkend door de overheid.

[Go to the source code](../assets/layers/nature_reserve/nature_reserve.json)








#### Themes using this layer 





  - [nature](https://mapcomplete.osm.be/nature)
 

### observation_tower 



Towers with a panoramic view

[Go to the source code](../assets/layers/observation_tower/observation_tower.json)








#### Themes using this layer 





  - [observation_towers](https://mapcomplete.osm.be/observation_towers)
 

### parking 



A layer showing car parkings

[Go to the source code](../assets/layers/parking/parking.json)








#### Themes using this layer 





  - [parkings](https://mapcomplete.osm.be/parkings)
 

### pedestrian_path 



Pedestrian footpaths, especially used for indoor navigation and snapping entrances to this layer

[Go to the source code](../assets/layers/pedestrian_path/pedestrian_path.json)



  - This layer is needed as dependency for layer [entrance](#entrance)




#### Themes using this layer 





  - [entrances](https://mapcomplete.osm.be/entrances)
 

### picnic_table 



The layer showing picnic tables

[Go to the source code](../assets/layers/picnic_table/picnic_table.json)








#### Themes using this layer 





  - [benches](https://mapcomplete.osm.be/benches)
 

### playground 



Playgrounds

[Go to the source code](../assets/layers/playground/playground.json)








#### Themes using this layer 





  - [playgrounds](https://mapcomplete.osm.be/playgrounds)
 

### public_bookcase 



A streetside cabinet with books, accessible to anyone

[Go to the source code](../assets/layers/public_bookcase/public_bookcase.json)








#### Themes using this layer 





  - [bookcases](https://mapcomplete.osm.be/bookcases)
 

### shops 



A shop

[Go to the source code](../assets/layers/shops/shops.json)








#### Themes using this layer 





  - [shops](https://mapcomplete.osm.be/shops)
 

### sport_pitch 



A sport pitch

[Go to the source code](../assets/layers/sport_pitch/sport_pitch.json)








#### Themes using this layer 





  - [sport_pitches](https://mapcomplete.osm.be/sport_pitches)
 

### street_lamps 



A layer showing street lights

[Go to the source code](../assets/layers/street_lamps/street_lamps.json)








#### Themes using this layer 





  - [street_lighting](https://mapcomplete.osm.be/street_lighting)
 

### surveillance_camera 



This layer shows surveillance cameras and allows a contributor to update information and add new cameras

[Go to the source code](../assets/layers/surveillance_camera/surveillance_camera.json)



  - This layer will automatically load  [walls_and_buildings](#walls_and_buildings)  into the layout as it depends on it:  a preset snaps to this layer (presets[1])




#### Themes using this layer 





  - [surveillance](https://mapcomplete.osm.be/surveillance)
 

### toilet 



A layer showing (public) toilets

[Go to the source code](../assets/layers/toilet/toilet.json)








#### Themes using this layer 





  - [toilets](https://mapcomplete.osm.be/toilets)
 

### tree_node 



A layer showing trees

[Go to the source code](../assets/layers/tree_node/tree_node.json)








#### Themes using this layer 





  - [trees](https://mapcomplete.osm.be/trees)
 

### waste_basket 



This is a public waste basket, thrash can, where you can throw away your thrash.

[Go to the source code](../assets/layers/waste_basket/waste_basket.json)








#### Themes using this layer 





  - [waste_basket](https://mapcomplete.osm.be/waste_basket)
 

This document is autogenerated from AllKnownLayers.ts