[//]: # (WARNING: this file is automatically generated. Please find the sources at the bottom and edit those sources)

# not_cyclestreets

Layer to mark any street as cyclestreet

 - This layer is shown at zoomlevel **18** and higher

## Table of contents

1. [Themes using this layer](#themes-using-this-layer)
2. [Basic tags for this layer](#basic-tags-for-this-layer)
3. [Supported attributes](#supported-attributes)
  - [is_cyclestreet](#is_cyclestreet)
  - [supplementary_sign](#supplementary_sign)
  - [future_cyclestreet](#future_cyclestreet)
  - [images](#images)
  - [leftover-questions](#leftover-questions)
  - [split_button](#split_button)
  - [lod](#lod)

## Themes using this layer

 - [cyclestreets](https://mapcomplete.org/cyclestreets)

## Basic tags for this layer

Elements must match **any** of the following expressions:

 - <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dresidential' target='_blank'>residential</a>
 - <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dtertiary' target='_blank'>tertiary</a>
 - <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dunclassified' target='_blank'>unclassified</a>

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22highway%22%3D%22residential%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22tertiary%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22unclassified%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

**Warning:**,this quick overview is incomplete,

| attribute | type | values which are supported by this layer |
-----|-----|----- |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/traffic_sign#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/traffic_sign/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [traffic_sign](https://wiki.openstreetmap.org/wiki/Key:traffic_sign) | Multiple choice | [DE:244.1,1020-30](https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DDE:244.1,1020-30) [DE:244.1,1022-12,1024-10](https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DDE:244.1,1022-12,1024-10) [DE:244.1,1022-12](https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DDE:244.1,1022-12) [DE:244.1,1024-10](https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DDE:244.1,1024-10) [DE:244.1](https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DDE:244.1) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/cyclestreet:start_date#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/cyclestreet%3Astart_date/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [cyclestreet:start_date](https://wiki.openstreetmap.org/wiki/Key:cyclestreet:start_date) | [date](../SpecialInputElements.md#date) |  |

### is_cyclestreet

The question is `Is the street <b>{name}</b> a cyclestreet?`

 -  *This street is a cyclestreet (and has a speed limit of 30 km/h)* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:cyclestreet' target='_blank'>cyclestreet</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cyclestreet%3Dyes' target='_blank'>yes</a> & <a href='https://wiki.openstreetmap.org/wiki/Key:maxspeed' target='_blank'>maxspeed</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:maxspeed%3D30' target='_blank'>30</a> & <a href='https://wiki.openstreetmap.org/wiki/Key:overtaking:motor_vehicle' target='_blank'>overtaking:motor_vehicle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:overtaking:motor_vehicle%3Dno' target='_blank'>no</a> & proposed:cyclestreet=
 -  *This street is a bicycle road* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle_road' target='_blank'>bicycle_road</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle_road%3Dyes' target='_blank'>yes</a>. _This option cannot be chosen as answer_
 -  *This street is a bicycle road (has a speed limit of 30 km/h and vehicles are not allowed) (sign will be asked later)* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle_road' target='_blank'>bicycle_road</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle_road%3Dyes' target='_blank'>yes</a> & proposed:bicycle_road= & <a href='https://wiki.openstreetmap.org/wiki/Key:maxspeed' target='_blank'>maxspeed</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:maxspeed%3D30' target='_blank'>30</a> & <a href='https://wiki.openstreetmap.org/wiki/Key:source:maxspeed' target='_blank'>source:maxspeed</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:source:maxspeed%3DDE:bicycle_road' target='_blank'>DE:bicycle_road</a> & <a href='https://wiki.openstreetmap.org/wiki/Key:vehicle' target='_blank'>vehicle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:vehicle%3Dno' target='_blank'>no</a> & <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle' target='_blank'>bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Ddesignated' target='_blank'>designated</a>
 -  *This street is a cyclestreet* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:cyclestreet' target='_blank'>cyclestreet</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cyclestreet%3Dyes' target='_blank'>yes</a> & proposed:cyclestreet=
 -  *This street will become a cyclestreet soon* is shown if with cyclestreet= & <a href='https://wiki.openstreetmap.org/wiki/Key:proposed:cyclestreet' target='_blank'>proposed:cyclestreet</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:proposed:cyclestreet%3Dyes' target='_blank'>yes</a>
 -  *This street will become a bicycle road soon* is shown if with bicycle_road= & <a href='https://wiki.openstreetmap.org/wiki/Key:proposed:bicycle_road' target='_blank'>proposed:bicycle_road</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:proposed:bicycle_road%3Dyes' target='_blank'>yes</a>
 -  *This street is not a cyclestreet* is shown if with cyclestreet= & proposed:cyclestreet= & bicycle_road= & proposed:bicycle_road= & overtaking:motor_vehicle=

### supplementary_sign

The question is `What sign does this bicycle road have?`

 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/themes/cyclestreets/Zeichen_244_1020-30.svg'> *Residents allowed* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:traffic_sign' target='_blank'>traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DDE:244.1,1020-30' target='_blank'>DE:244.1,1020-30</a>
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/themes/cyclestreets/Zeichen_244_KFZ_frei.svg'> *Motor vehicles allowed* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:traffic_sign' target='_blank'>traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DDE:244.1,1022-12,1024-10' target='_blank'>DE:244.1,1022-12,1024-10</a>
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/themes/cyclestreets/Zeichen_244_1022-12.svg'> *Motorcycles allowed* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:traffic_sign' target='_blank'>traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DDE:244.1,1022-12' target='_blank'>DE:244.1,1022-12</a>
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/themes/cyclestreets/Zeichen_244_1024-10.svg'> *Cars allowed* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:traffic_sign' target='_blank'>traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DDE:244.1,1024-10' target='_blank'>DE:244.1,1024-10</a>
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/themes/cyclestreets/Zeichen_244.svg'> *There are no supplementary signs at this bicycle road.* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:traffic_sign' target='_blank'>traffic_sign</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:traffic_sign%3DDE:244.1' target='_blank'>DE:244.1</a>

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:_country' target='_blank'>_country</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:_country%3Dde' target='_blank'>de</a> & <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle_road' target='_blank'>bicycle_road</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle_road%3Dyes' target='_blank'>yes</a>

### future_cyclestreet

The question is `When will this street become a cyclestreet?`
*This street will become a cyclestreet at {cyclestreet:start_date}* is shown if `cyclestreet:start_date` is set

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:proposed:cyclestreet' target='_blank'>proposed:cyclestreet</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:proposed:cyclestreet%3Dyes' target='_blank'>yes</a>

### images
This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata` and shows the button to upload new images
_This tagrendering has no question and is thus read-only_
*{image_carousel()}{image_upload()}*

### leftover-questions

_This tagrendering has no question and is thus read-only_
*{questions( ,)}*

### split_button

_This tagrendering has no question and is thus read-only_
*{split_button()}*

### lod

_This tagrendering has no question and is thus read-only_
*{linked_data_from_website()}*

This tagrendering has labels 
`added_by_default`


This document is autogenerated from [assets/themes/cyclestreets/cyclestreets.json](https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/assets/themes/cyclestreets/cyclestreets.json)
