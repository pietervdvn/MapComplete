[//]: # (WARNING: this file is automatically generated. Please find the sources at the bottom and edit those sources)

## GRB import helper ( [grb](https://mapcomplete.org/grb) )
_This document details some technical information about this MapComplete theme, mostly about the attributes used in the theme. Various links point toward more information about the attributes, e.g. to the OpenStreetMap-wiki, to TagInfo or tools creating statistics_
The theme introduction reads:

> This theme is an attempt to help automating the GRB import.

This theme contains the following layers:

 - [osm_buildings_no_points (defined in this theme)](#osm_buildings_no_points)
 - [grb (defined in this theme)](#grb)
 - [service_ways (defined in this theme)](#service_ways)
 - [generic_osm_object (defined in this theme)](#generic_osm_object)
 - [address](../Layers/address.md)
 - [crab_address](../Layers/crab_address.md)
 - [current_view](../Layers/current_view.md)

Available languages:

 - nl

# Table of contents

  - [GRB import helper ( grb )](#grb-import-helper-(-grb-))
1. [Layers defined in this theme configuration file](#layers-defined-in-this-theme-configuration-file)
2. [osm_buildings_no_points](#osm_buildings_no_points)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [building type](#building-type)
    + [grb-housenumber](#grb-housenumber)
    + [grb-unit](#grb-unit)
    + [grb-street](#grb-street)
    + [grb-reference](#grb-reference)
    + [grb-fixme](#grb-fixme)
    + [grb-min-level](#grb-min-level)
    + [all_tags](#all_tags)
    + [leftover-questions](#leftover-questions)
    + [lod](#lod)
  - [Filters](#filters)
3. [grb](#grb)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [Import-button](#import-button)
    + [Building info](#building-info)
    + [overlapping building address](#overlapping-building-address)
    + [grb_address_diff](#grb_address_diff)
    + [overlapping building id](#overlapping-building-id)
    + [overlapping building type](#overlapping-building-type)
    + [overlapping building map](#overlapping-building-map)
    + [GRB geometry:](#grb-geometry)
    + [OSM geometry:](#osm-geometry)
    + [apply-id](#apply-id)
    + [apply-building-type](#apply-building-type)
    + [leftover-questions](#leftover-questions)
    + [lod](#lod)
4. [service_ways](#service_ways)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [leftover-questions](#leftover-questions)
    + [lod](#lod)
5. [generic_osm_object](#generic_osm_object)
  - [Basic tags for this layer](#basic-tags-for-this-layer)
  - [Supported attributes](#supported-attributes)
    + [all_tags](#all_tags)
    + [leftover-questions](#leftover-questions)
    + [lod](#lod)

# Layers defined in this theme configuration file
These layers can not be reused in different themes.
# osm_buildings_no_points

 - This layer is shown at zoomlevel **17** and higher
 - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`

No themes use this layer

## Basic tags for this layer

Elements must match **all** of the following expressions:

0. id~^(way\/.*)$ | id~^(relation\/.*)$
1. building~.+

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22id%22~%22%5E%28way%5C%2F.*%29%24%22%5D%5B%22building%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%20%20%20%20nwr%5B%22id%22~%22%5E%28relation%5C%2F.*%29%24%22%5D%5B%22building%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

**Warning:**,this quick overview is incomplete,

| attribute | type | values which are supported by this layer |
-----|-----|----- |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/building#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/building/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [building](https://wiki.openstreetmap.org/wiki/Key:building) | [string](../SpecialInputElements.md#string) | [house](https://wiki.openstreetmap.org/wiki/Tag:building%3Dhouse) [detached](https://wiki.openstreetmap.org/wiki/Tag:building%3Ddetached) [semidetached_house](https://wiki.openstreetmap.org/wiki/Tag:building%3Dsemidetached_house) [apartments](https://wiki.openstreetmap.org/wiki/Tag:building%3Dapartments) [office](https://wiki.openstreetmap.org/wiki/Tag:building%3Doffice) [shed](https://wiki.openstreetmap.org/wiki/Tag:building%3Dshed) [garage](https://wiki.openstreetmap.org/wiki/Tag:building%3Dgarage) [garages](https://wiki.openstreetmap.org/wiki/Tag:building%3Dgarages) [yes](https://wiki.openstreetmap.org/wiki/Tag:building%3Dyes) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/addr:housenumber#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/addr%3Ahousenumber/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [addr:housenumber](https://wiki.openstreetmap.org/wiki/Key:addr:housenumber) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:addr:housenumber%3D) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/addr:unit#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/addr%3Aunit/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [addr:unit](https://wiki.openstreetmap.org/wiki/Key:addr:unit) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:addr:unit%3D) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/addr:street#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/addr%3Astreet/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [addr:street](https://wiki.openstreetmap.org/wiki/Key:addr:street) | [string](../SpecialInputElements.md#string) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/fixme#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/fixme/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [fixme](https://wiki.openstreetmap.org/wiki/Key:fixme) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:fixme%3D) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/building:min_level#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/building%3Amin_level/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [building:min_level](https://wiki.openstreetmap.org/wiki/Key:building:min_level) | [pnat](../SpecialInputElements.md#pnat) |  |

### building type

The question is `What kind of building is this?`
*The building type is <b>{building}</b>* is shown if `building` is set

 -  *A normal house* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dhouse' target='_blank'>house</a>
 -  *A house detached from other building* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Ddetached' target='_blank'>detached</a>
 -  *A house sharing only one wall with another house* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dsemidetached_house' target='_blank'>semidetached_house</a>
 -  *An apartment building (highrise building for living)* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dapartments' target='_blank'>apartments</a>
 -  *An office building - highrise for work* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Doffice' target='_blank'>office</a>
 -  *A small shed, e.g. in a garden* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dshed' target='_blank'>shed</a>
 -  *A single garage to park a car* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dgarage' target='_blank'>garage</a>
 -  *A building containing only garages; typically they are all identical* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dgarages' target='_blank'>garages</a>
 -  *A building - no specification* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dyes' target='_blank'>yes</a>

### grb-housenumber

The question is `Wat is het huisnummer?`
*Het huisnummer is <b>{addr:housenumber}</b>* is shown if `addr:housenumber` is set

 -  *Geen huisnummer* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:not:addr:housenumber' target='_blank'>not:addr:housenumber</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:not:addr:housenumber%3Dyes' target='_blank'>yes</a> & addr:housenumber=

### grb-unit

The question is `Wat is de wooneenheid-aanduiding?`
*De wooneenheid-aanduiding is <b>{addr:unit}</b> * is shown if `addr:unit` is set

 -  *Geen wooneenheid-nummer* is shown if with addr:unit=

### grb-street

The question is `Wat is de straat?`
*De straat is <b>{addr:street}</b>* is shown if `addr:street` is set

### grb-reference

_This tagrendering has no question and is thus read-only_
*Has been imported from GRB, reference number is {source:geometry:ref}*

This tagrendering is only visible in the popup if the following condition is met: source:geometry:ref~.+

### grb-fixme

The question is `Wat zegt de fixme?`
*De fixme is <b>{fixme}</b>* is shown if `fixme` is set

 -  *Geen fixme* is shown if with fixme=

### grb-min-level

The question is `Hoeveel verdiepingen ontbreken?`
*Dit gebouw begint maar op de {building:min_level} verdieping* is shown if `building:min_level` is set

### all_tags
Shows a table with all the tags of the feature
_This tagrendering has no question and is thus read-only_
*{all_tags()}*

### leftover-questions

_This tagrendering has no question and is thus read-only_
*{questions( ,)}*

### lod

_This tagrendering has no question and is thus read-only_
*{linked_data_from_website()}*

This tagrendering has labels 
`added_by_default`

## Filters

| id | question | osmTags |
-----|-----|----- |
| has-fixme.0 | Heeft een FIXME | fixme~.+ |

| id | question | osmTags | fields |
-----|-----|-----|----- |
| last-edited-by.0 | Last change made by {username} |  | username (regex) |

# grb

Geometry which comes from GRB with tools to import them

 - This layer is shown at zoomlevel **17** and higher
 - <img src='../warning.svg' height='1rem'/>

This layer is loaded from an external source, namely 

`https://betadata.byteless.net/grb?bbox={x_min},{y_min},{x_max},{y_max}`

No themes use this layer

## Basic tags for this layer

Elements must match **all** of the following expressions:

0. man_made!=mast
1. osm_id~.+

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22man_made%22!%3D%22mast%22%5D%5B%22osm_id%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

### Import-button

_This tagrendering has no question and is thus read-only_
*{import_way_button(osm_buildings_no_points,building=$building;man_made=$man_made; source:geometry:date=$_grb_date; source:geometry:ref=$_grb_ref; addr:street=$addr:street; addr:housenumber=$addr:housenumber; building:min_level=$_building:min_level, Upload this building to OpenStreetMap,,_is_part_of_building=true,1,_moveable=true)}*

 -  *Did not yet calculate the metatags... Reopen this popup* is shown if with _grb_ref=
 -  *This building has holes and is modeled as a relation. As such, it cannot be conflated. Conflate it manually via <a href='https://buildings.osm.be/#/'>the building export site</a> {open_in_josm()}* is shown if with id~^(relation\/*)$ & _overlap_percentage>50 & _reverse_overlap_percentage>50 & _overlaps_with~.+
 -  *{conflate_button(osm_buildings_no_points,building=$_target_building_type; source:geometry:date=$_grb_date; source:geometry:ref=$_grb_ref; addr:street=$addr:street; addr:housenumber=$addr:housenumber, Replace the geometry in OpenStreetMap and add the address,,_osm_obj:id)}* is shown if with _overlap_percentage>50 & _reverse_overlap_percentage>50 & _osm_obj:addr:street= & _osm_obj:addr:housenumber= & addr:street~.+ & addr:housenumber~.+ & addr:street!= & addr:housenumber!=
 -  *{conflate_button(osm_buildings_no_points,building=$_target_building_type; source:geometry:date=$_grb_date; source:geometry:ref=$_grb_ref, Replace the geometry in OpenStreetMap,,_osm_obj:id)}* is shown if with _overlap_percentage>50 & _reverse_overlap_percentage>50

### Building info

_This tagrendering has no question and is thus read-only_
*This is a <b>{building}</b> <span class='subtle'>detected by {detection_method}</span>*

### overlapping building address

_This tagrendering has no question and is thus read-only_
*The overlapping openstreetmap-building has no address information at all*

 -  *The overlapping openstreetmap-building has address {_osm_obj:addr:street} {_osm_obj:addr:housenumber}* is shown if with _osm_obj:addr:street~.+ & _osm_obj:addr:housenumber~.+
 -  *The overlapping building only has a street known: {_osm_obj:addr:street}* is shown if with _osm_obj:addr:street~.+
 -  *The overlapping building only has a housenumber known: {_osm_obj:addr:housenumber}* is shown if with _osm_obj:addr:housenumber~.+
 -  *No overlapping OpenStreetMap-building found* is shown if with _osm_obj:id=

### grb_address_diff

_This tagrendering has no question and is thus read-only_
*<div>The overlapping openstreetmap-building has a different address then this GRB-object: {addr:street} {addr:housenumber}<br/>{tag_apply(addr:street=$addr:street; addr:housenumber=$addr:housenumber,Copy the GRB-address onto the OSM-object,,_osm_obj:id)}*

This tagrendering is only visible in the popup if the following condition is met: (addr:street!= | addr:housenumber!=) & _osm_obj:id~.+ & addr:street~.+ & addr:housenumber~.+

### overlapping building id

_This tagrendering has no question and is thus read-only_
*The overlapping <a href='https://osm.org/{_osm_obj:id}' target='_blank'>openstreetmap-building has id {_osm_obj:id}</a>*

This tagrendering is only visible in the popup if the following condition is met: _osm_obj:id~.+

### overlapping building type

_This tagrendering has no question and is thus read-only_
*The overlapping building is a <b>{_osm_obj:building}</b> and covers <b>{_overlap_percentage}%</b> of the GRB building. <br/>The GRB-building covers <b>{_reverse_overlap_percentage}%</b> of the OSM building<br/>The OSM-building is based on GRB-data from {_osm_obj:source:date}.*

This tagrendering is only visible in the popup if the following condition is met: _osm_obj:id~.+

### overlapping building map

_This tagrendering has no question and is thus read-only_
*<h3>GRB geometry:</h3>{minimap(21, id):height:10rem;border-radius:1rem;overflow:hidden}<h3>OSM geometry:</h3>{minimap(21,_osm_obj:id):height:10rem;border-radius:1rem;overflow:hidden}*

This tagrendering is only visible in the popup if the following condition is met: _osm_obj:id~.+

### apply-id

_This tagrendering has no question and is thus read-only_
*{tag_apply(source:geometry:date=$_grb_date; source:geometry:ref=$_grb_ref,Mark the OSM-building as imported,,_osm_obj:id)}*

This tagrendering is only visible in the popup if the following condition is met: _imported!=yes & _overlaps_with~.+

### apply-building-type

_This tagrendering has no question and is thus read-only_
*{tag_apply(building=$building,Use the building type from GRB,,_osm_obj:id)}*

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:_osm_obj:building' target='_blank'>_osm_obj:building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:_osm_obj:building%3Dyes' target='_blank'>yes</a> & _overlaps_with~.+ & building!=yes

### leftover-questions

_This tagrendering has no question and is thus read-only_
*{questions( ,)}*

### lod

_This tagrendering has no question and is thus read-only_
*{linked_data_from_website()}*

This tagrendering has labels 
`added_by_default`
# service_ways

A seperate layer with service roads, as to remove them from the intersection testing

 - This layer is shown at zoomlevel **17** and higher
 - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`

No themes use this layer

## Basic tags for this layer

Elements must match the expression **<a href='https://wiki.openstreetmap.org/wiki/Key:highway' target='_blank'>highway</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:highway%3Dservice' target='_blank'>service</a>**

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22highway%22%3D%22service%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

### leftover-questions

_This tagrendering has no question and is thus read-only_
*{questions( ,)}*

### lod

_This tagrendering has no question and is thus read-only_
*{linked_data_from_website()}*

This tagrendering has labels 
`added_by_default`
# generic_osm_object

 - This layer is shown at zoomlevel **17** and higher
 - Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`

No themes use this layer

## Basic tags for this layer

Elements must match **all** of the following expressions:

0. boundary=
1. disused:power=
2. place=
3. power=
4. level= | <a href='https://wiki.openstreetmap.org/wiki/Key:level' target='_blank'>level</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:level%3D0' target='_blank'>0</a>
5. <a href='https://wiki.openstreetmap.org/wiki/Key:layer' target='_blank'>layer</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:layer%3D0' target='_blank'>0</a> | layer=
6. id~.+
7. type!=route
8. type!=boundary
9. type!=waterway

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B!%22boundary%22%5D%5B!%22disused%3Apower%22%5D%5B!%22place%22%5D%5B!%22power%22%5D%5B!%22level%22%5D%5B%22layer%22%3D%220%22%5D%5B%22id%22%5D%5B%22type%22!%3D%22route%22%5D%5B%22type%22!%3D%22boundary%22%5D%5B%22type%22!%3D%22waterway%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%20%20%20%20nwr%5B!%22boundary%22%5D%5B!%22disused%3Apower%22%5D%5B!%22place%22%5D%5B!%22power%22%5D%5B!%22level%22%5D%5B!%22layer%22%5D%5B%22id%22%5D%5B%22type%22!%3D%22route%22%5D%5B%22type%22!%3D%22boundary%22%5D%5B%22type%22!%3D%22waterway%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%20%20%20%20nwr%5B!%22boundary%22%5D%5B!%22disused%3Apower%22%5D%5B!%22place%22%5D%5B!%22power%22%5D%5B%22level%22%3D%220%22%5D%5B%22layer%22%3D%220%22%5D%5B%22id%22%5D%5B%22type%22!%3D%22route%22%5D%5B%22type%22!%3D%22boundary%22%5D%5B%22type%22!%3D%22waterway%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%20%20%20%20nwr%5B!%22boundary%22%5D%5B!%22disused%3Apower%22%5D%5B!%22place%22%5D%5B!%22power%22%5D%5B%22level%22%3D%220%22%5D%5B!%22layer%22%5D%5B%22id%22%5D%5B%22type%22!%3D%22route%22%5D%5B%22type%22!%3D%22boundary%22%5D%5B%22type%22!%3D%22waterway%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

### all_tags
Shows a table with all the tags of the feature
_This tagrendering has no question and is thus read-only_
*{all_tags()}*

### leftover-questions

_This tagrendering has no question and is thus read-only_
*{questions( ,)}*

### lod

_This tagrendering has no question and is thus read-only_
*{linked_data_from_website()}*

This tagrendering has labels 
`added_by_default`


This document is autogenerated from [assets/themes/grb/grb.json](https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/assets/themes/grb/grb.json)
