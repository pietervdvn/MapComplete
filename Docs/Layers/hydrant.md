

 hydrant 
=========



<img src='https://mapcomplete.osm.be/./assets/themes/hailhydrant/hydrant.svg' height="100px"> 

Map layer to show fire hydrants.




## Table of contents

1. [hydrant](#hydrant)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [hydrant-color](#hydrant-color)
    + [hydrant-type](#hydrant-type)
    + [hydrant-state](#hydrant-state)
    + [images](#images)










#### Themes using this layer 





  - [hailhydrant](https://mapcomplete.osm.be/hailhydrant)
  - [personal](https://mapcomplete.osm.be/personal)


[Go to the source code](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/hydrant/hydrant.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:emergency' target='_blank'>emergency</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:emergency%3Dfire_hydrant' target='_blank'>fire_hydrant</a>


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22emergency%22%3D%22fire_hydrant%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/colour#values) [colour](https://wiki.openstreetmap.org/wiki/Key:colour) | [string](../SpecialInputElements.md#string) | [yellow](https://wiki.openstreetmap.org/wiki/Tag:colour%3Dyellow) [red](https://wiki.openstreetmap.org/wiki/Tag:colour%3Dred)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/fire_hydrant:type#values) [fire_hydrant:type](https://wiki.openstreetmap.org/wiki/Key:fire_hydrant:type) | [string](../SpecialInputElements.md#string) | [pillar](https://wiki.openstreetmap.org/wiki/Tag:fire_hydrant:type%3Dpillar) [pipe](https://wiki.openstreetmap.org/wiki/Tag:fire_hydrant:type%3Dpipe) [wall](https://wiki.openstreetmap.org/wiki/Tag:fire_hydrant:type%3Dwall) [underground](https://wiki.openstreetmap.org/wiki/Tag:fire_hydrant:type%3Dunderground)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/emergency#values) [emergency](https://wiki.openstreetmap.org/wiki/Key:emergency) | Multiple choice | [fire_hydrant](https://wiki.openstreetmap.org/wiki/Tag:emergency%3Dfire_hydrant) [](https://wiki.openstreetmap.org/wiki/Tag:emergency%3D) [](https://wiki.openstreetmap.org/wiki/Tag:emergency%3D)




### hydrant-color 



The question is **What color is the hydrant?**

This rendering asks information about the property  [colour](https://wiki.openstreetmap.org/wiki/Key:colour) 
This is rendered with `The hydrant color is {colour}`



  - **The hydrant color is unknown.** corresponds with _This option cannot be chosen as answer_
  - **The hydrant color is yellow.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:colour' target='_blank'>colour</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:colour%3Dyellow' target='_blank'>yellow</a>
  - **The hydrant color is red.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:colour' target='_blank'>colour</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:colour%3Dred' target='_blank'>red</a>




### hydrant-type 



The question is **What type of hydrant is it?**

This rendering asks information about the property  [fire_hydrant:type](https://wiki.openstreetmap.org/wiki/Key:fire_hydrant:type) 
This is rendered with ` Hydrant type: {fire_hydrant:type}`



  - **The hydrant type is unknown.** corresponds with _This option cannot be chosen as answer_
  - **Pillar type.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:fire_hydrant:type' target='_blank'>fire_hydrant:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fire_hydrant:type%3Dpillar' target='_blank'>pillar</a>
  - **Pipe type.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:fire_hydrant:type' target='_blank'>fire_hydrant:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fire_hydrant:type%3Dpipe' target='_blank'>pipe</a>
  - **Wall type.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:fire_hydrant:type' target='_blank'>fire_hydrant:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fire_hydrant:type%3Dwall' target='_blank'>wall</a>
  - **Underground type.** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:fire_hydrant:type' target='_blank'>fire_hydrant:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fire_hydrant:type%3Dunderground' target='_blank'>underground</a>




### hydrant-state 



The question is **Is this hydrant still working?**





  - **The hydrant is (fully or partially) working** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:emergency' target='_blank'>emergency</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:emergency%3Dfire_hydrant' target='_blank'>fire_hydrant</a>
  - **The hydrant is unavailable** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:disused:emergency' target='_blank'>disused:emergency</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:disused:emergency%3Dfire_hydrant' target='_blank'>fire_hydrant</a>
  - **The hydrant has been removed** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:removed:emergency' target='_blank'>removed:emergency</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:removed:emergency%3Dfire_hydrant' target='_blank'>fire_hydrant</a>




### images 



_This tagrendering has no question and is thus read-only_

 

This document is autogenerated from [assets/layers/hydrant/hydrant.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/hydrant/hydrant.json)