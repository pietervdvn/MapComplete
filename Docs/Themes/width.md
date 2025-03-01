[//]: # (WARNING: this file is automatically generated. Please find the sources at the bottom and edit those sources)

## Straatbreedtes ( [width](https://mapcomplete.org/width) )
_This document details some technical information about this MapComplete theme, mostly about the attributes used in the theme. Various links point toward more information about the attributes, e.g. to the OpenStreetMap-wiki, to TagInfo or tools creating statistics_
The theme introduction reads:

> De straat is opgebruikt Er is steeds meer druk op de openbare ruimte. Voetgangers, fietsers, steps, auto's, bussen, bestelwagens, buggies, cargobikes, ... willen allemaal hun deel van de openbare ruimte en de straat. In deze studie nemen we Brugge onder de loep en kijken we hoe breed elke straat is én hoe breed elke straat zou moeten zijn voor een veilig én vlot verkeer. Legende     Straat te smal voor veilig verkeer     Straat is breed genoeg veilig verkeer     Straat zonder voetpad, te smal als ook voetgangers plaats krijgen     Autoluw, autoloos of enkel plaatselijk verkeer   Een gestippelde lijn is een straat waar ook voor fietsers éénrichtingsverkeer geldt. Klik op een straat om meer informatie te zien.

This theme contains the following layers:

 - [street_with_width (defined in this theme)](#street_with_width)

Available languages:

 - nl

# Table of contents

  - [Straatbreedtes ( width )](#straatbreedtes-(-width-))
1. [Layers defined in this theme configuration file](#layers-defined-in-this-theme-configuration-file)
2. [street_with_width](#street_with_width)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [carriageway_width](#carriageway_width)
    + [too_little_width](#too_little_width)
    + [needed_for_cars](#needed_for_cars)
    + [needed_for_parking](#needed_for_parking)
    + [needed_for_cyclists](#needed_for_cyclists)
    + [needed_for_pedestrians](#needed_for_pedestrians)
    + [total_width_needed](#total_width_needed)
    + [has_sidewalks](#has_sidewalks)
    + [leftover-questions](#leftover-questions)
    + [lod](#lod)

# Layers defined in this theme configuration file
These layers can not be reused in different themes.
# street_with_width

A layer showing street with corresponding widths + an analysis of what this width is used for

 - This layer is shown at zoomlevel **12** and higher

No themes use this layer

## Basic tags for this layer

Elements must match the expression **width:carriageway~.+**

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22width%3Acarriageway%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

**Warning:**,this quick overview is incomplete,

| attribute | type | values which are supported by this layer |
-----|-----|----- |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/width:carriageway#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/width%3Acarriageway/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [width:carriageway](https://wiki.openstreetmap.org/wiki/Key:width:carriageway) | [distance](../SpecialInputElements.md#distance) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/_width:difference#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/_width%3Adifference/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [_width:difference](https://wiki.openstreetmap.org/wiki/Key:_width:difference) | Multiple choice |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/oneway#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/oneway/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [oneway](https://wiki.openstreetmap.org/wiki/Key:oneway) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:oneway%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:oneway%3Dno) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/sidewalk#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/sidewalk/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [sidewalk](https://wiki.openstreetmap.org/wiki/Key:sidewalk) | Multiple choice | [none](https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dnone) [left](https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dleft) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/sidewalk#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/sidewalk/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [sidewalk](https://wiki.openstreetmap.org/wiki/Key:sidewalk) | Multiple choice | [both](https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dboth) [none](https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dnone) [left](https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dleft) [right](https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dright) |

### carriageway_width

The question is `Hoe breed is deze straat?`
*Deze straat is <b>{width:carriageway}m</b> breed* is shown if `width:carriageway` is set

### too_little_width

_This tagrendering has no question and is thus read-only_
*Deze straat heeft <span class='alert'>{_width:difference}m</span> te weinig. De ruimte die nodig zou zijn is:*

 -  *Deze straat is breed genoeg:* is shown if with _width:difference~^(-.*)$ | <a href='https://wiki.openstreetmap.org/wiki/Key:_width:difference' target='_blank'>_width:difference</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:_width:difference%3D0' target='_blank'>0</a>

### needed_for_cars

_This tagrendering has no question and is thus read-only_
*<b>{_width:needed:cars}m</b> voor het autoverkeer*

 -  *<b>{_width:needed:cars}m</b> voor het éénrichtings-autoverkeer* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:oneway' target='_blank'>oneway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:oneway%3Dyes' target='_blank'>yes</a>
 -  *<b>{_width:needed:cars}m</b> voor het tweerichtings-autoverkeer* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:oneway' target='_blank'>oneway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:oneway%3Dno' target='_blank'>no</a>

### needed_for_parking

_This tagrendering has no question and is thus read-only_
*<b>{_width:needed:parking}m</b> voor het geparkeerde wagens*

### needed_for_cyclists

_This tagrendering has no question and is thus read-only_
*<b>{_width:needed:cyclists}m</b> voor fietsers*

 -  *Fietsers hebben hier een vrijliggend fietspad en worden dus niet meegerekend* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:bicycle' target='_blank'>bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:bicycle%3Duse_sidepath' target='_blank'>use_sidepath</a>
 -  *<b>{_width:needed:cyclists}m</b> voor fietsers die met de rijrichting mee moeten* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:oneway:bicycle' target='_blank'>oneway:bicycle</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:oneway:bicycle%3Dyes' target='_blank'>yes</a>

### needed_for_pedestrians

_This tagrendering has no question and is thus read-only_
*<b>{_width:needed:pedestrians}m</b> voor voetgangers*

 -  *<b>{_width:needed:pedestrians}m</b> voor voetgangers: er zijn hier geen voetpaden* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:sidewalk' target='_blank'>sidewalk</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dnone' target='_blank'>none</a> | <a href='https://wiki.openstreetmap.org/wiki/Key:sidewalk' target='_blank'>sidewalk</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dno' target='_blank'>no</a>
 -  *<b>{_width:needed:pedestrians}m</b> voor voetgangers: er is slechts aan één kant een voetpad* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:sidewalk' target='_blank'>sidewalk</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dleft' target='_blank'>left</a> | <a href='https://wiki.openstreetmap.org/wiki/Key:sidewalk' target='_blank'>sidewalk</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dright' target='_blank'>right</a>

### total_width_needed

_This tagrendering has no question and is thus read-only_
*<span style='border: 1px solid black; border-radius: 0.5em; padding: 0.25em;'><b>{_width:needed:total}m</b> nodig in het totaal</span>*

### has_sidewalks

The question is `Heeft deze straat voetpaden?`

 -  *Voetpad aan beide zijden* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:sidewalk' target='_blank'>sidewalk</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dboth' target='_blank'>both</a>
 -  *Heeft géén voetpaden* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:sidewalk' target='_blank'>sidewalk</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dnone' target='_blank'>none</a>
 -  *Voetpad aan de linkerkant* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:sidewalk' target='_blank'>sidewalk</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dleft' target='_blank'>left</a>
 -  *Voetpad aan de rechterzijde* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:sidewalk' target='_blank'>sidewalk</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:sidewalk%3Dright' target='_blank'>right</a>

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:id' target='_blank'>id</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:id%3Ddisabled' target='_blank'>disabled</a>

### leftover-questions

_This tagrendering has no question and is thus read-only_
*{questions( ,)}*

### lod

_This tagrendering has no question and is thus read-only_
*{linked_data_from_website()}*

This tagrendering has labels 
`added_by_default`


This document is autogenerated from [assets/themes/width/width.json](https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/assets/themes/width/width.json)
