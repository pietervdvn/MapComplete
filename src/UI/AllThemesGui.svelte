<script lang="ts">
  import { OsmConnectionFeatureSwitches } from "../Logic/State/FeatureSwitchState"
  import { OsmConnection } from "../Logic/Osm/OsmConnection"
  import { QueryParameters } from "../Logic/Web/QueryParameters"
  import UserRelatedState from "../Logic/State/UserRelatedState"
  import LanguagePicker from "./InputElement/LanguagePicker.svelte"
  import Translations from "./i18n/Translations"
  import Logo from "../assets/svg/Logo.svelte"
  import Tr from "./Base/Tr.svelte"
  import LoginToggle from "./Base/LoginToggle.svelte"
  import Pencil from "../assets/svg/Pencil.svelte"
  import Constants from "../Models/Constants"
  import { ImmutableStore, Store, Stores, UIEventSource } from "../Logic/UIEventSource"
  import ThemesList from "./BigComponents/ThemesList.svelte"
  import { MinimalThemeInformation } from "../Models/ThemeConfig/ThemeConfig"
  import Eye from "../assets/svg/Eye.svelte"
  import LoginButton from "./Base/LoginButton.svelte"
  import Mastodon from "../assets/svg/Mastodon.svelte"
  import Liberapay from "../assets/svg/Liberapay.svelte"
  import Bug from "../assets/svg/Bug.svelte"
  import Github from "../assets/svg/Github.svelte"
  import { Utils } from "../Utils"
  import { ArrowTrendingUp } from "@babeard/svelte-heroicons/solid/ArrowTrendingUp"
  import Searchbar from "./Base/Searchbar.svelte"
  import ThemeSearch from "../Logic/Search/ThemeSearch"
  import SearchUtils from "../Logic/Search/SearchUtils"
  import ChevronDoubleRight from "@babeard/svelte-heroicons/mini/ChevronDoubleRight"

  const featureSwitches = new OsmConnectionFeatureSwitches()
  const osmConnection = new OsmConnection({
    fakeUser: featureSwitches.featureSwitchFakeUser.data,
    oauth_token: QueryParameters.GetQueryParameter(
      "oauth_token",
      undefined,
      "Used to complete the login"
    )
  })
  const state = new UserRelatedState(osmConnection)
  const t = Translations.t.index
  const tu = Translations.t.general
  const tr = Translations.t.general.morescreen

  let userLanguages = osmConnection.userDetails.map((ud) => ud.languages)
  let search: UIEventSource<string | undefined> = new UIEventSource<string>("")
  let searchStable = search.stabilized(100)

  let searchIsFocused = new UIEventSource(true)

  const officialThemes: MinimalThemeInformation[] = ThemeSearch.officialThemes.themes.filter(th => th.hideFromOverview === false)
  const hiddenThemes: MinimalThemeInformation[] = ThemeSearch.officialThemes.themes.filter(th => th.hideFromOverview === true)
  let visitedHiddenThemes: Store<MinimalThemeInformation[]> = UserRelatedState.initDiscoveredHiddenThemes(state.osmConnection)
    .map((knownIds) => hiddenThemes.filter((theme) =>
      knownIds.indexOf(theme.id) >= 0 || state.osmConnection.userDetails.data.name === "Pieter Vander Vennet"
    ))

  const customThemes: Store<MinimalThemeInformation[]> = Stores.ListStabilized<string>(state.installedUserThemes)
    .mapD(stableIds => Utils.NoNullInplace(stableIds.map(id => state.getUnofficialTheme(id))))
  function filtered(themes: Store<MinimalThemeInformation[]>): Store<MinimalThemeInformation[]> {
    return searchStable.map(search => {
      if (!search) {
        return themes.data
      }

      const start = new Date().getTime()
      const scores = ThemeSearch.sortedByLowestScores(search, themes.data)
      const end = new Date().getTime()
      console.trace("Scores for", search , "are", scores, "searching took", end - start,"ms")
      const strict = scores.filter(sc => sc.lowest < 2)
      if (strict.length > 0) {
        return strict.map(sc => sc.theme)
      }
      return scores.filter(sc => sc.lowest < 4).slice(0, 6).map(sc => sc.theme)
    }, [themes])
  }


  let officialSearched : Store<MinimalThemeInformation[]>= filtered(new ImmutableStore(officialThemes))
  let hiddenSearched: Store<MinimalThemeInformation[]> =  filtered(visitedHiddenThemes)
  let customSearched: Store<MinimalThemeInformation[]> = filtered(customThemes)


  let searchIsFocussed = new UIEventSource(false)
  document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.code === "KeyF") {
      searchIsFocussed.set(true)
      event.preventDefault()
    }
  })

  function applySearch() {
    const didRedirect = SearchUtils.applySpecialSearch(search.data)
    console.log("Did redirect?", didRedirect)
    if (didRedirect) {
      // Just for style and readability; won't _actually_ reach this
      return
    }

    const candidate = officialSearched.data[0] ?? hiddenSearched.data[0] ?? customSearched.data[0]
    if (!candidate) {
      return
    }

    window.location.href = ThemeSearch.createUrlFor(candidate, undefined)

  }


