

 trail 
=======



<img src='https://mapcomplete.osm.be/./assets/layers/trail/trail.svg' height="100px"> 

Aangeduide wandeltochten




## Table of contents

1. [trail](#trail)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [images](#images)
    + [trail-length](#trail-length)
    + [Name](#name)
    + [Operator tag](#operator-tag)
    + [Color](#color)
    + [Wheelchair access](#wheelchair-access)
    + [pushchair access](#pushchair-access)










#### Themes using this layer 





  - [personal](https://mapcomplete.osm.be/personal)


[Go to the source code](../assets/layers/trail/trail.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - route~^.*foot.*$|route~^.*hiking.*$|route~^.*bycicle.*$|route~^.*horse.*$


[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B(%20%20%20%20nwr%5B%22route%22~%22%5E.*foot.*%24%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22route%22~%22%5E.*hiking.*%24%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22route%22~%22%5E.*bycicle.*%24%22%5D(%7B%7Bbbox%7D%7D)%3B%0A%20%20%20%20nwr%5B%22route%22~%22%5E.*horse.*%24%22%5D(%7B%7Bbbox%7D%7D)%3B%0A)%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)



 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operator#values) [operator](https://wiki.openstreetmap.org/wiki/Key:operator) | [string](../SpecialInputElements.md#string) | [Natuurpunt](https://wiki.openstreetmap.org/wiki/Tag:operator%3DNatuurpunt)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/colour#values) [colour](https://wiki.openstreetmap.org/wiki/Key:colour) | [color](../SpecialInputElements.md#color) | [blue](https://wiki.openstreetmap.org/wiki/Tag:colour%3Dblue) [red](https://wiki.openstreetmap.org/wiki/Tag:colour%3Dred) [green](https://wiki.openstreetmap.org/wiki/Tag:colour%3Dgreen) [yellow](https://wiki.openstreetmap.org/wiki/Tag:colour%3Dyellow)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/wheelchair#values) [wheelchair](https://wiki.openstreetmap.org/wiki/Key:wheelchair) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/pushchair#values) [pushchair](https://wiki.openstreetmap.org/wiki/Key:pushchair) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:pushchair%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:pushchair%3Dno)




### images 



_This tagrendering has no question and is thus read-only_





### trail-length 



_This tagrendering has no question and is thus read-only_





### Name 



The question is **Wat is de naam van deze wandeling?**

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 
This is rendered with `Deze wandeling heet <b>{name}</b>`



### Operator tag 



The question is **Wie beheert deze wandeltocht?**

This rendering asks information about the property  [operator](https://wiki.openstreetmap.org/wiki/Key:operator) 
This is rendered with `Beheer door {operator}`



  - **Dit gebied wordt beheerd door Natuurpunt** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:operator' target='_blank'>operator</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:operator%3DNatuurpunt' target='_blank'>Natuurpunt</a>
  - **Dit gebied wordt beheerd door {operator}** corresponds with operator~^(n|N)atuurpunt.*$_This option cannot be chosen as answer_




### Color 



The question is **Welke kleur heeft deze wandeling?**

This rendering asks information about the property  [colour](https://wiki.openstreetmap.org/wiki/Key:colour) 
This is rendered with `Deze wandeling heeft kleur {colour}`



  - **Blue trail** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:colour' target='_blank'>colour</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:colour%3Dblue' target='_blank'>blue</a>
  - **Red trail** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:colour' target='_blank'>colour</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:colour%3Dred' target='_blank'>red</a>
  - **Green trail** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:colour' target='_blank'>colour</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:colour%3Dgreen' target='_blank'>green</a>
  - **Yellow trail** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:colour' target='_blank'>colour</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:colour%3Dyellow' target='_blank'>yellow</a>




### Wheelchair access 



The question is **Is deze wandeling toegankelijk met de rolstoel?**





  - **deze wandeltocht is toegankelijk met de rolstoel** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dyes' target='_blank'>yes</a>
  - **deze wandeltocht is niet toegankelijk met de rolstoel** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dno' target='_blank'>no</a>




### pushchair access 



The question is **Is deze wandeltocht toegankelijk met de buggy?**





  - **deze wandeltocht is toegankelijk met de buggy** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:pushchair' target='_blank'>pushchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:pushchair%3Dyes' target='_blank'>yes</a>
  - **deze wandeltocht is niet toegankelijk met de buggy** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:pushchair' target='_blank'>pushchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:pushchair%3Dno' target='_blank'>no</a>
 

This document is autogenerated from [assets/layers/trail/trail.json](https://github.com/pietervdvn/MapComplete/blob/develop/assets/layers/trail/trail.json)