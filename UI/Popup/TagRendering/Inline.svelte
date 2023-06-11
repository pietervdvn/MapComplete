<script lang="ts">
    import {Utils} from "../../../Utils.js";
    import {UIEventSource} from "../../../Logic/UIEventSource";
    import {onDestroy} from "svelte";
    import {Translation} from "../../i18n/Translation";
    import Locale from "../../i18n/Locale";
    import FromHtml from "../../Base/FromHtml.svelte";

    export let key: string;
    export let tags: UIEventSource<Record<string, string>>;
    let _tags = tags.data;
    onDestroy(tags.addCallbackAndRunD(tags => {
      _tags = tags;
    }));
    
    export let template: Translation;
    let _template: string
    let before: string
    let after: string

    onDestroy(Locale.language.addCallbackAndRunD(l => {
        _template = template.textFor(l)
      if (_template) {
        const splt = _template.split("{" + key + "}")
        before = splt[0]
        after = splt[1]
      }
    }))

    $: {
        _template = template.textFor(Locale.language.data)
        if (_template) {
            const splt = _template.split("{" + key + "}")
            before = splt[0]
            after = splt[1]
        }
    }
</script>

<span>
  <FromHtml src={Utils.SubstituteKeys(before, _tags)}/>
  <slot/>
  <FromHtml src={Utils.SubstituteKeys(after, _tags)}/>
</span>
