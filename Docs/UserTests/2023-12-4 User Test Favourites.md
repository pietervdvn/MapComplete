
## Task

Add a (specified) feature as favourite
Find and use the list of favourites
Determine information from this list
Open the popup from this list

## Background info

User has used mapcomplete before

## Results

The user is asked to mark a specified bicycle shop as favourite. They find the big button to mark as favourite at the bottom.

When asked to select another feature, they choose a bicycle pump. When hinted that 'they can add this in a different way', they immediately select the heart title icon.

When asked to open the list of favourites, they open the 'hamburger'-menu. After a bit of looking, they spot the 'Your favourites'-button.

They are a bit confused. The specified bicycle shop is advertised as `building or wall`.

The bicycle pump is shown correctly, the icons are clear. When asked to open the popup for one of them, they click directly on the link.

## Surfaced issues

Due to the way the title is generated, wrong titles appeared: all titles from all layers are mixed and used as title, if the tags match. As such, the title `building or wall` appeared, as it happened to be on top and the bicycle shop had a `building~*` tag.

This was resolved by sorting those titles by popularity. The least occuring tags/titles are placed first, so that the most specific title is shown. This might, in some cases, still result in differing titles (e.g. if something is e.g. both a shop and a café), but this should be exceptional.
