[//]: # (WARNING: this file is automatically generated. Please find the sources at the bottom and edit those sources)

# dogpark

A layer showing dogparks, which are areas where dog are allowed to run without a leash

 - This layer is shown at zoomlevel **10** and higher

## Table of contents

1. [Themes using this layer](#themes-using-this-layer)
2. [Presets](#presets)
3. [Basic tags for this layer](#basic-tags-for-this-layer)
4. [Supported attributes](#supported-attributes)
  - [images](#images)
  - [reviews](#reviews)
  - [Name](#name)
  - [opening_hours_24_7](#opening_hours_24_7)
  - [Opening hours](#opening-hours)
  - [website](#website)
  - [dogpark-fenced](#dogpark-fenced)
  - [smalldogs](#smalldogs)
  - [dogarea](#dogarea)
  - [leftover-questions](#leftover-questions)
  - [move-button](#move-button)
  - [lod](#lod)
5. [Filters](#filters)

## Themes using this layer

 - [personal](https://mapcomplete.org/personal)
 - [pets](https://mapcomplete.org/pets)

## Presets

The following options to create new points are included:

 - **a dog park** which has the following tags:<a href='https://wiki.openstreetmap.org/wiki/Key:leisure' target='_blank'>leisure</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:leisure%3Ddog_park' target='_blank'>dog_park</a>

## Basic tags for this layer

Elements must match **any** of the following expressions:

 - <a href='https://wiki.openstreetmap.org/wiki/Key:leisure' target='_blank'>leisure</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:leisure%3Ddog_park' target='_blank'>dog_park</a>
 - <a href='https://wiki.openstreetmap.org/wiki/Key:dog' target='_blank'>dog</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:dog%3Dunleashed' target='_blank'>unleashed</a> & <a href='https://wiki.openstreetmap.org/wiki/Key:leisure' target='_blank'>leisure</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:leisure%3Dpark' target='_blank'>park</a>

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22leisure%22%3D%22dog_park%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%20%20%20%20nwr%5B%22dog%22%3D%22unleashed%22%5D%5B%22leisure%22%3D%22park%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

**Warning:**,this quick overview is incomplete,

| attribute | type | values which are supported by this layer |
-----|-----|----- |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/name#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/name/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/opening_hours#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/opening_hours/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [opening_hours](https://wiki.openstreetmap.org/wiki/Key:opening_hours) | [opening_hours](../SpecialInputElements.md#opening_hours) | [24/7](https://wiki.openstreetmap.org/wiki/Tag:opening_hours%3D24/7) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/website#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/website/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/barrier#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/barrier/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [barrier](https://wiki.openstreetmap.org/wiki/Key:barrier) | Multiple choice | [fence](https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dfence) [no](https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dno) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/small_dog#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/small_dog/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [small_dog](https://wiki.openstreetmap.org/wiki/Key:small_dog) | Multiple choice | [separate](https://wiki.openstreetmap.org/wiki/Tag:small_dog%3Dseparate) [shared](https://wiki.openstreetmap.org/wiki/Tag:small_dog%3Dshared) |

### images
This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata` and shows the button to upload new images
_This tagrendering has no question and is thus read-only_
*{image_carousel()}{image_upload()}*

### reviews
Shows the reviews module (including the possibility to leave a review)
_This tagrendering has no question and is thus read-only_
*{create_review()}{list_reviews()}*

### Name

The question is `What is the name of this dog park?`
*The name of this dog park is {name}* is shown if `name` is set

### opening_hours_24_7

The question is `What are the opening hours of {title()}?`
*<h3>Opening hours</h3>{opening_hours_table(opening_hours)}* is shown if `opening_hours` is set

 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/layers/questions/open24_7.svg'> *24/7 opened (including holidays)* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:opening_hours' target='_blank'>opening_hours</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:opening_hours%3D24/7' target='_blank'>24/7</a>
 -  *Marked as closed for an unspecified time* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:opening_hours' target='_blank'>opening_hours</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:opening_hours%3Dclosed' target='_blank'>closed</a>. _This option cannot be chosen as answer_

### website

The question is `What is the website of {title()}?`
*<a href='{website}' rel='nofollow noopener noreferrer' target='_blank'>{website}</a>* is shown if `website` is set

 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/layers/icons/website.svg'> *<a href='{contact:website}' rel='nofollow noopener noreferrer' target='_blank'>{contact:website}</a>* is shown if with contact:website~.+. _This option cannot be chosen as answer_

This tagrendering has labels 
`contact`

### dogpark-fenced

The question is `It this dog park fenced in?`

 -  *This dogpark is fenced all around* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dfence' target='_blank'>fence</a>
 -  *This dogpark is not fenced all around* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:barrier' target='_blank'>barrier</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:barrier%3Dno' target='_blank'>no</a>

### smalldogs

The question is `Does this dog park have a separate fenced in area for small dogs and puppies?`

 -  *Have separate area for puppies and small dogs* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:small_dog' target='_blank'>small_dog</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:small_dog%3Dseparate' target='_blank'>separate</a>
 -  *Does <strong>not</strong> have a separate area for puppies and small dogs* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:small_dog' target='_blank'>small_dog</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:small_dog%3Dshared' target='_blank'>shared</a>

### dogarea

_This tagrendering has no question and is thus read-only_
*This dogpark is {_surface:ha} ha big*

### leftover-questions

_This tagrendering has no question and is thus read-only_
*{questions( ,)}*

### move-button

_This tagrendering has no question and is thus read-only_
*{move_button()}*

### lod

_This tagrendering has no question and is thus read-only_
*{linked_data_from_website()}*

This tagrendering has labels 
`added_by_default`

## Filters

| id | question | osmTags |
-----|-----|----- |
| open_now.0 | Now open | _isOpen=yes |



This document is autogenerated from [assets/layers/dogpark/dogpark.json](https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/assets/layers/dogpark/dogpark.json)
