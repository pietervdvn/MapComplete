<script lang="ts">
  import { OsmConnectionFeatureSwitches } from "../Logic/State/FeatureSwitchState"
  import { OsmConnection } from "../Logic/Osm/OsmConnection"
  import { QueryParameters } from "../Logic/Web/QueryParameters"
  import UserRelatedState from "../Logic/State/UserRelatedState"
  import LanguagePicker from "./InputElement/LanguagePicker.svelte"
  import Translations from "./i18n/Translations"
  import Logo from "../assets/svg/Logo.svelte"
  import Tr from "./Base/Tr.svelte"
  import ToSvelte from "./Base/ToSvelte.svelte"
  import MoreScreen from "./BigComponents/MoreScreen"
  import LoginToggle from "./Base/LoginToggle.svelte"
  import Pencil from "../assets/svg/Pencil.svelte"
  import Login from "../assets/svg/Login.svelte"
  import Constants from "../Models/Constants"

  const featureSwitches = new OsmConnectionFeatureSwitches()
  const osmConnection = new OsmConnection({
    fakeUser: featureSwitches.featureSwitchFakeUser.data,
    oauth_token: QueryParameters.GetQueryParameter(
      "oauth_token",
      undefined,
      "Used to complete the login"
    ),
  })
  const state = new UserRelatedState(osmConnection)
  const t = Translations.t.index
  let userLanguages = osmConnection.userDetails.map((ud) => ud.languages)
</script>

<div class="m-4 flex flex-col">
  <LanguagePicker
    clss="self-end"
    assignTo={state.language}
    availableLanguages={t.title.SupportedLanguages()}
    preferredLanguages={userLanguages}
  />

  <div class="mt-4 flex">
    <div class="m-3 flex-none">
      <Logo alt="MapComplete Logo" class="h-12 w-12 sm:h-24 sm:w-24" />
    </div>

    <div class="flex flex-col">
      <h1 class="m-0 font-extrabold tracking-tight md:text-6xl">
        <Tr t={t.title} />
      </h1>
      <Tr
        cls="my-4 mr-4 text-base font-semibold sm:text-lg md:mt-5 md:text-xl lg:mx-0"
        t={Translations.t.index.intro}
      />
    </div>
  </div>

  <ToSvelte construct={new MoreScreen(state, true)} />

  <LoginToggle {state}>
    <div slot="not-logged-in">
      <button class="w-full" on:click={() => osmConnection.AttemptLogin()}>
        <Login class="mr-2 h-6 w-6 " />
        <Tr t={Translations.t.index.logIn} />
      </button>
    </div>
    <a
      class="button h-fit w-full"
      href={window.location.protocol + "//" + window.location.host + "/studio.html"}
    >
      <Pencil class="mr-2 h-6 w-6" />
      <Tr t={Translations.t.general.morescreen.createYourOwnTheme} />
    </a>
  </LoginToggle>

  <Tr cls="link-underline" t={Translations.t.general.aboutMapComplete.intro} />
  <div class="subtle mb-16 self-end">
    v{Constants.vNumber}
  </div>
</div>
