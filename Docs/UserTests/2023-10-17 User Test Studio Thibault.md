# User Test of the Studio

## Task

Create a simple layer specification using MapComplete studio with 'images' and a question. The actual _topic_ of the layer can be chosen by the participant

This participant wanted to create a layer about solar panels.

## Background info

Browser: Librewolf on a linux machine (actually: pietervdvn's dev machine)
Testurl: hosted.Mapcomplete.org/studio.html
The participant has an extensive knowledge of MapComplete - both as user, data contributor but also as beta tester.
As such, many terms and the general structure of Studio were intuitively clear.

## Surfaced issues with studio

- [x] If the 'name' or 'description' of the layer are not given, it cannot be loaded as 'fake' theme. This needs a clear warning message
- [x] The explanation of the field `render` uses `&LBRACEkey&RBRACE` instead of `{key}`
- [x] The freeform textfield only takes a small part of the screen, should be made full-width
- [x] The 'render'-field should be moved in the 'freeform' section
- [x] A pending `Translated value:` is still shown in the UI (for debugging purposes) - should be removed
- [x] The 'textfield' of the 'Translated Value' should be hidden - especially as it contains JSON
- [x] If an external dataset is loaded, a 'read only' mode should be triggered causing the 'question' - part to be disabled
- [ ] snapToLayer-section under presets section is not immediately clear. The participant realized after a few seconds what it meant drawing on their extensive MC-experience, but a beginner would not be able to figure this out

## Suggestions and feature requests by the participant

- Add image previews (e.g. show a preview)
- The ability to paste `key=value` tags and have them filled into the relevant fields
- [x] minzoom is set on 0 by default, which might choke mapcomplete; a sensible default (~15) should be taken for this

## Other misc issues

- [x] The crosshair might be invisible if the aerial imagery is quite dark (fixed in 9dc222be433512d4d1ca530c1d09e28442d976ec)
