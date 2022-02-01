birdhide
==========



<img src='https://mapcomplete.osm.be/./assets/layers/birdhide/birdhide.svg' height="100px"> 

Een vogelkijkhut

## Table of contents

1. [birdhide](#birdhide)
    * [Themes using this layer](#themes-using-this-layer)

- [Basic tags for this layer](#basic-tags-for-this-layer)
- [Supported attributes](#supported-attributes)
    + [images](#images)
    + [bird-hide-shelter-or-wall](#bird-hide-shelter-or-wall)
    + [bird-hide-wheelchair](#bird-hide-wheelchair)
    + [birdhide-operator](#birdhide-operator)

#### Themes using this layer

- [nature](https://mapcomplete.osm.be/nature)
- [personal](https://mapcomplete.osm.be/personal)

[Go to the source code](../assets/layers/birdhide/birdhide.json)



Basic tags for this layer
---------------------------



Elements must have the all of following tags to be shown on this layer:

- <a href='https://wiki.openstreetmap.org/wiki/Key:leisure' target='_blank'>leisure</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:leisure%3Dbird_hide' target='_blank'>bird_hide</a>

Supported attributes
----------------------



**Warning** This quick overview is incomplete

attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/building#values) [building](https://wiki.openstreetmap.org/wiki/Key:building) | Multiple choice | [](https://wiki.openstreetmap.org/wiki/Tag:building%3D) [yes](https://wiki.openstreetmap.org/wiki/Tag:building%3Dyes) [tower](https://wiki.openstreetmap.org/wiki/Tag:building%3Dtower)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/wheelchair#values) [wheelchair](https://wiki.openstreetmap.org/wiki/Key:wheelchair) | Multiple choice | [designated](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Ddesignated) [yes](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dyes) [limited](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dlimited) [no](https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dno)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/operator#values) [operator](https://wiki.openstreetmap.org/wiki/Key:operator) | [string](../SpecialInputElements.md#string) | [Natuurpunt](https://wiki.openstreetmap.org/wiki/Tag:operator%3DNatuurpunt) [Agentschap Natuur en Bos](https://wiki.openstreetmap.org/wiki/Tag:operator%3DAgentschap Natuur en Bos)

### images

_This tagrendering has no question and is thus read-only_

### bird-hide-shelter-or-wall

The question is **Is dit een kijkwand of kijkhut?**

- **Vogelkijkwand** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:shelter' target='_blank'>
  shelter</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:shelter%3Dno' target='_blank'>no</a>
- **Vogelkijkhut** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>
  amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dshelter' target='_blank'>shelter</a>
  &<a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dyes' target='_blank'>yes</a>
  &<a href='https://wiki.openstreetmap.org/wiki/Key:shelter' target='_blank'>shelter</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:shelter%3Dyes' target='_blank'>yes</a>
- **Vogelkijktoren** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>
  building</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dtower' target='_blank'>tower</a>
  &<a href='https://wiki.openstreetmap.org/wiki/Key:bird_hide' target='_blank'>bird_hide</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:bird_hide%3Dtower' target='_blank'>tower</a>
- **Vogelkijkhut** corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>
  amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dshelter' target='_blank'>shelter</a>
  |<a href='https://wiki.openstreetmap.org/wiki/Key:building' target='_blank'>building</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:building%3Dyes' target='_blank'>yes</a>
  |<a href='https://wiki.openstreetmap.org/wiki/Key:shelter' target='_blank'>shelter</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:shelter%3Dyes' target='_blank'>yes</a>_This option cannot be chosen
  as answer_

### bird-hide-wheelchair

The question is **Is deze vogelkijkplaats rolstoeltoegankelijk?**

- **Er zijn speciale voorzieningen voor rolstoelen** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Ddesignated' target='_blank'>designated</a>
- **Een rolstoel raakt er vlot** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dyes' target='_blank'>yes</a>
- **Je kan er raken met een rolstoel, maar het is niet makkelijk** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dlimited' target='_blank'>limited</a>
- **Niet rolstoeltoegankelijk** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:wheelchair' target='_blank'>wheelchair</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:wheelchair%3Dno' target='_blank'>no</a>

### birdhide-operator

The question is **Wie beheert deze vogelkijkplaats?**

This rendering asks information about the property  [operator](https://wiki.openstreetmap.org/wiki/Key:operator)
This is rendered with `Beheer door {operator}`

- **Beheer door Natuurpunt** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:operator' target='_blank'>operator</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:operator%3DNatuurpunt' target='_blank'>Natuurpunt</a>
- **Beheer door het Agentschap Natuur en Bos ** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:operator' target='_blank'>operator</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:operator%3DAgentschap Natuur en Bos' target='_blank'>Agentschap
  Natuur en Bos</a>

This document is autogenerated from assets/layers/birdhide/birdhide.json