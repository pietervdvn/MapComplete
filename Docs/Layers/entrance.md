

 entrance 
==========



<img src='https://mapcomplete.osm.be/circle:white;./assets/layers/entrance/entrance.svg' height="100px"> 

A layer showing entrances and offering capabilities to survey some advanced data which is important for e.g. wheelchair users (but also bicycle users, people who want to deliver, …)






  - This layer is shown at zoomlevel **14** and higher
  - This layer will automatically load  [walls_and_buildings](./walls_and_buildings.md)  into the layout as it depends on it:  a preset snaps to this layer (presets[0])
  - This layer will automatically load  [pedestrian_path](./pedestrian_path.md)  into the layout as it depends on it:  a preset snaps to this layer (presets[0])
  - This layer will automatically load  [indoors](./indoors.md)  into the layout as it depends on it:  a preset snaps to this layer (presets[1])
  - This layer is needed as dependency for layer [walls_and_buildings](#walls_and_buildings)




#### Themes using this layer 





  - [indoors](https://mapcomplete.osm.be/indoors)
  - [onwheels](https://mapcomplete.osm.be/onwheels)
  - [personal](https://mapcomplete.osm.be/personal)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - entrance~.+|<a href='https://wiki.openstreetmap.org/wiki/Key:indoor' target='_blank'>indoor</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:indoor%3Ddoor' target='_blank'>door</a>|door~.+


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22indoor%22%3D%22door%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22door%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22entrance%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/level#values) [level](https://wiki.openstreetmap.org/wiki/Key:level) | [float](../SpecialInputElements.md#float) | [0](https://wiki.openstreetmap.org/wiki/Tag:level%3D0) [1](https://wiki.openstreetmap.org/wiki/Tag:level%3D1) [-1](https://wiki.openstreetmap.org/wiki/Tag:level%3D-1)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/entrance#values) [entrance](https://wiki.openstreetmap.org/wiki/Key:entrance) | Multiple choice | [](https://wiki.openstreetmap.org/wiki/Tag:entrance%3D) [main](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dmain) [secondary](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dsecondary) [service](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dservice) [exit](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dexit) [entrance](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dentrance) [emergency](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Demergency) [home](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dhome)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/door#values) [door](https://wiki.openstreetmap.org/wiki/Key:door) | Multiple choice | [hinged](https://wiki.openstreetmap.org/wiki/Tag:door%3Dhinged) [revolving](https://wiki.openstreetmap.org/wiki/Tag:door%3Drevolving) [sliding](https://wiki.openstreetmap.org/wiki/Tag:door%3Dsliding) [overhead](https://wiki.openstreetmap.org/wiki/Tag:door%3Doverhead) [no](https://wiki.openstreetmap.org/wiki/Tag:door%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/automatic_door#values) [automatic_door](https://wiki.openstreetmap.org/wiki/Key:automatic_door) | Multiple choice | [no](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dno) [motion](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dmotion) [floor](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dfloor) [button](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dbutton) [slowdown_button](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dslowdown_button) [continuous](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dcontinuous) [serviced_on_button_press](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dserviced_on_button_press) [serviced_on_request](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dserviced_on_request)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/width#values) [width](https://wiki.openstreetmap.org/wiki/Key:width) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/kerb:height#values) [kerb:height](https://wiki.openstreetmap.org/wiki/Key:kerb:height) | [pnat](../SpecialInputElements.md#pnat) | [0](https://wiki.openstreetmap.org/wiki/Tag:kerb:height%3D0)




### images 



This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata`

This tagrendering has no question and is thus read-only





### level 



The question is  *On what level is this feature located?*

This rendering asks information about the property  [level](https://wiki.openstreetmap.org/wiki/Key:level) 

This is rendered with  `Located on the {level}th floor`





  - *Located underground*  corresponds with  `location=underground`
  - This option cannot be chosen as answer
  - *Located on the ground floor*  corresponds with  `level=0`
  - *Located on the ground floor*  corresponds with  ``
  - This option cannot be chosen as answer
  - *Located on the first floor*  corresponds with  `level=1`
  - *Located on the first basement level*  corresponds with  `level=-1`




### Entrance type 



The question is  *What type of entrance is this?*





  - *No specific entrance type is known*  corresponds with  `entrance=yes`
  - This option cannot be chosen as answer
  - *This is an indoor door, separating a room or a corridor within a single building*  corresponds with  `indoor=door`
  - *This is the main entrance*  corresponds with  `entrance=main`
  - *This is a secondary entrance*  corresponds with  `entrance=secondary`
  - *This is a service entrance - normally only used for employees, delivery, …*  corresponds with  `entrance=service`
  - *This is an exit where one can not enter*  corresponds with  `entrance=exit`
  - *This is an entrance where one can only enter (but not exit)*  corresponds with  `entrance=entrance`
  - *This is emergency exit*  corresponds with  `entrance=emergency`
  - *This is the entrance to a private home*  corresponds with  `entrance=home`




### Door_type 



The question is  *What is the type of this door?<br/><span class='subtle'>Wether or not the door is automated is asked in the next question</span>*





  - *The door type is not known*  corresponds with  `door=yes`
  - This option cannot be chosen as answer
  - *A classical, hinged door supported by joints*  corresponds with  `door=hinged`
  - *A revolving door which hangs on a central shaft, rotating within a cylindrical enclosure*  corresponds with  `door=revolving`
  - *A sliding door where the door slides sidewards, typically parallel with a wall*  corresponds with  `door=sliding`
  - *A door which rolls from overhead, typically seen for garages*  corresponds with  `door=overhead`
  - *This is an entrance without a physical door*  corresponds with  `door=no`




### automatic_door 



The question is  *Is this door automated?*





  - *This is an automatic door*  corresponds with  `automatic_door=yes`
  - This option cannot be chosen as answer
  - *This door is <b>not</b> automated*  corresponds with  `automatic_door=no`
  - *This door will open automatically when <b>motion</b> is detected*  corresponds with  `automatic_door=motion`
  - *This door will open automatically when a <b>sensor in the floor</b> is triggered*  corresponds with  `automatic_door=floor`
  - *This door will open automatically when a <b>button is pressed</b>*  corresponds with  `automatic_door=button`
  - *This door revolves automatically all the time, but has a <b>button to slow it down</b>, e.g. for wheelchair users*  corresponds with  `automatic_door=slowdown_button`
  - *This door revolves automatically all the time*  corresponds with  `automatic_door=continuous`
  - *This door will be opened by staff when requested by <b>pressing a button</b>*  corresponds with  `automatic_door=serviced_on_button_press`
  - *This door will be opened by staff when requested*  corresponds with  `automatic_door=serviced_on_request`




### width 



The question is  *What is the width of this door/entrance?*

This rendering asks information about the property  [width](https://wiki.openstreetmap.org/wiki/Key:width) 

This is rendered with  `This door has a width of {canonical(width)}`





### kerb-height 



The question is  *What is the height of this kerb?*

This rendering asks information about the property  [kerb:height](https://wiki.openstreetmap.org/wiki/Key:kerb:height) 

This is rendered with  `The kerb height of this door is {kerb:height}`





  - *This door does not have a kerb*  corresponds with  `kerb:height=0`
 

This document is autogenerated from [assets/layers/entrance/entrance.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/entrance/entrance.json)