</script>

<main>
  <div class="m-4 flex flex-col">
    <LanguagePicker
      clss="self-end max-w-full"
      assignTo={state.language}
      availableLanguages={t.title.SupportedLanguages()}
      preferredLanguages={userLanguages}
    />

    <div class="mt-4 flex">
      <div class="m-3 flex-none">
        <Logo alt="MapComplete Logo" class="h-12 w-12 sm:h-24 sm:w-24" />
      </div>

      <div class="link-underline flex flex-col">
        <h1 class="m-0 font-extrabold tracking-tight md:text-6xl">
          <Tr t={t.title} />
        </h1>
        <Tr
          cls="mr-4 text-base font-semibold sm:text-lg md:mt-5 md:text-xl lg:mx-0"
          t={Translations.t.index.intro}
        />
        <a href="#about">
          <Tr t={Translations.t.index.learnMore} />
          <ChevronDoubleRight class="inline h-4 w-4" />
        </a>
      </div>
    </div>

    <Searchbar value={search} placeholder={tr.searchForATheme} on:search={() => applySearch()} autofocus isFocused={searchIsFocussed} />

    <ThemesList {search} {state} themes={$officialSearched} />

    <LoginToggle {state}>
      <LoginButton clss="primary" {osmConnection} slot="not-logged-in">
        <Tr t={t.logIn} />
      </LoginButton>
      <ThemesList
        {search}
        {state}
        themes={$hiddenSearched}
        hasSelection={$officialSearched.length === 0}
      >
        <svelte:fragment slot="title">
          <h3>
            <Tr t={tr.previouslyHiddenTitle} />
          </h3>
          <p>
            <Tr
              t={tr.hiddenExplanation.Subs({
                hidden_discovered: $visitedHiddenThemes.length.toString(),
                total_hidden: hiddenThemes.length.toString(),
              })}
            />
          </p>
        </svelte:fragment>
      </ThemesList>

      {#if $customThemes.length > 0}
        <ThemesList {search} {state} themes={$customSearched}
                    hasSelection={$officialSearched.length === 0 && $hiddenSearched.length === 0}
        >
          <svelte:fragment slot="title">
            <h3>
              <Tr t={tu.customThemeTitle} />
            </h3>
            <Tr t={tu.customThemeIntro} />
          </svelte:fragment>
        </ThemesList>
      {/if}

    </LoginToggle>

    <a
      class="button flex"
      href={window.location.protocol + "//" + window.location.host + "/studio.html"}
    >
      <Pencil class="mr-2 h-6 w-6" />
      <Tr t={Translations.t.general.morescreen.createYourOwnTheme} />
    </a>

    <h3 id="about">
      <Tr t={Translations.t.index.about} />
    </h3>
    <Tr cls="link-underline" t={Translations.t.general.aboutMapComplete.intro} />

    <span class="link-underline flex flex-col gap-y-1">
      <a class="flex" href="https://github.com/pietervdvn/MapComplete/" target="_blank">
        <Github class="mr-2 h-6 w-6" />
        <Tr t={Translations.t.general.attribution.gotoSourceCode} />
      </a>
      <a class="flex" href="https://github.com/pietervdvn/MapComplete/issues" target="_blank">
        <Bug class="mr-2 h-6 w-6" />
        <Tr t={Translations.t.general.attribution.openIssueTracker} />
      </a>

      <a class="flex" href={Utils.OsmChaLinkFor(7)} target="_blank">
        <ArrowTrendingUp class="mr-2 h-6 w-6" />
        <Tr t={Translations.t.general.attribution.openOsmchaLastWeek} />
      </a>

      <a class="flex" href="https://en.osm.town/@MapComplete" target="_blank">
        <Mastodon class="mr-2 h-6 w-6" />
        <Tr t={Translations.t.general.attribution.followOnMastodon} />
      </a>

      <a class="flex" href="https://liberapay.com/pietervdvn/" target="_blank">
        <Liberapay class="mr-2 h-6 w-6" />
        <Tr t={Translations.t.general.attribution.donate} />
      </a>

      <a
        class="flex"
        href={window.location.protocol + "//" + window.location.host + "/privacy.html"}
      >
        <Eye class="mr-2 h-6 w-6" />
        <Tr t={Translations.t.privacy.title} />
      </a>
    </span>

    <Tr t={tr.streetcomplete} />

    <div class="subtle mb-16 self-end">
      v{Constants.vNumber}
    </div>
  </div>
</main>
