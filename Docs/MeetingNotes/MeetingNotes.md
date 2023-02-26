# Meeting notes

As of February 2023, regular meetings with Fix My City Berlin (and the wider community) are organized.

Meeting notes are tracked here.


## 2023-02-15 14:00

https://osmvideo.cloud68.co/user/pie-j4g-vrt-qu4

Goal: having the first svelte component in develop


## 2023-02-01 14:00

Present: RLin, Tordans, WouterVDW, Pietervdvn

### Misc

Anyone going to FOSDEM (or OFFDEM)? Only Pietervdvn

### Recent changes

- Vite (in production)
- Experimenting with Svelte

Possibly moving all source files into a new src-directory to fix the scripts? **vite-node**
RLin and W did some work on this as well

### Possible UX-contribution from FMC

FMC didn't secure funding :(
Maybe a second try or split into smaller parts?

Still planning to contribute and to contribute some frontend-stuff, Tordans might (voluntarily?) contribute

### Persona's

What are important questions to ask?
What profiles do we want?

Tobias: not a fan of persona's as they tend to be a bit useless (and a waste of time). You want to get clarity what the product is about: the core audience
See them as 'core context' and 'core usage scenario' with a goal. Don't 'personificate' them to much, but writing everything down as a list of 'core features' and 'non-features' are important.

- Beginner friendly
- Does also complex tagging in a friendly way
- No JOSM/Vespucci where you can shoot yourself in the foot

The core idea is well established, but to execute it is the trick. It takes an insane amount of love and work to get all the details just right. The polishing part is important (sidenote: a frontend framework that is familiar would help the polishing).


### User testing

How is this done with FMC?

What is the timeline? Persona's done in February, some user tests in Framework and some in March.


Tobias will send some recommendations: "rocket surgery made easy"

Do a UI-overhaul for a more consistent UI (with a designer) once the framework is in place. An expert review will yield the same results as user tests; maybe first a cleanup phase.

A11y: more then just for screenreaders and blind people (e.g. high contrast). Low hanging fruit: follow the web standards; start with defining a target.

T: will talk to Heiko what and how much contributions; Tobias might do an expert review of MC (if feasible)

### User Survey

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

### Research: reviews and picture licenses

The images-research sparked two small projects by RTNF (https://altilunium.github.io/mapcompleteimg/ and https://altilunium.github.io/osmimgur/)
