# Meeting notes

As of February 2023, regular meetings with Fix My City Berlin (and the wider community) are organized.

Meeting notes are tracked here and on [hackMD](https://hackmd.io/txPbPJbYRYGd51n4r4PHNQ)


The video room is https://osmvideo.cloud68.co/user/pie-j4g-vrt-qu4


# 2023-05-03

Present: Paulbrunner, RLin, Pieter, Tordans


## What has been done

- More work on the MapLibre branch
    + field-testing has started (and still many bugs)
    + Level-selector works again
    + Download-buttons enabled by default
    + Highligted elements
- Filters on cyclofix by Paul

### Style by designer of Fix My City

https://www.figma.com/file/j0Dxgbl7yx5RVqAWQbf5zH/Wireframes-MapComplete?node-id=203-3933




## Todo

Styling of MapLibre branch!




# 2023-04-19

Present: Paulbrunner, Tobials, Pieter

## Misc

Paul has a question about creating filters
width


## Social

- CCC-Camp? P will pass by Berlin
- Mapcomplete hack week? (Mid-july in Ghent?): T -> probably not, away 'till 13th


## What has been done?

- P: More refactoring on the maplibre branch
- P: Experimentation with MapRoulette to import _big_ datasets (openbenches.org)


## Open Questions

- P: styleguide! The MapLibre port is getting to a point that styling is needed to finish it up. T: ticket is in the works, Tobias will ask the designer to plan tomorrow - will probably have something to talk about in two weeks, maybe even sooner

- P: style: how to show the 'currently selected'-element on the map? Previously a somewhat ugly red 'blob', but better options must surely exist

  -> Add a border to the builtin icons (pin, square, circle, teardrop)
  -> Use a good fallback if no default icon is used

- P: some smaller, hard bugs - any hints? NO

## Planned todos

T: information architecture spreadsheet


# 2023-04-05

## What was done?

- P: Refactoring with MapLibre&Svelte in progress, small demo
- T: More design work


## Design updates

### Add new item



# 2023-03-22


## What was done?

- Svelte is in production!
- some cleanup of the themes, improvement of the documentation
- review of 'setting up the development-environment', tested on a fresh machine, some tweaks fixed
- user census results are published
- Advertisement-theme is merged and deployed
- Work on MapLibre has started (T: feel free to ask questions)
- T: contact with OpenCage

## OpenCage advertisement

Tobias did a follow-up on this

- Target someone with a big community and let them do the advertising
- "MapComplete is a great tool for organisation and topics if they want to work with OSM and want to keep data up to date -> Use MC as a tool for your audience"

## Geocoding by OpenCage

- Cities and neighbourhoods only, too limited

## Wireframes and next steps

- Via screensharee, see https://www.figma.com/file/j0Dxgbl7yx5RVqAWQbf5zH/Wireframes-MapComplete?node-id=242-7735&t=LdSserLloT9X19G4-0

## Next meeting

5th of april, 14:00, BigBlueButton


# 2023-03-08

## What was done

P: user survey result in draft; option to show _all_ questions at once; personas
R: one Svelte-component (all_tags-panel)
T: Wireframes together with Heiko

## Planned

P: publishing user survey results, then Svelte

Is there a usecase already for someone visiting via an external website

## Wireframes by Tobias

Tobias and Heiko looked to one user scenario and discussed broader changes
Which parts are good, which parts need changing? Look to the bigger picture

How can MapComplete be adapted to various contexts (e.g. embedded in the website of a local organisation; or embedded in the website of a global NGO about e.g. drinking water?)

Attempt to create a (mini) frontend style guide

### General flow

The wireframes questioned about how the general flow should be (e.g. being greeted by an explanation + go to your location via search/gps sensor)

### Menu system

Tobias proposes to:

- Have one (labeled, thus with text) button to go to the theme introduction
- Have one menu-button, which allows to go to user settings, theme switcher, privacy policy, copyright, community index, buttons with various tools ...

Pieter agrees that this needs an big overhaul

### Add a new point

Tobias proposes to add a pin at the bottom left to start the flow to create a new item

Pieter refutes this, as:

- it is not very discoverable
- you'd still have to click the map for a rough location
- the pin can be mistaken for a data point that just happens to be there
- the pin (with a plus symbol) can be mistaken for the 'zoom in'-button

Such a label should at least have a label

### FeatureInfoBox

The infobox might be placed on the right, some tweaks to the image element (and some general restructuring) could be helpfull


# 2023-02-15 14:00

https://osmvideo.cloud68.co/user/pie-j4g-vrt-qu4

Goal: having the first svelte component in develop


## Expert review of Fix My City

Reserved a block of time the first two weeks of March, UX review
Heiko & Tobias will prepare a (small) export review and possibly some sketches;
they might open some tickets.

Possible a second round of this later on


## Persona's/use scenario

E.g. the tourist information website (Pin je punt):

-> Primed by the 'pin je punt'-website
-> Open up MC
-> ...
-> See some change

Helpful for FMC as well

## MapRoulette integration

Documentation written out
Example of usage in a theme: https://mapcomplete.org/onwheels?z=12&lat=51.06262&lon=3.724021&language=nl#
Buttons to close/mark too hard/... have appeared on develop: https://pietervdvn.github.io/mc/develop/maproulette?z=15&lat=51.21127&lon=3.219745&language=nl#59417173

## Svelte

Deployed on https://pietervdvn.github.io/mc/feature/svelte/

Issues with scss:
classes with colons (e.g. md:w-full)

Feature branch feature/svelte should be mergeable
! Check a fresh install based on the docs - this will change
Update docs about the framework as well
Update docs/architecture


Use 'context' to pass around state instead of explicit passing around?
But: explicit passing of parameters is boilerplate, but prevents 'forgotten' pieces of state and makes testing easier


## Misc

generate:layouts crashes with out of memory




# 2023-02-01 14:00

Present: RLin, Tordans, WouterVDW, Pietervdvn

## Misc

Anyone going to FOSDEM (or OFFDEM)? Only Pietervdvn

## Recent changes

- Vite (in production)
- Experimenting with Svelte

Possibly moving all source files into a new src-directory to fix the scripts? **vite-node**
RLin and W did some work on this as well

## Possible UX-contribution from FMC

FMC didn't secure funding :(
Maybe a second try or split into smaller parts?

Still planning to contribute and to contribute some frontend-stuff, Tordans might (voluntarily?) contribute

## Persona's

What are important questions to ask?
What profiles do we want?

Tobias: not a fan of persona's as they tend to be a bit useless (and a waste of time). You want to get clarity what the product is about: the core audience
See them as 'core context' and 'core usage scenario' with a goal. Don't 'personificate' them to much, but writing everything down as a list of 'core features' and 'non-features' are important.

- Beginner friendly
- Does also complex tagging in a friendly way
- No JOSM/Vespucci where you can shoot yourself in the foot

The core idea is well established, but to execute it is the trick. It takes an insane amount of love and work to get all the details just right. The polishing part is important (sidenote: a frontend framework that is familiar would help the polishing).


## User testing

How is this done with FMC?

What is the timeline? Persona's done in February, some user tests in Framework and some in March.


Tobias will send some recommendations: "rocket surgery made easy"

Do a UI-overhaul for a more consistent UI (with a designer) once the framework is in place. An expert review will yield the same results as user tests; maybe first a cleanup phase.

A11y: more then just for screenreaders and blind people (e.g. high contrast). Low hanging fruit: follow the web standards; start with defining a target.

T: will talk to Heiko what and how much contributions; Tobias might do an expert review of MC (if feasible)

## User Survey

165 answers, 82% male, 10% female (hugely underrepresented), 7% other genders (according to [this article](https://www.washingtonpost.com/dc-md-va/2021/06/22/first-population-estimate-lgbtq-non-binary-adults-us-is-out-heres-why-that-matters/) and 330 million inhabitants in the U.S., there are on average 0.36% genderqueer people - so hugely overrepresented)

Ages: normal distribution around 40-50

Some conclusions at first sight:

1. MapComplete isn't very well known, some confusion with StreetComplete
2. Search sucks
3. A few feature requests or requests for tools that already exists

Better review will come in a few days.

What are good questions to ask next year? How to improve the survey?

T: guideline: the more specific the question; the better the answer. We try to stay away from general surveys; not a lot of actionable input. What are you gonna do based on these answers? Already broad in what it can do, lot's of invisible features that are unpolished. Tagging is so diverse and is hard to cover the edge cases, lot's of work in the details. Rather focus on what is already there and make it more visible (e.g. maproulette integration, german guys with a contract somewhere: for example: guided imports as feature will not be surfaced by a survey and will not serve as product guidance ).

What was the goal of the survey?

## Research: reviews and picture licenses

The images-research sparked two small projects by RTNF (https://altilunium.github.io/mapcompleteimg/ and https://altilunium.github.io/osmimgur/)
