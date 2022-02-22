osm-buildings-fixme
=====================

## Table of contents

1. [osm-buildings-fixme](#osm-buildings-fixme)

- [Basic tags for this layer](#basic-tags-for-this-layer)
- [Supported attributes](#supported-attributes)
    + [building type](#building-type)
    + [grb-housenumber](#grb-housenumber)
    + [grb-unit](#grb-unit)
    + [grb-street](#grb-street)
    + [grb-fixme](#grb-fixme)
    + [grb-min-level](#grb-min-level)
    + [fix_verdieping](#fix_verdieping)
    + [all_tags](#all_tags)

[Go to the source code](../assets/layers/osm-buildings-fixme/osm-buildings-fixme.json)



Basic tags for this layer
---------------------------



Elements must have the all of following tags to be shown on this layer:

- building~^..*$
- fixme~^..*$

Supported attributes
----------------------



**Warning** This quick overview is incomplete

attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/building#values) [building](https://wiki.openstreetmap.org/wiki/Key:building) | [string](../SpecialInputElements.md#string) | [house](https://wiki.openstreetmap.org/wiki/Tag:building%3Dhouse) [detached](https://wiki.openstreetmap.org/wiki/Tag:building%3Ddetached) [semidetached_house](https://wiki.openstreetmap.org/wiki/Tag:building%3Dsemidetached_house) [apartments](https://wiki.openstreetmap.org/wiki/Tag:building%3Dapartments) [office](https://wiki.openstreetmap.org/wiki/Tag:building%3Doffice) [apartments](https://wiki.openstreetmap.org/wiki/Tag:building%3Dapartments) [shed](https://wiki.openstreetmap.org/wiki/Tag:building%3Dshed) [garage](https://wiki.openstreetmap.org/wiki/Tag:building%3Dgarage) [garages](https://wiki.openstreetmap.org/wiki/Tag:building%3Dgarages) [yes](https://wiki.openstreetmap.org/wiki/Tag:building%3Dyes)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/addr:housenumber#values) [addr:housenumber](https://wiki.openstreetmap.org/wiki/Key:addr:housenumber) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:addr:housenumber%3D) [](https://wiki.openstreetmap.org/wiki/Tag:addr:housenumber%3D) [](https://wiki.openstreetmap.org/wiki/Tag:addr:housenumber%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/addr:unit#values) [addr:unit](https://wiki.openstreetmap.org/wiki/Key:addr:unit) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:addr:unit%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/addr:street#values) [addr:street](https://wiki.openstreetmap.org/wiki/Key:addr:street) | [string](../SpecialInputElements.md#string) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/fixme#values) [fixme](https://wiki.openstreetmap.org/wiki/Key:fixme) | [string](../SpecialInputElements.md#string) | [](https://wiki.openstreetmap.org/wiki/Tag:fixme%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/building:min_level#values) [building:min_level](https://wiki.openstreetmap.org/wiki/Key:building:min_level) | [pnat](../SpecialInputElements.md#pnat) |

### building type

The question is **What kind of building is this?**

This rendering asks information about the property  [building](https://wiki.openstreetmap.org/wiki/Key:building)
This is rendered with `The building type is <b>{building}</b>`

- **A normal house** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>
  building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dhouse' target='_blank'>house</a>
- **A house detached from other building** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Ddetached' target='_blank'>detached</a>
- **A house sharing only one wall with another house** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dsemidetached_house' target='_blank'>
  semidetached_house</a>
- **An apartment building - highrise for living** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dapartments' target='_blank'>apartments</a>
- **An office building - highrise for work** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Doffice' target='_blank'>office</a>
- **An apartment building** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>
  building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dapartments' target='_blank'>apartments</a>
- **A small shed, e.g. in a garden** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dshed' target='_blank'>shed</a>
- **A single garage to park a car** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dgarage' target='_blank'>garage</a>
- **A building containing only garages; typically they are all identical** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dgarages' target='_blank'>garages</a>
- **A building - no specification** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dyes' target='_blank'>yes</a>

### grb-housenumber

The question is **Wat is het huisnummer?**

This rendering asks information about the
property  [addr:housenumber](https://wiki.openstreetmap.org/wiki/Key:addr:housenumber)
This is rendered with `Het huisnummer is <b>{addr:housenumber}</b>`

- **Geen huisnummer** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:not:addr:housenumber' target='_blank'>not:addr:housenumber</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:not:addr:housenumber%3Dyes' target='_blank'>yes</a>
- **Het huisnummer is <b>{_grbNumber}</b>, wat overeenkomt met het GRB** corresponds with addr:housenumber=
- **Dit gebouw heeft geen nummer, net zoals in het GRB** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:not:addr:housenumber' target='_blank'>not:addr:housenumber</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:not:addr:housenumber%3Dyes' target='_blank'>yes</a>

### grb-unit

The question is **Wat is de wooneenheid-aanduiding?**

This rendering asks information about the property  [addr:unit](https://wiki.openstreetmap.org/wiki/Key:addr:unit)
This is rendered with `De wooneenheid-aanduiding is <b>{addr:unit}</b> `

- **Geen wooneenheid-nummer** corresponds with

### grb-street

The question is **Wat is de straat?**

This rendering asks information about the property  [addr:street](https://wiki.openstreetmap.org/wiki/Key:addr:street)
This is rendered with `De straat is <b>{addr:street}</b>`

### grb-fixme

The question is **Wat zegt de fixme?**

This rendering asks information about the property  [fixme](https://wiki.openstreetmap.org/wiki/Key:fixme)
This is rendered with `De fixme is <b>{fixme}</b>`

- **Geen fixme** corresponds with

### grb-min-level

The question is **Hoeveel verdiepingen ontbreken?**

This rendering asks information about the
property  [building:min_level](https://wiki.openstreetmap.org/wiki/Key:building:min_level)
This is rendered with `Dit gebouw begint maar op de {building:min_level} verdieping`

### fix_verdieping

_This tagrendering has no question and is thus read-only_

### all_tags

_This tagrendering has no question and is thus read-only_

This document is autogenerated from assets/layers/osm-buildings-fixme/osm-buildings-fixme.json