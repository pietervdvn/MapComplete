climbing_route
================



<img src='https://mapcomplete.osm.be/./assets/themes/climbing/climbing_route.svg' height="100px"> 

## Table of contents

1. [climbing_route](#climbing_route)
    * [Themes using this layer](#themes-using-this-layer)

- [Basic tags for this layer](#basic-tags-for-this-layer)
- [Supported attributes](#supported-attributes)
    + [images](#images)
    + [questions](#questions)
    + [minimap](#minimap)
    + [Name](#name)
    + [Length](#length)
    + [Difficulty](#difficulty)
    + [Bolts](#bolts)
    + [Description](#description)
    + [Rock type](#rock-type)
    + [reviews](#reviews)


- This layer is needed as dependency for layer [climbing](#climbing)

#### Themes using this layer

- [climbing](https://mapcomplete.osm.be/climbing)

[Go to the source code](../assets/layers/climbing_route/climbing_route.json)



Basic tags for this layer
---------------------------



Elements must have the all of following tags to be shown on this layer:

- <a href='https://wiki.openstreetmap.org/wiki/Key:climbing' target='_blank'>climbing</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing%3Droute' target='_blank'>route</a>

Supported attributes
----------------------



**Warning** This quick overview is incomplete

attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:name%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:length#values) [climbing:length](https://wiki.openstreetmap.org/wiki/Key:climbing:length) | [pnat](../SpecialInputElements.md#pnat) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:grade:french#values) [climbing:grade:french](https://wiki.openstreetmap.org/wiki/Key:climbing:grade:french) | [string](../SpecialInputElements.md#string) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/climbing:bolts#values) [climbing:bolts](https://wiki.openstreetmap.org/wiki/Key:climbing:bolts) | [pnat](../SpecialInputElements.md#pnat) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/description#values) [description](https://wiki.openstreetmap.org/wiki/Key:description) | [string](../SpecialInputElements.md#string) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/_embedding_features_with_rock:rock#values) [_embedding_features_with_rock:rock](https://wiki.openstreetmap.org/wiki/Key:_embedding_features_with_rock:rock) | [string](../SpecialInputElements.md#string) |

### images

_This tagrendering has no question and is thus read-only_

### questions

_This tagrendering has no question and is thus read-only_

### minimap

_This tagrendering has no question and is thus read-only_

### Name

The question is **What is the name of this climbing route?**

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name)
This is rendered with `<strong>{name}</strong>`

- **This climbing route doesn't have a name** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:noname' target='_blank'>noname</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:noname%3Dyes' target='_blank'>yes</a>

### Length

The question is **How long is this climbing route (in meters)?**

This rendering asks information about the
property  [climbing:length](https://wiki.openstreetmap.org/wiki/Key:climbing:length)
This is rendered with `This route is {canonical(climbing:length)} long`

### Difficulty

The question is **What is the difficulty of this climbing route according to the french/belgian system?**

This rendering asks information about the
property  [climbing:grade:french](https://wiki.openstreetmap.org/wiki/Key:climbing:grade:french)
This is rendered with `The difficulty is {climbing:grade:french} according to the french/belgian system`

### Bolts

The question is **How much bolts does this route have before reaching the moulinette?**

This rendering asks information about the
property  [climbing:bolts](https://wiki.openstreetmap.org/wiki/Key:climbing:bolts)
This is rendered with `This route has {climbing:bolts} bolts`

- **This route is not bolted** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:climbing:bolted' target='_blank'>climbing:bolted</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:bolted%3Dno' target='_blank'>no</a>_This option cannot be
  chosen as answer_
- **This route is not bolted** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:climbing:bolted' target='_blank'>climbing:bolted</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:climbing:bolted%3Dno&climbing:bolts=' target='_blank'>no&climbing:
  bolts=</a>

### Description

The question is **Is there other relevant info?**

This rendering asks information about the property  [description](https://wiki.openstreetmap.org/wiki/Key:description)
This is rendered with `<h3>Description</h3><br/>{description}`

### Rock type

_This tagrendering has no question and is thus read-only_

This rendering asks information about the
property  [_embedding_features_with_rock:rock](https://wiki.openstreetmap.org/wiki/Key:_embedding_features_with_rock:rock)
This is rendered
with `The rock type is {_embedding_features_with_rock:rock} as stated <a href='#{_embedding_features_with_rock:id}'>on the surrounding crag</a>`

### reviews

_This tagrendering has no question and is thus read-only_

This document is autogenerated from assets/layers/climbing_route/climbing_route.json