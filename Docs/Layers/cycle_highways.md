cycle_highways
================

## Table of contents

1. [cycle_highways](#cycle_highways)

- [Basic tags for this layer](#basic-tags-for-this-layer)
- [Supported attributes](#supported-attributes)
    + [cycle_highways-name](#cycle_highways-name)
    + [cycle_highways-ref](#cycle_highways-ref)
    + [cycle_highways-state](#cycle_highways-state)
    + [cycle-highway-length](#cycle-highway-length)
    + [website](#website)
    + [all_tags](#all_tags)


- Not rendered on the map by default. If you want to rendering this on the map, override `mapRenderings`

[Go to the source code](../assets/layers/cycle_highways/cycle_highways.json)



Basic tags for this layer
---------------------------



Elements must have the all of following tags to be shown on this layer:

- <a href='https://wiki.openstreetmap.org/wiki/Key:cycle_network' target='_blank'>cycle_network</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:cycle_network%3DBE-VLG:cycle_highway' target='_blank'>BE-VLG:
  cycle_highway</a>

Supported attributes
----------------------



**Warning** This quick overview is incomplete

attribute | type | values which are supported by this layer
----------- | ------ | ------------------------------------------
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/name#values) [name](https://wiki.openstreetmap.org/wiki/Key:name) | [string](../SpecialInputElements.md#string) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/ref#values) [ref](https://wiki.openstreetmap.org/wiki/Key:ref) | [string](../SpecialInputElements.md#string) |
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/state#values) [state](https://wiki.openstreetmap.org/wiki/Key:state) | [string](../SpecialInputElements.md#string) | [proposed](https://wiki.openstreetmap.org/wiki/Tag:state%3Dproposed) [proposed](https://wiki.openstreetmap.org/wiki/Tag:state%3Dproposed) [proposed](https://wiki.openstreetmap.org/wiki/Tag:state%3Dproposed) [temporary](https://wiki.openstreetmap.org/wiki/Tag:state%3Dtemporary) [](https://wiki.openstreetmap.org/wiki/Tag:state%3D)
[<img src='https://mapcomplete.osm.be/assets/svg/statistics.svg' height='18px'>](https://taginfo.openstreetmap.org/keys/website#values) [website](https://wiki.openstreetmap.org/wiki/Key:website) | [url](../SpecialInputElements.md#url) |

### cycle_highways-name

The question is **What is the name of this cycle highway?**

This rendering asks information about the property  [name](https://wiki.openstreetmap.org/wiki/Key:name)
This is rendered with `The name is <b>{name}</b>`

### cycle_highways-ref

The question is **What is the reference number of this cycle highway?**

This rendering asks information about the property  [ref](https://wiki.openstreetmap.org/wiki/Key:ref)
This is rendered with `Referentienummer is <b>{ref}</b>`

### cycle_highways-state

The question is **What is the state of this link?**

This rendering asks information about the property  [state](https://wiki.openstreetmap.org/wiki/Key:state)
This is rendered with `The current state of this link is {state}`

- **This is a proposed route which can be cycled** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:state' target='_blank'>state</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:state%3Dproposed' target='_blank'>proposed</a>
- **This is a proposed route which has missing links (thus: some parts don't even have a building permit yet)**
  corresponds with <a href='https://wiki.openstreetmap.org/wiki/Key:state' target='_blank'>state</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:state%3Dproposed' target='_blank'>proposed</a>
  &<a href='https://wiki.openstreetmap.org/wiki/Key:note:state' target='_blank'>note:state</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:note:state%3Dhas_highway_no' target='_blank'>has_highway_no</a>
- **This is a proposed route which has some links which are under construction** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:state' target='_blank'>state</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:state%3Dproposed' target='_blank'>proposed</a>
  &<a href='https://wiki.openstreetmap.org/wiki/Key:note:state' target='_blank'>note:state</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:note:state%3Dhas_highway_under_construction' target='_blank'>
  has_highway_under_construction</a>
- **This is a temporary deviation** corresponds
  with <a href='https://wiki.openstreetmap.org/wiki/Key:state' target='_blank'>state</a>
  =<a href='https://wiki.openstreetmap.org/wiki/Tag:state%3Dtemporary' target='_blank'>temporary</a>
- **This link is operational and signposted** corresponds with

### cycle-highway-length

_This tagrendering has no question and is thus read-only_

### website

The question is **What is the website of {name}?**

This rendering asks information about the property  [website](https://wiki.openstreetmap.org/wiki/Key:website)
This is rendered with `<a href='{website}' target='_blank'>{website}</a>`

- **<a href='{contact:website}' target='_blank'>{contact:website}</a>** corresponds with contact:website~^..*$_This
  option cannot be chosen as answer_

### all_tags

_This tagrendering has no question and is thus read-only_

This document is autogenerated from assets/layers/cycle_highways/cycle_highways.json