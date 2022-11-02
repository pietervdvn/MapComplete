

 stairs 
========





Layer showing stairs and escalators






  - This layer is shown at zoomlevel **17** and higher
  - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`




#### Themes using this layer 





  - [blind_osm](https://mapcomplete.osm.be/blind_osm)
  - [personal](https://mapcomplete.osm.be/personal)




 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dsteps' target='_blank'>steps</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22highway%22%3D%22steps%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



Warning: 

this quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/handrail#values) [handrail](https://wiki.openstreetmap.org/wiki/Key:handrail) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:handrail%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:handrail%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/tactile_writing#values) [tactile_writing](https://wiki.openstreetmap.org/wiki/Key:tactile_writing) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:tactile_writing%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:tactile_writing%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/conveying#values) [conveying](https://wiki.openstreetmap.org/wiki/Key:conveying) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:conveying%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:conveying%3Dno)




### handrail 



The question is  Does this stair have a handrail?





  - These stairs have a handrail  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:handrail' target='_blank'>handrail</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:handrail%3Dyes' target='_blank'>yes</a>`
  - These stairs do <b>not</b> have a handrail  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:handrail' target='_blank'>handrail</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:handrail%3Dno' target='_blank'>no</a>`




### tactile_writing 



The question is  Do these stairs have tactile writing on the handrail?





  - There is tactile writing on the handrail  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:tactile_writing' target='_blank'>tactile_writing</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:tactile_writing%3Dyes' target='_blank'>yes</a>`
  - There is no tactile writing on the handrail  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:tactile_writing' target='_blank'>tactile_writing</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:tactile_writing%3Dno' target='_blank'>no</a>`


Only visible if  `handrail=yes`  is shown



### tactile_writing_language 



This tagrendering has no question and is thus read-only



Only visible if  `tactile_writing:braille:language=yes`  is shown



### conveying 



This tagrendering has no question and is thus read-only





  - This is an escalator  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:conveying' target='_blank'>conveying</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:conveying%3Dyes' target='_blank'>yes</a>`
  - This is not an escalator  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:conveying' target='_blank'>conveying</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:conveying%3Dno' target='_blank'>no</a>`
  - This is not an escalator  corresponds with  ``
  - This option cannot be chosen as answer




### ramp 



The question is  Is there a ramp at these stairs?





  - There is a ramp for bicycles here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:ramp:bicycle' target='_blank'>ramp:bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:ramp:bicycle%3Dyes' target='_blank'>yes</a>`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:ramp:bicycle' target='_blank'>ramp:bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:ramp:bicycle%3Dno' target='_blank'>no</a>
  - There is a ramp for wheelchairs here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:ramp:wheelchair' target='_blank'>ramp:wheelchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:ramp:wheelchair%3Dyes' target='_blank'>yes</a>`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:ramp:wheelchair' target='_blank'>ramp:wheelchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:ramp:wheelchair%3Dno' target='_blank'>no</a>
  - There is ramp for wheelchairs here, but it is shown separately on the map  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:ramp' target='_blank'>ramp</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:ramp%3Dseparate' target='_blank'>separate</a>`
  - This option cannot be chosen as answer
  - There is a ramp for strollers here  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:ramp:stroller' target='_blank'>ramp:stroller</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:ramp:stroller%3Dyes' target='_blank'>yes</a>`
  - Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:ramp:stroller' target='_blank'>ramp:stroller</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:ramp:stroller%3Dno' target='_blank'>no</a>
  - There is no ramp at these stairs  corresponds with  `<a href='https://wiki.openstreetmap.org/wiki/Key:ramp' target='_blank'>ramp</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:ramp%3Dno' target='_blank'>no</a>`
  - Unselecting this answer will add 
 

This document is autogenerated from [assets/layers/stairs/stairs.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/stairs/stairs.json)