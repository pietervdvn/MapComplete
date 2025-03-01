[//]: # (WARNING: this file is automatically generated. Please find the sources at the bottom and edit those sources)

# group_campsite

This layer is based on [campsite](../Layers/campsite.md)

Campsites

 - This layer is shown at zoomlevel **7** and higher

## Table of contents

1. [Themes using this layer](#themes-using-this-layer)
2. [Basic tags for this layer](#basic-tags-for-this-layer)
3. [Supported attributes](#supported-attributes)
  - [group_only](#group_only)
  - [name](#name)
  - [fee](#fee)
  - [capacity_persons](#capacity_persons)
  - [phone](#phone)
  - [email](#email)
  - [website](#website)
  - [questions](#questions)
  - [mastodon](#mastodon)
  - [images](#images)
  - [lod](#lod)
4. [Filters](#filters)

## Themes using this layer

 - [scouting](https://mapcomplete.org/scouting)

## Basic tags for this layer

Elements must match **all** of the following expressions:

0. <a href='https://wiki.openstreetmap.org/wiki/Key:tourism' target='_blank'>tourism</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:tourism%3Dcamp_site' target='_blank'>camp_site</a>
1. <a href='https://wiki.openstreetmap.org/wiki/Key:group_only' target='_blank'>group_only</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:group_only%3Dyes' target='_blank'>yes</a> | <a href='https://wiki.openstreetmap.org/wiki/Key:scout' target='_blank'>scout</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:scout%3Dyes' target='_blank'>yes</a>

[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22tourism%22%3D%22camp_site%22%5D%5B%22group_only%22%3D%22yes%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%20%20%20%20nwr%5B%22tourism%22%3D%22camp_site%22%5D%5B%22scout%22%3D%22yes%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)

## Supported attributes

**Warning:**,this quick overview is incomplete,

| attribute | type | values which are supported by this layer |
-----|-----|----- |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/group_only#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/group_only/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [group_only](https://wiki.openstreetmap.org/wiki/Key:group_only) | Multiple choice | [yes](https://wiki.openstreetmap.org/wiki/Tag:group_only%3Dyes) [no](https://wiki.openstreetmap.org/wiki/Tag:group_only%3Dno) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/name#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/name/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/charge#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/charge/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [charge](https://wiki.openstreetmap.org/wiki/Key:charge) | [currency](../SpecialInputElements.md#currency) | [](https://wiki.openstreetmap.org/wiki/Tag:charge%3D) |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/capacity:persons#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/capacity%3Apersons/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [capacity:persons](https://wiki.openstreetmap.org/wiki/Key:capacity:persons) | [pnat](../SpecialInputElements.md#pnat) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/phone#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/phone/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [phone](https://wiki.openstreetmap.org/wiki/Key:phone) | [phone](../SpecialInputElements.md#phone) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/email#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/email/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [email](https://wiki.openstreetmap.org/wiki/Key:email) | [email](../SpecialInputElements.md#email) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/website#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/website/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) |  |
| <a target="_blank" href='https://taginfo.openstreetmap.org/keys/contact:mastodon#values'><img src='https://mapcomplete.org/assets/svg/search.svg' height='18px'></a> <a target="_blank" href='https://taghistory.raifer.tech/?#***/contact%3Amastodon/'><img src='https://mapcomplete.org/assets/svg/statistics.svg' height='18px'></a> [contact:mastodon](https://wiki.openstreetmap.org/wiki/Key:contact:mastodon) | [fediverse](../SpecialInputElements.md#fediverse) |  |

### group_only

The question is `Is this campsite exclusively for groups?`

 -  *This campsite is exclusively for groups* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:group_only' target='_blank'>group_only</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:group_only%3Dyes' target='_blank'>yes</a>
 -  *This campsite is not exclusively for groups* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:group_only' target='_blank'>group_only</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:group_only%3Dno' target='_blank'>no</a>

### name

The question is `What is the name of this campsite?`
*The name of this campsite is {name}* is shown if `name` is set

### fee

The question is `Is a fee charged here?`
*A fee of {charge} should be paid for here* is shown if `charge` is set

 -  *The campsite is free of charge* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dno' target='_blank'>no</a>
 -  *A fee is charged here.* is shown if with <a href='https://wiki.openstreetmap.org/wiki/Key:fee' target='_blank'>fee</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:fee%3Dyes' target='_blank'>yes</a> & charge=

### capacity_persons

The question is `How many people can stay here?`
*{capacity:persons} people can stay here* is shown if `capacity:persons` is set

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

### questions
Show the questions block at this location
_This tagrendering has no question and is thus read-only_
*{questions()}*

### mastodon
Shows and asks for the mastodon handle
The question is `What is the Mastodon-handle of {title()}?`
*{fediverse_link(contact:mastodon)}* is shown if `contact:mastodon` is set

### images
This block shows the known images which are linked with the `image`-keys, but also via `mapillary` and `wikidata` and shows the button to upload new images
_This tagrendering has no question and is thus read-only_
*{image_carousel()}{image_upload()}*

### lod

_This tagrendering has no question and is thus read-only_
*{linked_data_from_website()}*

This tagrendering has labels 
`added_by_default`

## Filters

| id | question | osmTags |
-----|-----|----- |
| capacity_persons_filter.0 | *All capacities* (default) |  |
| capacity_persons_filter.1 | Capacity between 1 and 20 persons | capacity:persons>=1 & capacity:persons<=20 |
| capacity_persons_filter.2 | Capacity between 21 and 50 persons | capacity:persons>=21 & capacity:persons<=50 |
| capacity_persons_filter.3 | Capacity between 51 and 100 persons | capacity:persons>=51 & capacity:persons<=100 |
| capacity_persons_filter.4 | Capacity between 101 and 200 persons | capacity:persons>=101 & capacity:persons<=200 |
| capacity_persons_filter.5 | Capacity between 201 and 500 persons | capacity:persons>=201 & capacity:persons<=500 |
| capacity_persons_filter.6 | Capacity over 500 persons | capacity:persons>=501 |
| capacity_persons_filter.7 | ? | capacity:persons= |



This document is autogenerated from [assets/themes/scouting/scouting.json](https://source.mapcomplete.org/MapComplete/MapComplete/src/branch/develop/assets/themes/scouting/scouting.json)
