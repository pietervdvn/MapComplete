[//]: # (WARNING: this file is automatically generated. Please find the sources at the bottom and edit those sources)

# defibrillator

A layer showing defibrillators which can be used in case of emergency. This contains public defibrillators, but also defibrillators which might need staff to fetch the actual device

 - This layer is shown at zoomlevel **12** and higher
 - This layer will automatically load  [walls_and_buildings](./walls_and_buildings.md)  into the layout as it depends on it:  preset `a defibrillator mounted on a wall` snaps to this layer (defibrillator.presets[1])

## Table of contents

1. [Themes using this layer](#themes-using-this-layer)
2. [Presets](#presets)
3. [Basic tags for this layer](#basic-tags-for-this-layer)
4. [Supported attributes](#supported-attributes)
  - [images](#images)
  - [defibrillator-indoors](#defibrillator-indoors)
  - [defibrillator-access](#defibrillator-access)
  - [defibrillator-defibrillator](#defibrillator-defibrillator)
  - [defibrillator-level](#defibrillator-level)
  - [defibrillator-defibrillator:location](#defibrillator-defibrillatorlocation)
  - [defibrillator-defibrillator:location:en](#defibrillator-defibrillatorlocation:en)
  - [defibrillator-defibrillator:location:fr](#defibrillator-defibrillatorlocation:fr)
  - [wheelchair-access](#wheelchair-access)
  - [defibrillator-ref](#defibrillator-ref)
  - [defibrillator-email](#defibrillator-email)
  - [defibrillator-phone](#defibrillator-phone)
  - [opening_hours_24_7](#opening_hours_24_7)
  - [Opening hours](#opening-hours)
  - [defibrillator-description](#defibrillator-description)
  - [defibrillator-survey:date](#defibrillator-surveydate)
  - [defibrillator-fixme](#defibrillator-fixme)
  - [leftover-questions](#leftover-questions)
  - [move-button](#move-button)
  - [delete-button](#delete-button)
  - [lod](#lod)
5. [Filters](#filters)

## Themes using this layer

 - [aed](https://mapcomplete.org/aed)
 - [disaster_response](https://mapcomplete.org/disaster_response)
 - [personal](https://mapcomplete.org/personal)

## Presets

The following options to create new points are included:

 - **a defibrillator** which has the following tags:<a href='https://wiki.openstreetmap.org/wiki/Key:emergency' target='_blank'>emergency</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:emergency%3Ddefibrillator' target='_blank'>defibrillator</a>
 - **a defibrillator mounted on a wall** which has the following tags:<a href='https://wiki.openstreetmap.org/wiki/Key:emergency' target='_blank'>emergency</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:emergency%3Ddefibrillator' target='_blank'>defibrillator</a> (snaps to layers `walls_and_buildings`)

## Basic tags for this layer

Elements must match the expression **<a href='https://wiki.openstreetmap.org/wiki/Key:emergency' target='_blank'>emergency</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:emergency%3Ddefibrillator' target='_blank'>defibrillator</a>**

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22emergency%22%3D%22defibrillator%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

**Warning:**,this quick overview is incomplete,

| attribute | type | values which are supported by this layer |
-----|-----|----- |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/indoor#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/indoor/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [indoor](https://wiki.openstreetmap.org/wiki/Key:indoor) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dno) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/access#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/access/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [access](https://wiki.openstreetmap.org/wiki/Key:access) | [string](../SpecialInputElements.md#string) | [yes](https://wiki.openstreetmap.org/wiki/Tag:access%3Dyes) [customers](https://wiki.openstreetmap.org/wiki/Tag:access%3Dcustomers) [private](https://wiki.openstreetmap.org/wiki/Tag:access%3Dprivate) [no](https://wiki.openstreetmap.org/wiki/Tag:access%3Dno) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/defibrillator#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/defibrillator/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [defibrillator](https://wiki.openstreetmap.org/wiki/Key:defibrillator) | Multiple choice | [manual](https://wiki.openstreetmap.org/wiki/Tag:defibrillator%3Dmanual) [automatic](https://wiki.openstreetmap.org/wiki/Tag:defibrillator%3Dautomatic) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/level#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/level/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [level](https://wiki.openstreetmap.org/wiki/Key:level) | [int](../SpecialInputElements.md#int) | [0](https://wiki.openstreetmap.org/wiki/Tag:level%3D0) [1](https://wiki.openstreetmap.org/wiki/Tag:level%3D1) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/defibrillator:location#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/defibrillator%3Alocation/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [defibrillator:location](https://wiki.openstreetmap.org/wiki/Key:defibrillator:location) | [text](../SpecialInputElements.md#text) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/defibrillator:location:en#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/defibrillator%3Alocation%3Aen/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [defibrillator:location:en](https://wiki.openstreetmap.org/wiki/Key:defibrillator:location:en) | [text](../SpecialInputElements.md#text) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/defibrillator:location:fr#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/defibrillator%3Alocation%3Afr/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [defibrillator:location:fr](https://wiki.openstreetmap.org/wiki/Key:defibrillator:location:fr) | [text](../SpecialInputElements.md#text) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/wheelchair#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/wheelchair/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [wheelchair](https://wiki.openstreetmap.org/wiki/Key:wheelchair) | Multiple choice | [designated](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Ddesignated) [yes](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dyes) [limited](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dlimited) [no](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dno) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/ref#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/ref/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [ref](https://wiki.openstreetmap.org/wiki/Key:ref) | [text](../SpecialInputElements.md#text) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/email#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/email/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [email](https://wiki.openstreetmap.org/wiki/Key:email) | [email](../SpecialInputElements.md#email) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/phone#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/phone/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [phone](https://wiki.openstreetmap.org/wiki/Key:phone) | [phone](../SpecialInputElements.md#phone) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/opening_hours#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/opening_hours/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) | [opening_hours](../SpecialInputElements.md#opening_hours) | [24/7](https://wiki.openstreetmap.org/wiki/Tag:opening_hours%3D24/7) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/description#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/description/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [description](https://wiki.openstreetmap.org/wiki/Key:description) | [text](../SpecialInputElements.md#text) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/survey:date#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/survey%3Adate/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [survey:date](https://wiki.openstreetmap.org/wiki/Key:survey:date) | [date](../SpecialInputElements.md#date) | [](https://wiki.openstreetmap.org/wiki/Tag:survey:date%3D) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/fixme#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/fixme/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [fixme](https://wiki.openstreetmap.org/wiki/Key:fixme) | [text](../SpecialInputElements.md#text) |  |

### images
This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata` and shows the button to upload new images
_This tagrendering has no question and is thus read-only_
*{image_carousel()}{image_upload()}*

### defibrillator-indoors

The question is `Is this defibrillator located indoors?`

 -  *This defibrillator is located indoors* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:indoor' target='_blank'>indoor</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dyes' target='_blank'>yes</a>
 -  *This defibrillator is located outdoors* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:indoor' target='_blank'>indoor</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dno' target='_blank'>no</a>

### defibrillator-access

The question is `Is this defibrillator freely accessible?`
*Access is {access}* is shown if `access` is set

 -  *Publicly accessible* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dyes' target='_blank'>yes</a>
 -  *Publicly accessible* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dpublic' target='_blank'>public</a>. _This option cannot be chosen as answer_
 -  *Only accessible to customers* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dcustomers' target='_blank'>customers</a>
 -  *Not accessible to the general public (e.g. only accesible to staff, the owners, …)* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dprivate' target='_blank'>private</a>
 -  *Not accessible, possibly only for professional use* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dno' target='_blank'>no</a>

### defibrillator-defibrillator

The question is `Is this a a regular automatic defibrillator or a manual defibrillator for professionals only?`

 -  *There is no info about the type of device* is shown if with defibrillator=. _This option cannot be chosen as answer_
 -  *This is a manual defibrillator for professionals* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:defibrillator' target='_blank'>defibrillator</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:defibrillator%3Dmanual' target='_blank'>manual</a>
 -  *This is a normal automatic defibrillator* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:defibrillator' target='_blank'>defibrillator</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:defibrillator%3Dautomatic' target='_blank'>automatic</a>
 -  *This is a special type of defibrillator: {defibrillator}* is shown if with defibrillator~.+. _This option cannot be chosen as answer_

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dno' target='_blank'>no</a>

### defibrillator-level

The question is `On which floor is this defibrillator located?`
*This defibrillator is on floor {level}* is shown if `level` is set

 -  *This defibrillator is on the <b>ground floor</b>* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:level' target='_blank'>level</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:level%3D0' target='_blank'>0</a>
 -  *This defibrillator is on the <b>first floor</b>* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:level' target='_blank'>level</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:level%3D1' target='_blank'>1</a>

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:indoor' target='_blank'>indoor</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:indoor%3Dyes' target='_blank'>yes</a>

### defibrillator-defibrillator:location

The question is `Please give some explanation on where the defibrillator can be found (in the local language)`
*<i>Extra information about the location (in the local language):</i><br/>{defibrillator:location}* is shown if `defibrillator:location` is set

### defibrillator-defibrillator:location:en

The question is `Please give some explanation on where the defibrillator can be found (in English)`
*<i>Extra information about the location (in English):</i><br/>{defibrillator:location:en}* is shown if `defibrillator:location:en` is set

### defibrillator-defibrillator:location:fr

The question is `Please give some explanation on where the defibrillator can be found (in French)`
*<i>Extra information about the location (in French):</i><br/>{defibrillator:location:fr}* is shown if `defibrillator:location:fr` is set

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:_country' target='_blank'>_country</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:_country%3Dbe' target='_blank'>be</a> | defibrillator:location:fr~.+

### wheelchair-access

The question is `Is this place accessible with a wheelchair?`

 -  *This place is specially adapted for wheelchair users* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Ddesignated' target='_blank'>designated</a>
 -  *This place is easily reachable with a wheelchair* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dyes' target='_blank'>yes</a>
 -  *It is possible to reach this place in a wheelchair, but it is not easy* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dlimited' target='_blank'>limited</a>
 -  *This place is not reachable with a wheelchair* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dno' target='_blank'>no</a>

### defibrillator-ref

The question is `What is the official identification number of the device? (if visible on device)`
*Official identification number of the device: <i>{ref}</i>* is shown if `ref` is set

### defibrillator-email

The question is `What is the email for questions about this defibrillator?`
*Email for questions about this defibrillator: <a href='mailto:{email}'>{email}</a>* is shown if `email` is set

### defibrillator-phone

The question is `What is the phone number for questions about this defibrillator?`
*Telephone for questions about this defibrillator: <a href='tel:{phone}'>{phone}</a>* is shown if `phone` is set

### opening_hours_24_7

The question is `At what times is this defibrillator available?`
*<h3>Opening hours</h3>{opening_hours_table(opening_hours)}* is shown if `opening_hours` is set

 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/layers/questions/open24_7.svg'> *24/7 opened (including holidays)* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:opening_hours' target='_blank'>opening_hours</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:opening_hours%3D24/7' target='_blank'>24/7</a>
 -  *Marked as closed for an unspecified time* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:opening_hours' target='_blank'>opening_hours</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:opening_hours%3Dclosed' target='_blank'>closed</a>. _This option cannot be chosen as answer_

### defibrillator-description

The question is `Is there any useful information for users that you haven't been able to describe above? (leave blank if no)`
*Additional information: {description}* is shown if `description` is set

### defibrillator-survey:date

The question is `When was this defibrillator last surveyed?`
*This defibrillator was last surveyed on {survey:date}* is shown if `survey:date` is set

 -  *Checked today!* is shown if with survey:date=

### defibrillator-fixme

The question is `Is there something wrong with how this is mapped, that you weren't able to fix here? (leave a note to OpenStreetMap experts)`
*Extra information for OpenStreetMap experts: {fixme}* is shown if `fixme` is set

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

## Filters

| id | question | osmTags |
-----|-----|----- |
| has_image.0 | *With and without images* (default) |  |
| has_image.1 | Has at least one image | image~.+ | image:0~.+ | image:1~.+ | image:2~.+ | image:3~.+ | mapillary~.+ |
| has_image.2 | Probably does not have an image | image= & image:0= & image:1= & image:2= & image:3= & mapillary= |

| id | question | osmTags |
-----|-----|----- |
| open_now.0 | Now open | _isOpen=yes |



This document is autogenerated from [assets/layers/defibrillator/defibrillator.json](https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/assets/layers/defibrillator/defibrillator.json)
