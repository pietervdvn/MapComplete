import AllImageProviders from "../../../src/Logic/ImageProviders/AllImageProviders"
import { UIEventSource } from "../../../src/Logic/UIEventSource"
import { Utils } from "../../../src/Utils"
import { describe, expect, it } from "vitest"

describe("ImageProviders", () => {
    it("should work on a variaty of inputs", () => {
        let i = 0
        function expects(url, tags, providerName = undefined) {
            tags.id = "test/" + i
            i++
            AllImageProviders.LoadImagesFor(new UIEventSource(tags)).addCallbackD((images) => {
                console.log("ImageProvider test", tags.id, "for", tags)
                const img = images[0]
                if (img === undefined) {
                    throw "No image found"
                }
                expect(img.url).toEqual(url)
                if (providerName) {
                    expect(providerName).toEqual(img.provider.constructor.name)
                }
                console.log("OK")
            })
        }

        const muntpoort_expected =
            "https://commons.wikimedia.org/wiki/Special:FilePath/File%3ABr%C3%BCgge-Muntpoort_6-29510-58192.jpg?width=500&height=400"
        expects(
            muntpoort_expected,
            {
                wikimedia_commons: "File:Brügge-Muntpoort_6-29510-58192.jpg",
            },
            "WikimediaImageProvider"
        )

        expects(
            muntpoort_expected,
            {
                wikimedia_commons:
                    "https://upload.wikimedia.org/wikipedia/commons/c/cd/Br%C3%BCgge-Muntpoort_6-29510-58192.jpg",
            },
            "WikimediaImageProvider"
        )

        expects(
            muntpoort_expected,
            {
                image: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Br%C3%BCgge-Muntpoort_6-29510-58192.jpg",
            },
            "WikimediaImageProvider"
        )

        expects(
            "https://commons.wikimedia.org/wiki/Special:FilePath/File%3ABelgium-5955_-_Simon_Stevin_(13746657193).jpg?width=500&height=400",
            {
                image: "File:Belgium-5955_-_Simon_Stevin_(13746657193).jpg",
            },
            "WikimediaImageProvider"
        )

        expects(
            "https://commons.wikimedia.org/wiki/Special:FilePath/File%3ABelgium-5955_-_Simon_Stevin_(13746657193).jpg?width=500&height=400",
            {
                wikimedia_commons: "File:Belgium-5955_-_Simon_Stevin_(13746657193).jpg",
            },
            "WikimediaImageProvider"
        )

        expects(
            "https://commons.wikimedia.org/wiki/Special:FilePath/File%3ABrugge_Leeuwstraat_zonder_nummer_Leeuwbrug_-_119334_-_onroerenderfgoed.jpg?width=500&height=400",
            {
                image: "File:Brugge_Leeuwstraat_zonder_nummer_Leeuwbrug_-_119334_-_onroerenderfgoed.jpg",
            },
            "WikimediaImageProvider"
        )

        expects(
            "https://commons.wikimedia.org/wiki/Special:FilePath/File%3APapageno_Jef_Claerhout.jpg?width=500&height=400",
            {
                wikimedia_commons: "File:Papageno_Jef_Claerhout.jpg",
            },
            "WikimediaImageProvider"
        )

        Utils.injectJsonDownloadForTests(
            "https://graph.mapillary.com/196804715753265?fields=thumb_1024_url,thumb_original_url,captured_at,creator&access_token=MLY|4441509239301885|b40ad2d3ea105435bd40c7e76993ae85",
            {
                thumb_1024_url:
                    "https://scontent-bru2-1.xx.fbcdn.net/m1/v/t6/An8HQ3DrfU76tWMC602spvM_e_rqOHyiUcYUTetXM7K52DDBEY5J4FWg4WKQqVUlMsWJn4nLXk0pxlBLx31146FqZ2Kg65z7lJUfR6wpW6WPSR5_y7RKdv4YEuzPjwIN0lagBnQONV3UjmXnEGpMouU?stp=s1024x768&ccb=10-5&oh=d460b401c505714ee1cb8bd6baf8ae5d&oe=61731FC3&_nc_sid=122ab1",
                thumb_original_url:
                    "https://scontent-bru2-1.xx.fbcdn.net/m1/v/t6/Alorup_ipsumMC602spvM_e_rqOHyiUcYUTetXM7K52DDBEY5J4FWg4WKQqVUlMsWJn4nLXk0pxlBLx31146FqZ2Kg65z7lJUfR6wpW6WPSR5_y7RKdv4YEuzPjwIN0lagBnQONV3UjmXnEGpMouU?stp=s1024x768&ccb=10-5&oh=d460b401c505714ee1cb8bd6baf8ae5d&oe=61731FC3&_nc_sid=122ab1",

                id: "196804715753265",
                captured_at: 1627748022000,
                creator: {
                    username: "filipc",
                    id: "109372117958792",
                },
            }
        )

        expects(
            "https://scontent-bru2-1.xx.fbcdn.net/m1/v/t6/An8HQ3DrfU76tWMC602spvM_e_rqOHyiUcYUTetXM7K52DDBEY5J4FWg4WKQqVUlMsWJn4nLXk0pxlBLx31146FqZ2Kg65z7lJUfR6wpW6WPSR5_y7RKdv4YEuzPjwIN0lagBnQONV3UjmXnEGpMouU?stp=s1024x768&ccb=10-5&oh=d460b401c505714ee1cb8bd6baf8ae5d&oe=61731FC3&_nc_sid=122ab1",
            {
                mapillary: "https://www.mapillary.com/app/?pKey=196804715753265",
            }
        )
    })
})
