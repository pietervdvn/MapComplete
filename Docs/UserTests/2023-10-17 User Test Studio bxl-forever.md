# User Test of the Studio

## Task

Create a simple layer specification using MapComplete studio with 'images' and a question. The actual _topic_ of the layer can be chosen by the participant

This participant wanted to create a layer to park escooters

## Background info

Browser: Participants machine, browser unknown (but no browser-specific bugs were encountered)
Testurl: hosted.Mapcomplete.org/studio.html
The participant has extensive OpenStreetMap-knowledge but only used MapComplete a few times, long ago.

## Surfaced issues

- [x] In presets, all options can be chosen (e.g. regex, '<', ...). However, these should be uploadable tags
- [x] The 'try it out'-button should be a 'next'-button
- [x] Entering an incorrect ID and pressing enter still takes you to the layer editor with an incorrect ID 
- [x] A name and description are obligatory to use the layer as single-layer-theme; but those error messages are unclear. 
- [x] This user had an expression with two tags in an AND. There was some confusion if the taginfo-count gave the totals for the tags individually or for the entire expression.
        Fix: play with padding and wording
- [x] BUG: having a complex expression for tags (e.g. with `and: [key=value, key0=value0]`) fails as the JSON would be stringified
- [x] In MapComplete (not in studio): creating a new point: the buttons might dissapear under scroll if zoomed in a lot
- [x] If a layer does not have a title and a tagRenderings, it is not interpreted as 'standalone' theme
