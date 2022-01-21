

 climbing 
==========



<img src='https://mapcomplete.osm.be/./assets/themes/climbing/climbing_no_rope.svg' height="100px"> 

A climbing opportunity




## Table of contents

1. [climbing](#climbing)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [images](#images)
    + [questions](#questions)
    + [minimap](#minimap)
    + [Contained routes length hist](#contained-routes-length-hist)
    + [Contained routes hist](#contained-routes-hist)
    + [Contained_climbing_routes](#contained_climbing_routes)
    + [name](#name)
    + [Type](#type)
    + [Rock type (crag/rock/cliff only)](#rock-type-(cragrock/cliff-only))
    + [reviews](#reviews)





  - This layer will automatically load  [climbing_route](./climbing_route.md)  into the layout as it depends on it:  A calculated tag loads features from this layer (calculatedTag[0] which calculates the value for _contained_climbing_routes_properties)




#### Themes using this layer 





  - [climbing](https://mapcomplete.osm.be/climbing)


[Go to the source code](../assets/layers/climbing/climbing.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:sport' target='_blank'>sport</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:sport%3Dclimbing' target='_blank'>climbing</a>
  - climbing!~^route$
  - leisure!~^sports_centre$
  - climbing!~^route_top$
  - climbing!~^route_bottom$




 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:name%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing#values) [climbing](https://wiki.openstreetmap.org/wiki/Key:climbing) | Multiple choice | [boulder](https://wiki.openstreetmap.org/wiki/Tag:climbing%3Dboulder) [crag](https://wiki.openstreetmap.org/wiki/Tag:climbing%3Dcrag) [area](https://wiki.openstreetmap.org/wiki/Tag:climbing%3Darea)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/rock#values) [rock](https://wiki.openstreetmap.org/wiki/Key:rock) | [string](../SpecialInputElements.md#string) | [limestone](https://wiki.openstreetmap.org/wiki/Tag:rock%3Dlimestone)




### images 



_This tagrendering has no question and is thus read-only_





### questions 



_This tagrendering has no question and is thus read-only_





### minimap 



_This tagrendering has no question and is thus read-only_





### Contained routes length hist 



_This tagrendering has no question and is thus read-only_





### Contained routes hist 



_This tagrendering has no question and is thus read-only_





### Contained_climbing_routes 



_This tagrendering has no question and is thus read-only_





### name 



The question is **What is the name of this climbing opportunity?**

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name) 
This is rendered with `<strong>{name}</strong>`



  - **This climbing opportunity doesn't have a name** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:noname' target='_blank'>noname</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:noname%3Dyes' target='_blank'>yes</a>




### Type 



The question is **What kind of climbing opportunity is this?**





  - **A climbing boulder - a single rock or cliff with one or a few climbing routes which can be climbed safely without rope** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:climbing' target='_blank'>climbing</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing%3Dboulder' target='_blank'>boulder</a>
  - **A climbing crag - a single rock or cliff with at least a few climbing routes** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:climbing' target='_blank'>climbing</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing%3Dcrag' target='_blank'>crag</a>
  - **A climbing area with one or more climbing crags and/or boulders** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:climbing' target='_blank'>climbing</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing%3Darea' target='_blank'>area</a>




### Rock type (crag/rock/cliff only) 



The question is **What is the rock type here?**

This rendering asks information about the property  [rock](https://wiki.openstreetmap.org/wiki/Key:rock) 
This is rendered with `The rock type is {rock}`



  - **Limestone** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:rock' target='_blank'>rock</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:rock%3Dlimestone' target='_blank'>limestone</a>




### reviews 



_This tagrendering has no question and is thus read-only_

 

This document is autogenerated from assets/layers/climbing/climbing.json