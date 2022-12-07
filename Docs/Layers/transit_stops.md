

 transit_stops 
===============



<img src='https://mapcomplete.osm.be/./assets/layers/transit_stops/bus_stop.svg' height="100px"> 

Layer showing different types of transit stops.






  - This layer is shown at zoomlevel **15** and higher




#### Themes using this layer 





  - [blind_osm](https://mapcomplete.osm.be/blind_osm)
  - [personal](https://mapcomplete.osm.be/personal)
  - [transit](https://mapcomplete.osm.be/transit)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dbus_stop' target='_blank'>bus_stop</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22highway%22%3D%22bus_stop%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:name%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/shelter#values) [shelter](https://wiki.openstreetmap.org/wiki/Key:shelter) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:shelter%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:shelter%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/bench#values) [bench](https://wiki.openstreetmap.org/wiki/Key:bench) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:bench%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:bench%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/bin#values) [bin](https://wiki.openstreetmap.org/wiki/Key:bin) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:bin%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:bin%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/wheelchair#values) [wheelchair](https://wiki.openstreetmap.org/wiki/Key:wheelchair) | Multiple choice | [designated](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Ddesignated) [yes](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dyes) [limited](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dlimited) [no](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/tactile_paving#values) [tactile_paving](https://wiki.openstreetmap.org/wiki/Key:tactile_paving) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:tactile_paving%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:tactile_paving%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/lit#values) [lit](https://wiki.openstreetmap.org/wiki/Key:lit) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:lit%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:lit%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/departures_board#values) [departures_board](https://wiki.openstreetmap.org/wiki/Key:departures_board) | Multiple choice | [realtime](https://wiki.openstreetmap.org/wiki/Tag:departures_board%3Drealtime) [timetable](https://wiki.openstreetmap.org/wiki/Tag:departures_board%3Dtimetable) [interval](https://wiki.openstreetmap.org/wiki/Tag:departures_board%3Dinterval) [no](https://wiki.openstreetmap.org/wiki/Tag:departures_board%3Dno)




### stop_name 



The question is  *What is the name of this stop?*

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 

This is rendered with  `This stop is called <b>{name}</b>`





  - *This stop has no name*  corresponds with  `noname=yes`




### images 



This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata`

This tagrendering has no question and is thus read-only





### shelter 



The question is  *Does this stop have a shelter?*





  - *This stop has a shelter*  corresponds with  `shelter=yes`
  - *This stop does not have a shelter*  corresponds with  `shelter=no`
  - *This stop has a shelter, that's separately mapped*  corresponds with  `shelter=separate`
  - This option cannot be chosen as answer




### bench 



The question is  *Does this stop have a bench?*





  - *This stop has a bench*  corresponds with  `bench=yes`
  - *This stop does not have a bench*  corresponds with  `bench=no`
  - *This stop has a bench, that's separately mapped*  corresponds with  `bench=separate`
  - This option cannot be chosen as answer




### bin 



The question is  *Does this stop have a bin?*





  - *This stop has a bin*  corresponds with  `bin=yes`
  - *This stop does not have a bin*  corresponds with  `bin=no`
  - *This stop has a bin, that's separately mapped*  corresponds with  `bin=separate`
  - This option cannot be chosen as answer




### wheelchair-access 



The question is  *Is this place accessible with a wheelchair?*





  - *This place is specially adapted for wheelchair users*  corresponds with  `wheelchair=designated`
  - *This place is easily reachable with a wheelchair*  corresponds with  `wheelchair=yes`
  - *It is possible to reach this place in a wheelchair, but it is not easy*  corresponds with  `wheelchair=limited`
  - *This place is not reachable with a wheelchair*  corresponds with  `wheelchair=no`




### tactile_paving 



The question is  *Does this stop have tactile paving?*





  - *This stop has tactile paving*  corresponds with  `tactile_paving=yes`
  - *This stop does not have tactile paving*  corresponds with  `tactile_paving=no`




### lit 



The question is  *Is this stop lit?*





  - *This stop is lit*  corresponds with  `lit=yes`
  - *This stop is not lit*  corresponds with  `lit=no`




### departures_board 



This tagrendering has no question and is thus read-only





  - *This stop has a departures board of unknown type*  corresponds with  `departures_board=yes`
  - This option cannot be chosen as answer
  - *This stop has a board showing realtime departure information*  corresponds with  `departures_board=realtime`
  - *This stop has a board showing realtime departure information*  corresponds with  `passenger_information_display=yes`
  - This option cannot be chosen as answer
  - *This stop has a timetable showing regular departures*  corresponds with  `departures_board=timetable`
  - *This stop has a timetable containing just the interval between departures*  corresponds with  `departures_board=interval`
  - *This stop does not have a departures board*  corresponds with  `departures_board=no`




### contained_routes 



This tagrendering has no question and is thus read-only



This tagrendering is only visible in the popup if the following condition is met: `_contained_routes~.+`



#### Filters 





id | question | osmTags
---- | ---------- | ---------
shelter.0 | With a shelter | shelter=yes\|shelter=separate




id | question | osmTags
---- | ---------- | ---------
bench.0 | With a bench | bench=yes\|bench=separate




id | question | osmTags
---- | ---------- | ---------
bin.0 | With a bin | bin=yes\|bin=separate




id | question | osmTags
---- | ---------- | ---------
tactile_paving.0 | With tactile paving | tactile_paving=yes
 

This document is autogenerated from [assets/layers/transit_stops/transit_stops.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/transit_stops/transit_stops.json)