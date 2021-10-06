import Wikidata from "../Logic/Web/Wikidata";
import * as assert from "assert";
import {equal} from "assert";
import T from "./TestHelper";
import {Utils} from "../Utils";

export default class WikidataSpecTest extends  T {
    constructor() {
        super("Wikidata",
            [
                ["download wikidata",
                    async () => {

                        Utils.injectJsonDownloadForTests(
                            "https://www.wikidata.org/wiki/Special:EntityData/Q14517013.json" ,
                            {"entities":{"Q14517013":{"pageid":16187848,"ns":0,"title":"Q14517013","lastrevid":1408823680,"modified":"2021-04-26T07:35:01Z","type":"item","id":"Q14517013","labels":{"nl":{"language":"nl","value":"Vredesmolen"},"en":{"language":"en","value":"Peace Mill"}},"descriptions":{"nl":{"language":"nl","value":"molen in West-Vlaanderen"}},"aliases":{},"claims":{"P625":[{"mainsnak":{"snaktype":"value","property":"P625","hash":"d86538f14e8cca00bbf30fb029829aacbc6903a0","datavalue":{"value":{"latitude":50.99444,"longitude":2.92528,"altitude":null,"precision":0.0001,"globe":"http://www.wikidata.org/entity/Q2"},"type":"globecoordinate"},"datatype":"globe-coordinate"},"type":"statement","id":"Q14517013$DBFBFD69-F54D-4C92-A7F4-A44F876E5776","rank":"normal","references":[{"hash":"732ec1c90a6f0694c7db9a71bf09fe7f2b674172","snaks":{"P143":[{"snaktype":"value","property":"P143","hash":"9123b0de1cc9c3954366ba797d598e4e1ea4146f","datavalue":{"value":{"entity-type":"item","numeric-id":10000,"id":"Q10000"},"type":"wikibase-entityid"},"datatype":"wikibase-item"}]},"snaks-order":["P143"]}]}],"P17":[{"mainsnak":{"snaktype":"value","property":"P17","hash":"c2859f311753176d6bdfa7da54ceeeac7acb52c8","datavalue":{"value":{"entity-type":"item","numeric-id":31,"id":"Q31"},"type":"wikibase-entityid"},"datatype":"wikibase-item"},"type":"statement","id":"Q14517013$C12E4DA5-44E1-41ED-BF3D-C84381246429","rank":"normal"}],"P18":[{"mainsnak":{"snaktype":"value","property":"P18","hash":"af765166ecaa7d01ea800812b5b356886b8849a0","datavalue":{"value":"Klerken Vredesmolen R01.jpg","type":"string"},"datatype":"commonsMedia"},"type":"statement","id":"Q14517013$5291801E-11BE-4CE7-8F42-D0D6A120F390","rank":"normal"}],"P2867":[{"mainsnak":{"snaktype":"value","property":"P2867","hash":"b1c627972ba2cc71e3567d2fb56cb5f90dd64007","datavalue":{"value":"893","type":"string"},"datatype":"external-id"},"type":"statement","id":"Q14517013$2aff9dcd-4d24-cd92-b5af-f6268425695f","rank":"normal"}],"P31":[{"mainsnak":{"snaktype":"value","property":"P31","hash":"9b48263bb51c506553aac2281ae331353b5c9002","datavalue":{"value":{"entity-type":"item","numeric-id":38720,"id":"Q38720"},"type":"wikibase-entityid"},"datatype":"wikibase-item"},"type":"statement","id":"Q14517013$46dd9d89-4999-eee6-20a4-c4f6650b1d9c","rank":"normal"},{"mainsnak":{"snaktype":"value","property":"P31","hash":"a1d6f3409c57de0361c68263c9397a99dabe19ea","datavalue":{"value":{"entity-type":"item","numeric-id":3851468,"id":"Q3851468"},"type":"wikibase-entityid"},"datatype":"wikibase-item"},"type":"statement","id":"Q14517013$C83A8B1F-7798-493A-86C9-EC0EFEE356B3","rank":"normal"},{"mainsnak":{"snaktype":"value","property":"P31","hash":"ee5ba9185bdf9f0eb80b52e1cdc70c5883fac95a","datavalue":{"value":{"entity-type":"item","numeric-id":623605,"id":"Q623605"},"type":"wikibase-entityid"},"datatype":"wikibase-item"},"type":"statement","id":"Q14517013$CF74DC2E-6814-4755-9BAD-6EE9FEF637DD","rank":"normal"}],"P2671":[{"mainsnak":{"snaktype":"value","property":"P2671","hash":"83fb38a3c6407f7d0d7bb051d1c31cea8ae26975","datavalue":{"value":"/g/121cb15z","type":"string"},"datatype":"external-id"},"type":"statement","id":"Q14517013$E6FFEF32-0131-42FD-9C66-1A406B68059A","rank":"normal"}]},"sitelinks":{"commonswiki":{"site":"commonswiki","title":"Category:Vredesmolen, Klerken","badges":[],"url":"https://commons.wikimedia.org/wiki/Category:Vredesmolen,_Klerken"},"nlwiki":{"site":"nlwiki","title":"Vredesmolen","badges":[],"url":"https://nl.wikipedia.org/wiki/Vredesmolen"}}}}}
                        )


                        const wdata = await Wikidata.LoadWikidataEntryAsync(14517013)
                        T.isTrue(wdata.wikisites.has("nl"), "dutch for wikisite not found")
                        equal("Vredesmolen", wdata.wikisites.get("nl"))
                    }
                
                ]
            ]);
    }
    
}