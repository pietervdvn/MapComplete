

 maxspeed 
==========





Shows the allowed speed for every road






  - This layer is shown at zoomlevel **16** and higher
  - This layer is needed as dependency for layer [speed_camera](#speed_camera)




#### Themes using this layer 





  - [maxspeed](https://mapcomplete.osm.be/maxspeed)
  - [personal](https://mapcomplete.osm.be/personal)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dresidential' target='_blank'>residential</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dliving_street' target='_blank'>living_street</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dmotorway' target='_blank'>motorway</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dtertiary' target='_blank'>tertiary</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dunclassified' target='_blank'>unclassified</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dsecondary' target='_blank'>secondary</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dprimary' target='_blank'>primary</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dtrunk' target='_blank'>trunk</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dmotorway' target='_blank'>motorway</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dtertiary_link' target='_blank'>tertiary_link</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dsecondary_link' target='_blank'>secondary_link</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dprimary_link' target='_blank'>primary_link</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dtrunk_link' target='_blank'>trunk_link</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dmotorway_link' target='_blank'>motorway_link</a>
  - type!=multipolygon
  - area!=yes


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22highway%22%3D%22residential%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22living_street%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22motorway%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22tertiary%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22unclassified%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22secondary%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22primary%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22trunk%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22motorway%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22tertiary_link%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22secondary_link%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22primary_link%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22trunk_link%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22motorway_link%22%5D%5B%22area%22!%3D%22yes%22%5D%5B%22type%22!%3D%22multipolygon%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/maxspeed#values) [maxspeed](https://wiki.openstreetmap.org/wiki/Key:maxspeed) | [pnat](../SpecialInputElements.md#pnat) | 




### maxspeed-maxspeed 



The question is  What is the legal maximum speed one is allowed to drive on this road?

This rendering asks information about the property  [maxspeed](https://wiki.openstreetmap.org/wiki/Key:maxspeed) 

This is rendered with  The maximum allowed speed on this road is {canonical(maxspeed)}





  - This is a living street, which has a maxspeed of 20km/h  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dliving_street' target='_blank'>living_street</a>&_country!=be`
  - This option cannot be chosen as answer
  - This is a living street, which has a maxspeed of 20km/h  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dliving_street' target='_blank'>living_street</a>`
 

This document is autogenerated from [assets/layers/maxspeed/maxspeed.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/maxspeed/maxspeed.json)