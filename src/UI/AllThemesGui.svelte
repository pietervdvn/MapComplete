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
  import { Utils } from "../Utils"
  import { ArrowTrendingUp } from "@babeard/svelte-heroicons/solid/ArrowTrendingUp"
  import Searchbar from "./Base/Searchbar.svelte"
  import ThemeSearch, { ThemeSearchIndex } from "../Logic/Search/ThemeSearch"
  import SearchUtils from "../Logic/Search/SearchUtils"
  import ChevronDoubleRight from "@babeard/svelte-heroicons/mini/ChevronDoubleRight"
  import { AndroidPolyfill } from "../Logic/Web/AndroidPolyfill"
  import Forgejo from "../assets/svg/Forgejo.svelte"
  import Locale from "./i18n/Locale"
  import DrawerLeft from "./Base/DrawerLeft.svelte"
  import MenuDrawer from "./BigComponents/MenuDrawer.svelte"
  import { MenuState } from "../Models/MenuState"
  import { MenuIcon } from "@rgossiaux/svelte-heroicons/solid"
  import AccordionSingle from "./Flowbite/AccordionSingle.svelte"

  AndroidPolyfill.init().then(() => console.log("Android polyfill setup completed"))
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
  const guistate = new MenuState(undefined)
  const menuDrawerState = {
    guistate, osmConnection,
    userRelatedState: state,
    featureSwitches: { featureSwitchEnableLogin: new UIEventSource(true) }
  }

  const t = Translations.t.index
  const tu = Translations.t.general
  const tr = Translations.t.general.morescreen

  const recentThemes = state.recentlyVisitedThemes.value.mapD(themes => themes.map(thId => ThemeSearch.officialThemesById.get(thId)))

  let userLanguages = osmConnection.userDetails.map((ud) => ud?.languages ?? [])
  let search: UIEventSource<string | undefined> = new UIEventSource<string>("")
  let searchStable = search.stabilized(100)

  const officialThemes: MinimalThemeInformation[] = ThemeSearch.officialThemes.themes.filter(
    (th) => th.hideFromOverview === false
  )
  const hiddenThemes: MinimalThemeInformation[] = ThemeSearch.officialThemes.themes.filter(
    (th) => th.hideFromOverview === true
  )
  let visitedHiddenThemes: Store<undefined | MinimalThemeInformation[]> =
    UserRelatedState.initDiscoveredHiddenThemes(state.osmConnection).mapD((knownIds) =>
      hiddenThemes.filter(
        (theme) =>
          knownIds.indexOf(theme.id) >= 0 ||
          state.osmConnection.userDetails.data?.name === "Pieter Vander Vennet"
      )
    )

  const customThemes: Store<MinimalThemeInformation[]> = Stores.ListStabilized<string>(
    state.installedUserThemes
  ).mapD((stableIds) => Utils.NoNullInplace(stableIds.map((id) => state.getUnofficialTheme(id))))

  function filtered(themes: Store<MinimalThemeInformation[]>): Store<MinimalThemeInformation[]> {
    const searchIndex = Locale.language.map(language => {
      return new ThemeSearchIndex(language, themes.data)
    }, [themes])


    return searchStable.map(
      (searchTerm) => {
        if (!themes.data) {
          return []
        }
        if (!searchTerm) {
          return themes.data
        }

        const index = searchIndex.data

        return index.search(searchTerm)

      },
      [searchIndex]
    )
  }

  let officialSearched: Store<MinimalThemeInformation[]> = filtered(
    osmConnection.isLoggedIn.map((loggedIn) =>
      loggedIn ? officialThemes : officialThemes.filter((th) => th.id !== "personal")
    )
  )
  let hiddenSearched: Store<MinimalThemeInformation[]> = filtered(visitedHiddenThemes)
  let customSearched: Store<MinimalThemeInformation[]> = filtered(customThemes)

  let searchIsFocussed = new UIEventSource(false)
  document.addEventListener("keydown", function(event) {
    if (event.ctrlKey && event.code === "KeyF") {
      searchIsFocussed.set(true)
      event.preventDefault()
    }
  })

  AndroidPolyfill.onBackButton(
    () => {
      if (searchIsFocussed.data) {
        searchIsFocussed.set(false)
        return true
      }
      return false
    },
    { returnToIndex: new ImmutableStore(false) }
  )

  /**
   * Opens the first search candidate
   */
  function applySearch() {
    const didRedirect = SearchUtils.applySpecialSearch(search.data)
    if (didRedirect) {
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
  <div class="absolute h-screen w-screen bg-white top-0 left-0" style="z-index: -1;"></div>

  <div class="h-full overflow-hidden">
    <DrawerLeft shown={guistate.pageStates.menu}>
      <div class="h-screen overflow-y-auto">
        <MenuDrawer onlyLink={true} state={menuDrawerState} />
      </div>
    </DrawerLeft>
  </div>

  <div class="m-4 flex flex-col">
    <div class="w-ful flex justify-between">
      <button on:click={() => guistate.pageStates.menu.set(true)} class="rounded-full m-0 p-2">
        <MenuIcon class="h-6 w-6 cursor-pointer" />
      </button>

      <LanguagePicker
        clss="self-end max-w-full"
        assignTo={state.language}
        availableLanguages={t.title.SupportedLanguages()}
        preferredLanguages={userLanguages}
      />
    </div>

    <div class="mt-4 flex">
      <div class="m-3 flex-none">
        <Logo alt="MapComplete Logo" class="h-12 w-12 sm:h-24 sm:w-24" />
      </div>

      <div class="link-underline flex flex-col w-full">
        <h1 class="m-0 font-extrabold tracking-tight md:text-6xl">
          <Tr t={t.title} />
        </h1>
        <Tr
          cls="mr-4 text-base font-semibold sm:text-lg md:mt-5 md:text-xl lg:mx-0"
          t={Translations.t.index.intro}
        />

        <AccordionSingle>
          <Tr slot="header" t={Translations.t.index.about} />
          <Tr cls="link-underline" t={Translations.t.general.aboutMapComplete.intro} />
          <Tr t={tr.streetcomplete} />
        </AccordionSingle>
      </div>
    </div>

    <LoginToggle {state}>
      {#if $recentThemes.length > 2}
        <div class="my-4">
          <h2>
            <Tr t={Translations.t.index.recentThemes} />
          </h2>
          <ThemesList {state} themes={$recentThemes} onlyIcons />
        </div>
      {/if}
    </LoginToggle>

    <Searchbar
      value={search}
      placeholder={tr.searchForATheme}
      on:search={() => applySearch()}
      autofocus
      isFocused={searchIsFocussed}
    />

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
        <ThemesList
          {search}
          {state}
          themes={$customSearched}
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



    <div class="subtle mb-16 self-end">
      v{Constants.vNumber}
    </div>
  </div>

  <div class="absolute top-0 w-0 h-0" style="margin-left: -10em">
    <MenuDrawer onlyLink={false} state={menuDrawerState} />
  </div>

</main>
