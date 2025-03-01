[//]: # (WARNING: this file is automatically generated. Please find the sources at the bottom and edit those sources)

# bench_at_pt

A layer showing all public-transport-stops which do have a bench

 - This layer is shown at zoomlevel **14** and higher

## Table of contents

1. [Themes using this layer](#themes-using-this-layer)
2. [Basic tags for this layer](#basic-tags-for-this-layer)
3. [Supported attributes](#supported-attributes)
  - [images](#images)
  - [bench_at_pt-name](#bench_at_pt-name)
  - [bench_at_pt-bench_type](#bench_at_pt-bench_type)
  - [leftover-questions](#leftover-questions)
  - [delete-button](#delete-button)
  - [lod](#lod)

## Themes using this layer

 - [benches](https://mapcomplete.org/benches)
 - [personal](https://mapcomplete.org/personal)

## Basic tags for this layer

Elements must match **all** of the following expressions:

0. <a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dbus_stop' target='_blank'>bus_stop</a>
1. <a href='https://wiki.openstreetmap.org/wiki/Key:bench' target='_blank'>bench</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bench%3Dyes' target='_blank'>yes</a> | <a href='https://wiki.openstreetmap.org/wiki/Key:bench' target='_blank'>bench</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bench%3Dstand_up_bench' target='_blank'>stand_up_bench</a>

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22highway%22%3D%22bus_stop%22%5D%5B%22bench%22%3D%22yes%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%20%20%20%20nwr%5B%22highway%22%3D%22bus_stop%22%5D%5B%22bench%22%3D%22stand_up_bench%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

**Warning:**,this quick overview is incomplete,

| attribute | type | values which are supported by this layer |
-----|-----|----- |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/name#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/name/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/bench#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/bench/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [bench](https://wiki.openstreetmap.org/wiki/Key:bench) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:bench%3Dyes) [stand_up_bench](https://wiki.openstreetmap.org/wiki/Tag:bench%3Dstand_up_bench) [no](https://wiki.openstreetmap.org/wiki/Tag:bench%3Dno) |

### images
This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata` and shows the button to upload new images
_This tagrendering has no question and is thus read-only_
*{image_carousel()}{image_upload()}*

### bench_at_pt-name

_This tagrendering has no question and is thus read-only_
*{name}* is shown if `name` is set

### bench_at_pt-bench_type

The question is `What kind of bench is this?`

 -  *There is a normal, sit-down bench here* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bench' target='_blank'>bench</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bench%3Dyes' target='_blank'>yes</a>
 -  *Stand up bench* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bench' target='_blank'>bench</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bench%3Dstand_up_bench' target='_blank'>stand_up_bench</a>
 -  *There is no bench here* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bench' target='_blank'>bench</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bench%3Dno' target='_blank'>no</a>

### leftover-questions

_This tagrendering has no question and is thus read-only_
*{questions( ,)}*

### delete-button

_This tagrendering has no question and is thus read-only_
*{delete_button()}*

### lod

_This tagrendering has no question and is thus read-only_
*{linked_data_from_website()}*

This tagrendering has labels 
`added_by_default`


This document is autogenerated from [assets/layers/bench_at_pt/bench_at_pt.json](https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/assets/layers/bench_at_pt/bench_at_pt.json)
