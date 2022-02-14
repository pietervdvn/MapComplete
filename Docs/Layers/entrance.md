

 entrance 
==========



<img src='https://mapcomplete.osm.be/circle:white;./assets/layers/entrance/door.svg' height="100px"> 

A layer showing entrances and offering capabilities to survey some advanced data which is important for e.g. wheelchair users (but also bicycle users, people who want to deliver, ...)




## Table of contents

1. [entrance](#entrance)
      * [Themes using this layer](#themes-using-this-layer)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [images](#images)
    + [Entrance type](#entrance-type)
    + [Door_type](#door_type)
    + [automatic_door](#automatic_door)
    + [width](#width)





  - This layer will automatically load  [walls_and_buildings](./walls_and_buildings.md)  into the layout as it depends on it:  a preset snaps to this layer (presets[0])
  - This layer will automatically load  [pedestrian_path](./pedestrian_path.md)  into the layout as it depends on it:  a preset snaps to this layer (presets[0])




#### Themes using this layer 





  - [entrances](https://mapcomplete.osm.be/entrances)
  - [personal](https://mapcomplete.osm.be/personal)


[Go to the source code](../assets/layers/entrance/entrance.json)



 Basic tags for this layer 
---------------------------



Elements must have the all of following tags to be shown on this layer:



  - entrance~^..*$|<a href='https://wiki.openstreetmap.org/wiki/Key:indoor' target='_blank'>indoor</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:indoor%3Ddoor' target='_blank'>door</a>




 Supported attributes 
----------------------



**Warning** This quick overview is incomplete



attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/entrance#values) [entrance](https://wiki.openstreetmap.org/wiki/Key:entrance) | Multiple choice | [](https://wiki.openstreetmap.org/wiki/Tag:entrance%3D) [main](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dmain) [secondary](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dsecondary) [service](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dservice) [exit](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dexit) [entrance](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dentrance) [emergency](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Demergency) [home](https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dhome)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/door#values) [door](https://wiki.openstreetmap.org/wiki/Key:door) | Multiple choice | [hinged](https://wiki.openstreetmap.org/wiki/Tag:door%3Dhinged) [revolving](https://wiki.openstreetmap.org/wiki/Tag:door%3Drevolving) [sliding](https://wiki.openstreetmap.org/wiki/Tag:door%3Dsliding) [overhead](https://wiki.openstreetmap.org/wiki/Tag:door%3Doverhead) [no](https://wiki.openstreetmap.org/wiki/Tag:door%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/automatic_door#values) [automatic_door](https://wiki.openstreetmap.org/wiki/Key:automatic_door) | Multiple choice | [no](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dno) [motion](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dmotion) [floor](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dfloor) [button](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dbutton) [slowdown_button](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dslowdown_button) [continuous](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dcontinuous) [serviced_on_button_press](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dserviced_on_button_press) [serviced_on_request](https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dserviced_on_request)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/width#values) [width](https://wiki.openstreetmap.org/wiki/Key:width) | [length](../SpecialInputElements.md#length) | 




### images 



_This tagrendering has no question and is thus read-only_





### Entrance type 



The question is **What type of entrance is this?**





  - **No specific entrance type is known** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:entrance' target='_blank'>entrance</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dyes' target='_blank'>yes</a>_This option cannot be chosen as answer_
  - **This is an indoor door, separating a room or a corridor within a single building** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:indoor' target='_blank'>indoor</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:indoor%3Ddoor' target='_blank'>door</a>
  - **This is the main entrance** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:entrance' target='_blank'>entrance</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dmain' target='_blank'>main</a>
  - **This is a secondary entrance** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:entrance' target='_blank'>entrance</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dsecondary' target='_blank'>secondary</a>
  - **This is a service entrance - normally only used for employees, delivery, ...** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:entrance' target='_blank'>entrance</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dservice' target='_blank'>service</a>
  - **This is an exit where one can not enter** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:entrance' target='_blank'>entrance</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dexit' target='_blank'>exit</a>
  - **This is an entrance where one can only enter (but not exit)** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:entrance' target='_blank'>entrance</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dentrance' target='_blank'>entrance</a>
  - **This is emergency exit** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:entrance' target='_blank'>entrance</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:entrance%3Demergency' target='_blank'>emergency</a>
  - **This is the entrance to a private home** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:entrance' target='_blank'>entrance</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:entrance%3Dhome' target='_blank'>home</a>




### Door_type 



The question is **What is the type of this door?<br/><span class='subtle'>Wether or not the door is automated is asked in the next question</span>**





  - **The door type is not known** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:door' target='_blank'>door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:door%3Dyes' target='_blank'>yes</a>_This option cannot be chosen as answer_
  - **A classical, hinged door supported by joints** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:door' target='_blank'>door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:door%3Dhinged' target='_blank'>hinged</a>
  - **A revolving door which hangs on a central shaft, rotating within a cylindrical enclosure** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:door' target='_blank'>door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:door%3Drevolving' target='_blank'>revolving</a>
  - **A sliding door where the door slides sidewards, typically parallel with a wall** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:door' target='_blank'>door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:door%3Dsliding' target='_blank'>sliding</a>
  - **A door which rolls from overhead, typically seen for garages** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:door' target='_blank'>door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:door%3Doverhead' target='_blank'>overhead</a>
  - **This is an entrance without a physical door** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:door' target='_blank'>door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:door%3Dno' target='_blank'>no</a>




### automatic_door 



The question is **Is this door automated?**





  - **This is an automatic door** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:automatic_door' target='_blank'>automatic_door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dyes' target='_blank'>yes</a>_This option cannot be chosen as answer_
  - **This door is <b>not</b> automated** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:automatic_door' target='_blank'>automatic_door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dno' target='_blank'>no</a>
  - **This door will open automatically when <b>motion</b> is detected** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:automatic_door' target='_blank'>automatic_door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dmotion' target='_blank'>motion</a>
  - **This door will open automatically when a <b>sensor in the floor</b> is triggered** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:automatic_door' target='_blank'>automatic_door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dfloor' target='_blank'>floor</a>
  - **This door will open automatically when a <b>button is pressed</b>** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:automatic_door' target='_blank'>automatic_door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dbutton' target='_blank'>button</a>
  - **This door revolves automatically all the time, but has a <b>button to slow it down</b>, e.g. for wheelchair users** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:automatic_door' target='_blank'>automatic_door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dslowdown_button' target='_blank'>slowdown_button</a>
  - **This door revolves automatically all the time** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:automatic_door' target='_blank'>automatic_door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dcontinuous' target='_blank'>continuous</a>
  - **This door will be opened by staff when requested by <b>pressing a button</b** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:automatic_door' target='_blank'>automatic_door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dserviced_on_button_press' target='_blank'>serviced_on_button_press</a>
  - **This door will be opened by staff when requested** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:automatic_door' target='_blank'>automatic_door</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:automatic_door%3Dserviced_on_request' target='_blank'>serviced_on_request</a>




### width 



The question is **What is the width of this door/entrance?**

This rendering asks information about the property  [width](https://wiki.openstreetmap.org/wiki/Key:width) 
This is rendered with `This door has a width of {canonical(width)} meter` 

This document is autogenerated from assets/layers/entrance/entrance.json