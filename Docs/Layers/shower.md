[//]: # (WARNING: this file is automatically generated. Please find the sources at the bottom and edit those sources)

# shower

A layer showing (public) showers

 - This layer is shown at zoomlevel **8** and higher

## Table of contents

1. [Themes using this layer](#themes-using-this-layer)
2. [Presets](#presets)
3. [Basic tags for this layer](#basic-tags-for-this-layer)
4. [Supported attributes](#supported-attributes)
  - [images](#images)
  - [repeated](#repeated)
  - [single_level](#single_level)
  - [access](#access)
  - [fee](#fee)
  - [charge](#charge)
  - [opening_hours](#opening_hours)
  - [Opening hours](#opening-hours)
  - [hot_water](#hot_water)
  - [payment-options-split](#payment-options-split)
  - [leftover-questions](#leftover-questions)
  - [move-button](#move-button)
  - [delete-button](#delete-button)
  - [lod](#lod)
5. [Filters](#filters)

## Themes using this layer

 - [personal](https://mapcomplete.org/personal)
 - [toilets](https://mapcomplete.org/toilets)

## Presets

The following options to create new points are included:

 - **a shower** which has the following tags:<a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dshower' target='_blank'>shower</a>

## Basic tags for this layer

Elements must match the expression **<a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dshower' target='_blank'>shower</a>**

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22amenity%22%3D%22shower%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

**Warning:**,this quick overview is incomplete,

| attribute | type | values which are supported by this layer |
-----|-----|----- |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/level#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/level/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [level](https://wiki.openstreetmap.org/wiki/Key:level) | [float](../SpecialInputElements.md#float) | [0](https://wiki.openstreetmap.org/wiki/Tag:level%3D0) [1](https://wiki.openstreetmap.org/wiki/Tag:level%3D1) [-1](https://wiki.openstreetmap.org/wiki/Tag:level%3D-1) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/access#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/access/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [access](https://wiki.openstreetmap.org/wiki/Key:access) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:access%3Dyes) [customers](https://wiki.openstreetmap.org/wiki/Tag:access%3Dcustomers) [key](https://wiki.openstreetmap.org/wiki/Tag:access%3Dkey) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/fee#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/fee/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [fee](https://wiki.openstreetmap.org/wiki/Key:fee) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:fee%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:fee%3Dno) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/charge#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/charge/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [charge](https://wiki.openstreetmap.org/wiki/Key:charge) | [string](../SpecialInputElements.md#string) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/opening_hours#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/opening_hours/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) | [opening_hours](../SpecialInputElements.md#opening_hours) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/hot_water#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/hot_water/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [hot_water](https://wiki.openstreetmap.org/wiki/Key:hot_water) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:hot_water%3Dyes) [fee](https://wiki.openstreetmap.org/wiki/Tag:hot_water%3Dfee) [no](https://wiki.openstreetmap.org/wiki/Tag:hot_water%3Dno) |

### images
This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata` and shows the button to upload new images
_This tagrendering has no question and is thus read-only_
*{image_carousel()}{image_upload()}*

### repeated

_This tagrendering has no question and is thus read-only_
*Multiple, identical objects can be found on floors {repeat_on}.*

This tagrendering is only visible in the popup if the following condition is met: repeat_on~.+
This tagrendering has labels 
`level`

### single_level

The question is `On what level is this feature located?`
*Located on the {level}th floor* is shown if `level` is set

 -  *Located underground* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:location' target='_blank'>location</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:location%3Dunderground' target='_blank'>underground</a>. _This option cannot be chosen as answer_
 -  *Located on the ground floor* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:level' target='_blank'>level</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:level%3D0' target='_blank'>0</a>
 -  *Located on the ground floor* is shown if with level=. _This option cannot be chosen as answer_
 -  *Located on the first floor* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:level' target='_blank'>level</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:level%3D1' target='_blank'>1</a>
 -  *Located on the first basement level* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:level' target='_blank'>level</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:level%3D-1' target='_blank'>-1</a>

This tagrendering has labels 
`level`

### access

The question is `Who can use this shower?`

 -  *Anyone can use this shower* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dyes' target='_blank'>yes</a>
 -  *Only customers can use this shower* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dcustomers' target='_blank'>customers</a>
 -  *Accesible, but one has to ask for a key* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:access' target='_blank'>access</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:access%3Dkey' target='_blank'>key</a>

### fee

The question is `Is there a fee for using this shower?`

 -  *There is a fee for using this shower* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dyes' target='_blank'>yes</a>
 -  *This shower is free to use* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dno' target='_blank'>no</a>

### charge

The question is `How much does it cost to use this shower?`
*It costs {charge} to use this shower* is shown if `charge` is set

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dyes' target='_blank'>yes</a>

### opening_hours

The question is `What are the opening hours of {title()}?`
*<h3>Opening hours</h3>{opening_hours_table(opening_hours)}* is shown if `opening_hours` is set

 -  *Marked as closed for an unspecified time* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:opening_hours' target='_blank'>opening_hours</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:opening_hours%3Dclosed' target='_blank'>closed</a>. _This option cannot be chosen as answer_

### hot_water

The question is `Does this shower have hot water available?`

 -  *Hot water is available here* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:hot_water' target='_blank'>hot_water</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:hot_water%3Dyes' target='_blank'>yes</a>
 -  *Hot water is available here, but there is a fee* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:hot_water' target='_blank'>hot_water</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:hot_water%3Dfee' target='_blank'>fee</a>
 -  *There is no hot water available here* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:hot_water' target='_blank'>hot_water</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:hot_water%3Dno' target='_blank'>no</a>

### payment-options-split

The question is `Which methods of payment are accepted here?`

 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/layers/questions/cash.svg'> *Cash is accepted here* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:payment:cash' target='_blank'>payment:cash</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:cash%3Dyes' target='_blank'>yes</a>. _This option cannot be chosen as answer_. Unselecting this answer will add payment:cash=
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/layers/questions/payment_card.svg'> *Payment cards are accepted here* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:payment:cards' target='_blank'>payment:cards</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:cards%3Dyes' target='_blank'>yes</a>. _This option cannot be chosen as answer_. Unselecting this answer will add payment:cards=
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/layers/questions/qrcode.svg'> *Payment by QR-code is possible here* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:payment:qr_code' target='_blank'>payment:qr_code</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:qr_code%3Dyes' target='_blank'>yes</a>. Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:qr_code' target='_blank'>payment:qr_code</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:qr_code%3Dno' target='_blank'>no</a>
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/layers/questions/coins.svg'> *Coins are accepted here* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:payment:coins' target='_blank'>payment:coins</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:coins%3Dyes' target='_blank'>yes</a>. Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:coins' target='_blank'>payment:coins</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:coins%3Dno' target='_blank'>no</a>
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/layers/questions/notes.svg'> *Bank notes are accepted here* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:payment:notes' target='_blank'>payment:notes</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:notes%3Dyes' target='_blank'>yes</a>. Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:notes' target='_blank'>payment:notes</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:notes%3Dno' target='_blank'>no</a>
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/layers/questions/payment_card.svg'> *Debit cards are accepted here* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:payment:debit_cards' target='_blank'>payment:debit_cards</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:debit_cards%3Dyes' target='_blank'>yes</a>. Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:debit_cards' target='_blank'>payment:debit_cards</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:debit_cards%3Dno' target='_blank'>no</a>
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/layers/questions/payment_card.svg'> *Credit cards are accepted here* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:payment:credit_cards' target='_blank'>payment:credit_cards</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:credit_cards%3Dyes' target='_blank'>yes</a>. Unselecting this answer will add <a href='https://wiki.openstreetmap.org/wiki/Key:payment:credit_cards' target='_blank'>payment:credit_cards</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:payment:credit_cards%3Dno' target='_blank'>no</a>

This tagrendering is only visible in the popup if the following condition is met: <a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dyes' target='_blank'>yes</a> | <a href='https://wiki.openstreetmap.org/wiki/Key:hot_water' target='_blank'>hot_water</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:hot_water%3Dfee' target='_blank'>fee</a>

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
| free.0 | Free to use | fee=no | fee=0 | charge=0 |

| id | question | osmTags |
-----|-----|----- |
| hot-water.0 | Hot water available | hot_water=yes | hot_water=fee |

| id | question | osmTags |
-----|-----|----- |
| open_now.0 | Now open | _isOpen=yes |

| id | question | osmTags |
-----|-----|----- |
| accepts_cash.0 | Accepts cash | payment:cash=yes |

| id | question | osmTags |
-----|-----|----- |
| accepts_cards.0 | Accepts payment cards | payment:cards=yes |



This document is autogenerated from [assets/layers/shower/shower.json](https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/assets/layers/shower/shower.json)
