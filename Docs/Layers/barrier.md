[//]: # (WARNING: this file is automatically generated. Please find the sources at the bottom and edit those sources)

# barrier

Obstacles while cycling, such as bollards and cycle barriers

 - This layer is shown at zoomlevel **17** and higher
 - This layer will automatically load  [cycleways_and_roads](./cycleways_and_roads.md)  into the layout as it depends on it:  preset `a bollard` snaps to this layer (barrier.presets[0])
 - This layer will automatically load  [cycleways_and_roads](./cycleways_and_roads.md)  into the layout as it depends on it:  preset `a cycle barrier` snaps to this layer (barrier.presets[1])

## Table of contents

1. [Themes using this layer](#themes-using-this-layer)
2. [Presets](#presets)
3. [Basic tags for this layer](#basic-tags-for-this-layer)
4. [Supported attributes](#supported-attributes)
  - [images](#images)
  - [bicycle=yes/no](#bicycle=yesno)
  - [barrier_type](#barrier_type)
  - [Bollard type](#bollard-type)
  - [Cycle barrier type](#cycle-barrier-type)
  - [MaxWidth](#maxwidth)
  - [Space between barrier (cyclebarrier)](#space-between-barrier-(cyclebarrier))
  - [Width of opening (cyclebarrier)](#width-of-opening-(cyclebarrier))
  - [Overlap (cyclebarrier)](#overlap-(cyclebarrier))
  - [leftover-questions](#leftover-questions)
  - [move-button](#move-button)
  - [delete-button](#delete-button)
  - [lod](#lod)

## Themes using this layer

 - [cycle_infra](https://mapcomplete.org/cycle_infra)
 - [personal](https://mapcomplete.org/personal)

## Presets

The following options to create new points are included:

 - **a bollard** which has the following tags:<a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dbollard' target='_blank'>bollard</a> (snaps to layers `cycleways_and_roads`)
 - **a cycle barrier** which has the following tags:<a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dcycle_barrier' target='_blank'>cycle_barrier</a> (snaps to layers `cycleways_and_roads`)

## Basic tags for this layer

Elements must match **any** of the following expressions:

 - <a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dbollard' target='_blank'>bollard</a>
 - <a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dcycle_barrier' target='_blank'>cycle_barrier</a>

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22barrier%22%3D%22bollard%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%20%20%20%20nwr%5B%22barrier%22%3D%22cycle_barrier%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

**Warning:**,this quick overview is incomplete,

| attribute | type | values which are supported by this layer |
-----|-----|----- |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/bicycle#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/bicycle/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [bicycle](https://wiki.openstreetmap.org/wiki/Key:bicycle) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dno) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/barrier#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/barrier/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [barrier](https://wiki.openstreetmap.org/wiki/Key:barrier) | Multiple choice | [bollard](https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dbollard) [cycle_barrier](https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dcycle_barrier) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/bollard#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/bollard/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [bollard](https://wiki.openstreetmap.org/wiki/Key:bollard) | Multiple choice | [removable](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dremovable) [fixed](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dfixed) [foldable](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dfoldable) [flexible](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dflexible) [rising](https://wiki.openstreetmap.org/wiki/Tag:bollard%3Drising) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/cycle_barrier#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/cycle_barrier/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [cycle_barrier](https://wiki.openstreetmap.org/wiki/Key:cycle_barrier) | Multiple choice | [single](https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dsingle) [double](https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Ddouble) [triple](https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dtriple) [squeeze](https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dsqueeze) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/maxwidth:physical#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/maxwidth%3Aphysical/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [maxwidth:physical](https://wiki.openstreetmap.org/wiki/Key:maxwidth:physical) | [distance](../SpecialInputElements.md#distance) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/width:separation#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/width%3Aseparation/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [width:separation](https://wiki.openstreetmap.org/wiki/Key:width:separation) | [distance](../SpecialInputElements.md#distance) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/width:opening#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/width%3Aopening/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [width:opening](https://wiki.openstreetmap.org/wiki/Key:width:opening) | [distance](../SpecialInputElements.md#distance) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/overlap#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/overlap/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [overlap](https://wiki.openstreetmap.org/wiki/Key:overlap) | [distance](../SpecialInputElements.md#distance) |  |

### images
This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata` and shows the button to upload new images
_This tagrendering has no question and is thus read-only_
*{image_carousel()}{image_upload()}*

### bicycle=yes/no

The question is `Can a bicycle go past this barrier?`

 -  *A cyclist can go past this.* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle' target='_blank'>bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dyes' target='_blank'>yes</a>
 -  *A cyclist can not go past this.* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle' target='_blank'>bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Dno' target='_blank'>no</a>

This tagrendering is only visible in the popup if the following condition is met: _referencing_ways~.+

### barrier_type

_This tagrendering has no question and is thus read-only_

 -  *This is a single bollard in the road* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dbollard' target='_blank'>bollard</a>
 -  *This is a cycle barrier slowing down cyclists* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dcycle_barrier' target='_blank'>cycle_barrier</a>

### Bollard type

The question is `What kind of bollard is this?`

 -  *Removable bollard* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bollard' target='_blank'>bollard</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dremovable' target='_blank'>removable</a>
 -  *Fixed bollard* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bollard' target='_blank'>bollard</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dfixed' target='_blank'>fixed</a>
 -  *Bollard that can be folded down* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bollard' target='_blank'>bollard</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dfoldable' target='_blank'>foldable</a>
 -  *Flexible bollard, usually plastic* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bollard' target='_blank'>bollard</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bollard%3Dflexible' target='_blank'>flexible</a>
 -  *Rising bollard* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bollard' target='_blank'>bollard</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bollard%3Drising' target='_blank'>rising</a>

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dbollard' target='_blank'>bollard</a>

### Cycle barrier type

The question is `What kind of cycling barrier is this?`

 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/themes/cycle_infra/Cycle_barrier_single.png'> *Single, just two barriers with a space inbetween* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dsingle' target='_blank'>single</a>
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/themes/cycle_infra/Cycle_barrier_double.svg'> *Double, two barriers behind each other* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Ddouble' target='_blank'>double</a>
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/themes/cycle_infra/Cycle_barrier_triple.png'> *Triple, three barriers behind each other* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dtriple' target='_blank'>triple</a>
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/themes/cycle_infra/Cycle_barrier_squeeze.png'> *Squeeze gate, gap is smaller at top, than at the bottom* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dsqueeze' target='_blank'>squeeze</a>

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dcycle_barrier' target='_blank'>cycle_barrier</a>

### MaxWidth

The question is `How wide is the gap left over besides the barrier?`
*Maximum width: {maxwidth:physical} m* is shown if `maxwidth:physical` is set

This tagrendering is only visible in the popup if the following condition is met: _referencing_ways~.+ & cycle_barrier!=double & cycle_barrier!=triple

### Space between barrier (cyclebarrier)

The question is `How much space is there between the barriers (along the length of the road)?`
*Space between barriers (along the length of the road): {width:separation} m* is shown if `width:separation` is set

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Ddouble' target='_blank'>double</a> | <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dtriple' target='_blank'>triple</a>

### Width of opening (cyclebarrier)

The question is `How wide is the smallest opening next to the barriers?`
*Width of opening: {width:opening} m* is shown if `width:opening` is set

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Ddouble' target='_blank'>double</a> | <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dtriple' target='_blank'>triple</a>

### Overlap (cyclebarrier)

The question is `How much overlap do the barriers have?`
*Overlap: {overlap} m* is shown if `overlap` is set

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Ddouble' target='_blank'>double</a> | <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_barrier' target='_blank'>cycle_barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_barrier%3Dtriple' target='_blank'>triple</a>

### leftover-questions

_This tagrendering has no question and is thus read-only_
*{questions( ,)}*

### move-button

_This tagrendering has no question and is thus read-only_
*{move_button()}*

### delete-button

_This tagrendering has no question and is thus read-only_
*{delete_button()}*

### lod

_This tagrendering has no question and is thus read-only_
*{linked_data_from_website()}*

This tagrendering has labels 
`added_by_default`


This document is autogenerated from [assets/layers/barrier/barrier.json](https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/assets/layers/barrier/barrier.json)
