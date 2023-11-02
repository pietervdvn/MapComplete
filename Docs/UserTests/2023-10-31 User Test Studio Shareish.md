# User Test of the Studio

## Task

Create a simple layer specification using MapComplete studio with 'images', a few questions and an icon. The actual _topic_ of the layer can be chosen by the participant

This participant wanted to create a layer about food_sharing and give_boxes.

## Background info

User has used mapcomplete a few times before but has very little OSM-knowledge.

## Surfaced issues

- [ ] dev.mapcomplete.org crashes
- [x] Switching tagRenderings or creating them sometimes creates a 'null' value which crashes downstream: should be filtered out 
- [x] Switching between editing layers does not update the title
- [x] The warning messages don't update when editing
- [x] A questionHint without a question should give an error
