

 surveillance_camera 
=====================



<img src='https://mapcomplete.osm.be/./assets/themes/surveillance/logo.svg' height="100px"> 

This layer shows surveillance cameras and allows a contributor to update information and add new cameras




## Table of contents

1. [surveillance_camera](#surveillance_camera)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [images](#images)
    + [Camera type: fixed; panning; dome](#camera-type-fixed;-panning;-dome)
    + [camera_direction](#camera_direction)
    + [Operator](#operator)
    + [Surveillance type: public, outdoor, indoor](#surveillance-type-public,-outdoor,-indoor)
    + [is_indoor](#is_indoor)
    + [Level](#level)
    + [Surveillance:zone](#surveillancezone)
    + [camera:mount](#cameramount)





  - This layer will automatically load  [walls_and_buildings](./walls_and_buildings.md)  into the layout as it depends on it:  a preset snaps to this layer (presets[1])




#### Themes using this layer 





  - [surveillance](https://mapcomplete.osm.be/surveillance)


[Go to the source code](../assets/layers/surveillance_camera/surveillance_camera.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - <a href='https://wiki.openstreetmap.org/wiki/Key:man_made' target='_blank'>man_made</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:man_made%3Dsurveillance' target='_blank'>surveillance</a>
  - <a href='https://wiki.openstreetmap.org/wiki/Key:surveillance:type' target='_blank'>surveillance:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surveillance:type%3Dcamera' target='_blank'>camera</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:surveillance:type' target='_blank'>surveillance:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surveillance:type%3DALPR' target='_blank'>ALPR</a>|<a href='https://wiki.openstreetmap.org/wiki/Key:surveillance:type' target='_blank'>surveillance:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surveillance:type%3DANPR' target='_blank'>ANPR</a>




 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/camera:type#values) [camera:type](https://wiki.openstreetmap.org/wiki/Key:camera:type) | Multiple choice | [fixed](https://wiki.openstreetmap.org/wiki/Tag:camera:type%3Dfixed) [dome](https://wiki.openstreetmap.org/wiki/Tag:camera:type%3Ddome) [panning](https://wiki.openstreetmap.org/wiki/Tag:camera:type%3Dpanning)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/camera:direction#values) [camera:direction](https://wiki.openstreetmap.org/wiki/Key:camera:direction) | [direction](../SpecialInputElements.md#direction) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operator#values) [operator](https://wiki.openstreetmap.org/wiki/Key:operator) | [string](../SpecialInputElements.md#string) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/surveillance#values) [surveillance](https://wiki.openstreetmap.org/wiki/Key:surveillance) | Multiple choice | [public](https://wiki.openstreetmap.org/wiki/Tag:surveillance%3Dpublic) [outdoor](https://wiki.openstreetmap.org/wiki/Tag:surveillance%3Doutdoor) [indoor](https://wiki.openstreetmap.org/wiki/Tag:surveillance%3Dindoor)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/indoor#values) [indoor](https://wiki.openstreetmap.org/wiki/Key:indoor) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/level#values) [level](https://wiki.openstreetmap.org/wiki/Key:level) | [nat](../SpecialInputElements.md#nat) | 
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/surveillance:zone#values) [surveillance:zone](https://wiki.openstreetmap.org/wiki/Key:surveillance:zone) | [string](../SpecialInputElements.md#string) | [parking](https://wiki.openstreetmap.org/wiki/Tag:surveillance:zone%3Dparking) [traffic](https://wiki.openstreetmap.org/wiki/Tag:surveillance:zone%3Dtraffic) [entrance](https://wiki.openstreetmap.org/wiki/Tag:surveillance:zone%3Dentrance) [corridor](https://wiki.openstreetmap.org/wiki/Tag:surveillance:zone%3Dcorridor) [public_transport_platform](https://wiki.openstreetmap.org/wiki/Tag:surveillance:zone%3Dpublic_transport_platform) [shop](https://wiki.openstreetmap.org/wiki/Tag:surveillance:zone%3Dshop)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/camera:mount#values) [camera:mount](https://wiki.openstreetmap.org/wiki/Key:camera:mount) | [string](../SpecialInputElements.md#string) | [wall](https://wiki.openstreetmap.org/wiki/Tag:camera:mount%3Dwall) [pole](https://wiki.openstreetmap.org/wiki/Tag:camera:mount%3Dpole) [ceiling](https://wiki.openstreetmap.org/wiki/Tag:camera:mount%3Dceiling)




### images 



_This tagrendering has no question and is thus read-only_





### Camera type: fixed; panning; dome 



The question is **What kind of camera is this?**





  - **A fixed (non-moving) camera** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:camera:type' target='_blank'>camera:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:camera:type%3Dfixed' target='_blank'>fixed</a>
  - **A dome camera (which can turn)** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:camera:type' target='_blank'>camera:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:camera:type%3Ddome' target='_blank'>dome</a>
  - **A panning camera** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:camera:type' target='_blank'>camera:type</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:camera:type%3Dpanning' target='_blank'>panning</a>




### camera_direction 



The question is **In which geographical direction does this camera film?**

This rendering asks information about the property  [camera:direction](https://wiki.openstreetmap.org/wiki/Key:camera:direction) 
This is rendered with `Films to a compass heading of {camera:direction}`



  - **Films to a compass heading of {direction}** corresponds with direction~^..*$_This option cannot be chosen as answer_




### Operator 



The question is **Who operates this CCTV?**

This rendering asks information about the property  [operator](https://wiki.openstreetmap.org/wiki/Key:operator) 
This is rendered with `Operated by {operator}`



### Surveillance type: public, outdoor, indoor 



The question is **What kind of surveillance is this camera**





  - **A public area is surveilled, such as a street, a bridge, a square, a park, a train station, a public corridor or tunnel,...** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surveillance' target='_blank'>surveillance</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surveillance%3Dpublic' target='_blank'>public</a>
  - **An outdoor, yet private area is surveilled (e.g. a parking lot, a fuel station, courtyard, entrance, private driveway, ...)** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surveillance' target='_blank'>surveillance</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surveillance%3Doutdoor' target='_blank'>outdoor</a>
  - **A private indoor area is surveilled, e.g. a shop, a private underground parking, ...** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surveillance' target='_blank'>surveillance</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surveillance%3Dindoor' target='_blank'>indoor</a>




### is_indoor 



The question is **Is the public space surveilled by this camera an indoor or outdoor space?**





  - **This camera is located indoors** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:indoor' target='_blank'>indoor</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dyes' target='_blank'>yes</a>
  - **This camera is located outdoors** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:indoor' target='_blank'>indoor</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dno' target='_blank'>no</a>
  - **This camera is probably located outdoors** corresponds with _This option cannot be chosen as answer_




### Level 



The question is **On which level is this camera located?**

This rendering asks information about the property  [level](https://wiki.openstreetmap.org/wiki/Key:level) 
This is rendered with `Located on level {level}`



### Surveillance:zone 



The question is **What exactly is surveilled here?**

This rendering asks information about the property  [surveillance:zone](https://wiki.openstreetmap.org/wiki/Key:surveillance:zone) 
This is rendered with ` Surveills a {surveillance:zone}`



  - **Surveills a parking** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surveillance:zone' target='_blank'>surveillance:zone</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surveillance:zone%3Dparking' target='_blank'>parking</a>
  - **Surveills the traffic** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surveillance:zone' target='_blank'>surveillance:zone</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surveillance:zone%3Dtraffic' target='_blank'>traffic</a>
  - **Surveills an entrance** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surveillance:zone' target='_blank'>surveillance:zone</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surveillance:zone%3Dentrance' target='_blank'>entrance</a>
  - **Surveills a corridor** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surveillance:zone' target='_blank'>surveillance:zone</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surveillance:zone%3Dcorridor' target='_blank'>corridor</a>
  - **Surveills a public tranport platform** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surveillance:zone' target='_blank'>surveillance:zone</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surveillance:zone%3Dpublic_transport_platform' target='_blank'>public_transport_platform</a>
  - **Surveills a shop** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:surveillance:zone' target='_blank'>surveillance:zone</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:surveillance:zone%3Dshop' target='_blank'>shop</a>




### camera:mount 



The question is **How is this camera placed?**

This rendering asks information about the property  [camera:mount](https://wiki.openstreetmap.org/wiki/Key:camera:mount) 
This is rendered with `Mounting method: {camera:mount}`



  - **This camera is placed against a wall** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:camera:mount' target='_blank'>camera:mount</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:camera:mount%3Dwall' target='_blank'>wall</a>
  - **This camera is placed one a pole** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:camera:mount' target='_blank'>camera:mount</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:camera:mount%3Dpole' target='_blank'>pole</a>
  - **This camera is placed on the ceiling** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:camera:mount' target='_blank'>camera:mount</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:camera:mount%3Dceiling' target='_blank'>ceiling</a>
 

This document is autogenerated from assets/layers/surveillance_camera/surveillance_camera.json