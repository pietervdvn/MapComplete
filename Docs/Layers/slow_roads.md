

 slow_roads 
============



<img src='https://mapcomplete.osm.be/./assets/layers/slow_roads/slow_road.svg' height="100px"> 

All carfree roads




## Table of contents

1. [slow_roads](#slow_roads)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [images](#images)
    + [explanation](#explanation)
    + [slow_roads-surface](#slow_roads-surface)
    + [slow_road_is_lit](#slow_road_is_lit)










#### Themes using this layer 





  - [personal](https://mapcomplete.osm.be/personal)


[Go to the source code](../assets/layers/slow_roads/slow_roads.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dpedestrian' target='_blank'>pedestrian</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dfootway' target='_blank'>footway</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dpath' target='_blank'>path</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dbridleway' target='_blank'>bridleway</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dliving_street' target='_blank'>living_street</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dtrack' target='_blank'>track</a>
  - access!~^no$
  - access!~^private$


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22highway%22%3D%22pedestrian%22%5D%5B%22access%22!~%22%5Eno%24%22%5D%5B%22access%22!~%22%5Eprivate%24%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22footway%22%5D%5B%22access%22!~%22%5Eno%24%22%5D%5B%22access%22!~%22%5Eprivate%24%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22path%22%5D%5B%22access%22!~%22%5Eno%24%22%5D%5B%22access%22!~%22%5Eprivate%24%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22bridleway%22%5D%5B%22access%22!~%22%5Eno%24%22%5D%5B%22access%22!~%22%5Eprivate%24%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22living_street%22%5D%5B%22access%22!~%22%5Eno%24%22%5D%5B%22access%22!~%22%5Eprivate%24%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22track%22%5D%5B%22access%22!~%22%5Eno%24%22%5D%5B%22access%22!~%22%5Eprivate%24%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/highway#values) [highway](https://wiki.openstreetmap.org/wiki/Key:highway) | Multiple choice | [living_street](https://wiki.openstreetmap.org/wiki/Tag:highway%3Dliving_street) [pedestrian](https://wiki.openstreetmap.org/wiki/Tag:highway%3Dpedestrian) [footway](https://wiki.openstreetmap.org/wiki/Tag:highway%3Dfootway) [path](https://wiki.openstreetmap.org/wiki/Tag:highway%3Dpath) [bridleway](https://wiki.openstreetmap.org/wiki/Tag:highway%3Dbridleway) [track](https://wiki.openstreetmap.org/wiki/Tag:highway%3Dtrack)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/surface#values) [surface](https://wiki.openstreetmap.org/wiki/Key:surface) | [string](../SpecialInputElements.md#string) | [grass](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dgrass) [ground](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dground) [sand](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dsand) [paving_stones](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dpaving_stones) [asphalt](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dasphalt) [concrete](https://wiki.openstreetmap.org/wiki/Tag:surface%3Dconcrete)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/lit#values) [lit](https://wiki.openstreetmap.org/wiki/Key:lit) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:lit%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:lit%3Dno)




### images 



_This tagrendering has no question and is thus read-only_





### explanation 



_This tagrendering has no question and is thus read-only_





  - **<div> Dit is een woonerf: <ul><li>Voetgangers mogen hier de volledige breedte van de straat gebruiken</li><li>Gemotoriseerd verkeer mag maximaal <b>20km/h</b> rijden</li></ul></div>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dliving_street' target='_blank'>living_street</a>
  - **Dit is een brede, autovrije straat** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dpedestrian' target='_blank'>pedestrian</a>
  - **Dit is een voetpaadje** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dfootway' target='_blank'>footway</a>
  - **Dit is een wegeltje of bospad** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dpath' target='_blank'>path</a>
  - **Dit is een ruiterswegel** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dbridleway' target='_blank'>bridleway</a>
  - **Dit is een tractorspoor of weg om landbouwgrond te bereikken** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dtrack' target='_blank'>track</a>




### slow_roads-surface 



The question is **Wat is de wegverharding van dit pad?**

This rendering asks information about the property  [surface](https://wiki.openstreetmap.org/wiki/Key:surface) 
This is rendered with `The surface is <b>{surface}</b>`



  - **The surface is <b>grass</b>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dgrass' target='_blank'>grass</a>
  - **The surface is <b>ground</b>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dground' target='_blank'>ground</a>
  - **The surface is <b>unpaved</b>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dunpaved' target='_blank'>unpaved</a>_This option cannot be chosen as answer_
  - **The surface is <b>sand</b>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dsand' target='_blank'>sand</a>
  - **The surface is <b>paving stones</b>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dpaving_stones' target='_blank'>paving_stones</a>
  - **The surface is <b>asphalt</b>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dasphalt' target='_blank'>asphalt</a>
  - **The surface is <b>concrete</b>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dconcrete' target='_blank'>concrete</a>
  - **The surface is <b>paved</b>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surface' target='_blank'>surface</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surface%3Dpaved' target='_blank'>paved</a>_This option cannot be chosen as answer_




### slow_road_is_lit 



The question is **Is deze weg 's nachts verlicht?**





  - **'s nachts verlicht** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:lit' target='_blank'>lit</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:lit%3Dyes' target='_blank'>yes</a>
  - **Niet verlicht** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:lit' target='_blank'>lit</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:lit%3Dno' target='_blank'>no</a>
 

This document is autogenerated from [assets/layers/slow_roads/slow_roads.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/slow_roads/slow_roads.json)