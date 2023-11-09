# User Test of the Studio

## Task

Create a simple layer specification using MapComplete studio with 'images', a few questions and an icon. The actual _topic_ of the layer can be chosen by the participant

This participant wanted to create a layer about food_sharing and give_boxes.

## Background info

User has used mapcomplete a few times before but has very little OSM-knowledge.

## Surfaced issues

- [x] dev.mapcomplete.org crashes
- [x] Switching tagRenderings or creating them sometimes creates a 'null' value which crashes downstream: should be filtered out 
- [x] Switching between editing layers does not update the title
- [x] The warning messages don't update when editing
- [x] The distinction between a 'warning' and an 'error' is unclear
- [x] A questionHint without a question should give an error
- [x] The 'title'-field should not have a 'question', as it is read-only
- [x] Button to edit the tagRendering is unclear
  - [x] Change text
  - [x] Change to primary
- [ ] The markers (which can be built from multiple, stacked images) approach is unclear
- [x] When creating a new layer, perhaps force 'source' too?
- [x] Forced questions in the beginning: do not show errors
- [x] Validation: forbid that a mapping starts with "yes" or "no"
- [x] TagRenderings: freeform key cannot be set to 'undefined' again
- [x] When a new tagRendering is added, the floatover should open immediately
- [x] Mappings with different keys do not erase each other/freeform (e.g. noname=yes should erase `name`)
- [x] Rename `mapping` to `predifined icon`, perhaps add a clarifying icon
- [x] In tagRenderings: the `question`-field should be in question-mode right from the start
- [x] If _only_ freeform.key is set (but no question nor render): an error should be generated
- [x] The questionHints take too much space and should be unstickied
- [x] There should be some space for the 'close'-button in the tagRendering
- [x] Changing the icon: the term 'icon badge' is misunderstood and interpreted as "the logo"
- [x] Trying to change the 'iconBadges' does not work

### Wont fix

Should be clear to seasoned OSM-people

- [-] How to create a mapping for `key=yes` or `key=no` is unclear. Person searched for a 'binary'-type instead
- [-] Creating a preset: initially very unclear
