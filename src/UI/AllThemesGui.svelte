<script lang="ts">
  import { OsmConnectionFeatureSwitches } from "../Logic/State/FeatureSwitchState";
  import { OsmConnection } from "../Logic/Osm/OsmConnection";
  import { QueryParameters } from "../Logic/Web/QueryParameters";
  import UserRelatedState from "../Logic/State/UserRelatedState";
  import LanguagePicker from "./InputElement/LanguagePicker.svelte";
  import Translations from "./i18n/Translations";
  import Logo from "../assets/svg/Logo.svelte";
  import Tr from "./Base/Tr.svelte";
  import ToSvelte from "./Base/ToSvelte.svelte";
  import MoreScreen from "./BigComponents/MoreScreen";
  import LoginToggle from "./Base/LoginToggle.svelte";
  import Pencil from "../assets/svg/Pencil.svelte";
  import Login from "../assets/svg/Login.svelte";
  import Constants from "../Models/Constants";

  const featureSwitches = new OsmConnectionFeatureSwitches();
  const osmConnection = new OsmConnection({
    fakeUser: featureSwitches.featureSwitchFakeUser.data,
    oauth_token: QueryParameters.GetQueryParameter(
      "oauth_token",
      undefined,
      "Used to complete the login"
    )
  });
  const state = new UserRelatedState(osmConnection);
  const t = Translations.t.index;
  let userLanguages = osmConnection.userDetails.map(ud => ud.languages);
</script>

<div class="flex flex-col m-4">
  <LanguagePicker clss="self-end" assignTo={state.language} availableLanguages={t.title.SupportedLanguages()}
                    preferredLanguages={userLanguages} />

  <div class="flex mt-4">

    <div class="flex-none m-3">
      <Logo alt="MapComplete Logo" class="w-12 h-12 sm:h-24 sm:w-24" />
    </div>

    <div class="flex flex-col">
      <h1 class="tracking-tight font-extrabold md:text-6xl m-0">
        <Tr t={t.title} />
      </h1>
      <Tr cls="my-4 mr-4 text-base font-semibold sm:text-lg md:mt-5 md:text-xl lg:mx-0"
          t={Translations.t.index.intro} />

    </div>

  </div>

  <ToSvelte construct={new MoreScreen(state, true)} />

  <LoginToggle state={state}>
    <div slot="not-logged-in">
      <button class="w-full" on:click={() => osmConnection.AttemptLogin()}>
        <Login class="w-6 h-6 mr-2 "/>
        <Tr t={Translations.t.index.logIn} />
      </button>
    </div>
    <a class="w-full h-fit button" href={window.location.protocol + "//" + window.location.host + "/studio.html"}>
      <Pencil class="w-6 h-6 mr-2" />
      <Tr t={ Translations.t.general.morescreen.createYourOwnTheme} />
    </a>
  </LoginToggle>
  
  <Tr cls="link-underline" t={Translations.t.general.aboutMapComplete.intro}/>
  <div class="subtle self-end mb-16">
    v{Constants.vNumber}
  </div>
</div>

