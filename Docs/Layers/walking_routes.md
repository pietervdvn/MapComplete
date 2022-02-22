walking_routes
================





Walking routes by 'provincie Antwerpen'

## Table of contents

1. [walking_routes](#walking_routes)

- [Basic tags for this layer](#basic-tags-for-this-layer)
- [Supported attributes](#supported-attributes)
    + [walk-length](#walk-length)
    + [walk-type](#walk-type)
    + [walk-description](#walk-description)
    + [walk-operator](#walk-operator)
    + [walk-operator-email](#walk-operator-email)
    + [questions](#questions)
    + [reviews](#reviews)


- Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`
- <img src='../warning.svg' height='1rem'/> This layer is loaded from an external source, namely `https://raw.githubusercontent.com/pietervdvn/MapComplete-data/main/speelplekken_cache/speelplekken_{layer}_{z}_{x}_{y}.geojson`

[Go to the source code](../assets/layers/walking_routes/walking_routes.json)



Basic tags for this layer
---------------------------



Elements must have the all of following tags to be shown on this layer:

- <a href='https://wiki.openstreetmap.org/wiki/Key:type' target='_blank'>type</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:type%3Droute' target='_blank'>route</a>
- <a href='https://wiki.openstreetmap.org/wiki/Key:route' target='_blank'>route</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:route%3Dfoot' target='_blank'>foot</a>
- operator~^[pP]rovincie Antwerpen$

Supported attributes
----------------------



**Warning** This quick overview is incomplete

attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/route#values) [route](https://wiki.openstreetmap.org/wiki/Key:route) | Multiple choice | [iwn](https://wiki.openstreetmap.org/wiki/Tag:route%3Diwn) [nwn](https://wiki.openstreetmap.org/wiki/Tag:route%3Dnwn) [rwn](https://wiki.openstreetmap.org/wiki/Tag:route%3Drwn) [lwn](https://wiki.openstreetmap.org/wiki/Tag:route%3Dlwn)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/description#values) [description](https://wiki.openstreetmap.org/wiki/Key:description) | [text](../SpecialInputElements.md#text) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operator#values) [operator](https://wiki.openstreetmap.org/wiki/Key:operator) | [string](../SpecialInputElements.md#string) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operator:email#values) [operator:email](https://wiki.openstreetmap.org/wiki/Key:operator:email) | [email](../SpecialInputElements.md#email) |

### walk-length

_This tagrendering has no question and is thus read-only_

### walk-type

_This tagrendering has no question and is thus read-only_

- **Dit is een internationale wandelroute** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:route' target='_blank'>route</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:route%3Diwn' target='_blank'>iwn</a>
- **Dit is een nationale wandelroute** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:route' target='_blank'>route</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:route%3Dnwn' target='_blank'>nwn</a>
- **Dit is een regionale wandelroute** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:route' target='_blank'>route</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:route%3Drwn' target='_blank'>rwn</a>
- **Dit is een lokale wandelroute** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:route' target='_blank'>route</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:route%3Dlwn' target='_blank'>lwn</a>

### walk-description

The question is **Geef een korte beschrijving van de wandeling (max 255 tekens)**

This rendering asks information about the property  [description](https://wiki.openstreetmap.org/wiki/Key:description)
This is rendered with `<h3>Korte beschrijving:</h3>{description}`

### walk-operator

The question is **Wie beheert deze wandeling en plaatst dus de signalisatiebordjes?**

This rendering asks information about the property  [operator](https://wiki.openstreetmap.org/wiki/Key:operator)
This is rendered with `Signalisatie geplaatst door {operator}`

### walk-operator-email

The question is **Naar wie kan men emailen bij problemen rond signalisatie?**

This rendering asks information about the
property  [operator:email](https://wiki.openstreetmap.org/wiki/Key:operator:email)
This is rendered
with `Bij problemen met signalisatie kan men emailen naar <a href='mailto:{operator:email}'>{operator:email}</a>`

### questions

_This tagrendering has no question and is thus read-only_

### reviews

_This tagrendering has no question and is thus read-only_

This document is autogenerated from assets/layers/walking_routes/walking_routes.json