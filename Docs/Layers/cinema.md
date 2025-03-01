[//]: # (WARNING: this file is automatically generated. Please find the sources at the bottom and edit those sources)

# cinema

A place showing movies (films), generally open to the public for a fee. Commonly referred to as a movie theater in the US.

 - This layer is shown at zoomlevel **10** and higher

## Table of contents

1. [Themes using this layer](#themes-using-this-layer)
2. [Basic tags for this layer](#basic-tags-for-this-layer)
3. [Supported attributes](#supported-attributes)
  - [images](#images)
  - [reviews](#reviews)
  - [phone](#phone)
  - [email](#email)
  - [website](#website)
  - [wikipedia](#wikipedia)
  - [cinema_type](#cinema_type)
  - [leftover-questions](#leftover-questions)
  - [move-button](#move-button)
  - [lod](#lod)

## Themes using this layer

 - [openlovemap](https://mapcomplete.org/openlovemap)

## Basic tags for this layer

Elements must match the expression **<a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dcinema' target='_blank'>cinema</a>**

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22amenity%22%3D%22cinema%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

**Warning:**,this quick overview is incomplete,

| attribute | type | values which are supported by this layer |
-----|-----|----- |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/phone#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/phone/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [phone](https://wiki.openstreetmap.org/wiki/Key:phone) | [phone](../SpecialInputElements.md#phone) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/email#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/email/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [email](https://wiki.openstreetmap.org/wiki/Key:email) | [email](../SpecialInputElements.md#email) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/website#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/website/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/wikidata#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/wikidata/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [wikidata](https://wiki.openstreetmap.org/wiki/Key:wikidata) | [wikidata](../SpecialInputElements.md#wikidata) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/cinema#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/cinema/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [cinema](https://wiki.openstreetmap.org/wiki/Key:cinema) | Multiple choice | [](https://wiki.openstreetmap.org/wiki/Tag:cinema%3D) [erotic](https://wiki.openstreetmap.org/wiki/Tag:cinema%3Derotic) |

### images
This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata` and shows the button to upload new images
_This tagrendering has no question and is thus read-only_
*{image_carousel()}{image_upload()}*

### reviews
Shows the reviews module (including the possibility to leave a review)
_This tagrendering has no question and is thus read-only_
*{create_review()}{list_reviews()}*

### phone

The question is `What is the phone number of {title()}?`
*{link(&LBRACEphone&RBRACE,tel:&LBRACEphone&RBRACE,,,,)}* is shown if `phone` is set

 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/layers/questions/phone.svg'> *{link(&LBRACEcontact:phone&RBRACE,tel:&LBRACEcontact:phone&RBRACE,,,,)}* is shown if with contact:phone~.+. _This option cannot be chosen as answer_

This tagrendering has labels 
`contact`

### email

The question is `What is the email address of {title()}?`
*<a href='mailto:{email}' target='_blank' rel='noopener'>{email}</a>* is shown if `email` is set

 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/svg/envelope.svg'> *<a href='mailto:{contact:email}' target='_blank' rel='noopener'>{contact:email}</a>* is shown if with contact:email~.+. _This option cannot be chosen as answer_
 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/svg/envelope.svg'> *<a href='mailto:{operator:email}' target='_blank' rel='noopener'>{operator:email}</a>* is shown if with operator:email~.+. _This option cannot be chosen as answer_

This tagrendering has labels 
`contact`

### website

The question is `What is the website of {title()}?`
*<a href='{website}' rel='nofollow noopener noreferrer' target='_blank'>{website}</a>* is shown if `website` is set

 - <img width='38px' height='38px' src='https://dev.mapcomplete.org/./assets/layers/icons/website.svg'> *<a href='{contact:website}' rel='nofollow noopener noreferrer' target='_blank'>{contact:website}</a>* is shown if with contact:website~.+. _This option cannot be chosen as answer_

This tagrendering has labels 
`contact`

### wikipedia
Shows a wikipedia box with the corresponding wikipedia article; the wikidata-item link can be changed by a contributor
The question is `What is the corresponding Wikidata entity?`
*{wikipedia():max-height:25rem}* is shown if `wikidata` is set

 -  *{wikipedia():max-height:25rem}* is shown if with wikipedia~.+. _This option cannot be chosen as answer_
 -  *No Wikipedia page has been linked yet* is shown if with wikidata=. _This option cannot be chosen as answer_

### cinema_type

The question is `What type of cinema is this?`

 -  *This is a normal cinema showing movies for all ages* is shown if with cinema=
 -  *This is an erotic cinema showing adult movies* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:cinema' target='_blank'>cinema</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:cinema%3Derotic' target='_blank'>erotic</a>

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


This document is autogenerated from [assets/layers/cinema/cinema.json](https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/assets/layers/cinema/cinema.json)
