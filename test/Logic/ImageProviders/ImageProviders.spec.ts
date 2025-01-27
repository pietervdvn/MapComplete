import AllImageProviders from "../../../src/Logic/ImageProviders/AllImageProviders"
import { ImmutableStore } from "../../../src/Logic/UIEventSource"
import { Utils } from "../../../src/Utils"
import { describe, expect, it } from "vitest"

describe("ImageProviders", () => {
    it("should work on a variaty of inputs", async () => {
        let i = 0

        Utils.injectJsonDownloadForTests(
            "https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&format=json&&origin=*&cmtitle=Category%3AStatue%20of%20Jacob%20van%20Artevelde%20in%20Ghent",
            {
                batchcomplete: "",
                continue: {
                    cmcontinue:
                        "file|42454c4749554d2050484f544f4752415048532054414b454e204f4e20323032322d31312d31332c203230323220494e204748454e542c20535441545545204f46204a41434f422056414e204152544556454c444520494e204748454e542c204e4f56454d42455220323032322e4a5047|125708690",
                    continue: "-||",
                },
                query: {
                    categorymembers: [
                        {
                            pageid: 16728439,
                            ns: 6,
                            title: "File:11-04 Gand 180 monument Jakob Van Artevelde.jpg",
                        },
                        { pageid: 14880931, ns: 6, title: "File:20110410 Gent (0093).jpg" },
                        {
                            pageid: 43077848,
                            ns: 6,
                            title: "File:A popular history of France - from the earliest times (1870) (14780815522).jpg",
                        },
                        {
                            pageid: 142473675,
                            ns: 6,
                            title: "File:AD 2023 - Gent - Palestina Honor -.jpg",
                        },
                        {
                            pageid: 74373723,
                            ns: 6,
                            title: "File:Beeld van Jacob van Artevelde.jpg",
                        },
                        {
                            pageid: 70573574,
                            ns: 6,
                            title: "File:Belgique - Gand - Statue de Jacques van Artevelde - 01.jpg",
                        },
                        {
                            pageid: 70573575,
                            ns: 6,
                            title: "File:Belgique - Gand - Statue de Jacques van Artevelde - 02.jpg",
                        },
                        {
                            pageid: 70574535,
                            ns: 6,
                            title: "File:Belgique - Gand - Statue de Jacques van Artevelde - 03.jpg",
                        },
                        {
                            pageid: 70574536,
                            ns: 6,
                            title: "File:Belgique - Gand - Statue de Jacques van Artevelde - 04.jpg",
                        },
                        {
                            pageid: 125708691,
                            ns: 6,
                            title: "File:Belgium photographs taken on 2022-11-13, 2022 in Ghent, Statue of Jacob van Artevelde in Ghent by Pieter De Vigne.jpg",
                        },
                    ],
                },
            }
        )

        async function expects(
            urls: string | string[],
            tags: Record<string, string>,
            providerName: string = undefined
        ) {
            tags.id = "test/" + i
            i++
            if (!Array.isArray(urls)) {
                urls = [urls]
            }
            const images = await AllImageProviders.loadImagesFor(
                new ImmutableStore(tags)
            ).AsPromise((imgs) => imgs !== undefined && imgs.length > 0)
            console.log("ImageProvider test", tags.id, "for", tags)
            const imageSources = images.map((i) => i.url)
            expect(images, "no images returned").not.empty
            for (const url of urls) {
                if (imageSources.indexOf(url) < 0) {
                    expect.fail(
                        "Image " + url + " not found.\n\tTry one of:" + imageSources.join("\n\t")
                    )
                }
            }
            if (providerName) {
                expect(providerName).toEqual(images[0].provider.constructor.name)
            }
            console.log("OK")
        }

        const muntpoort_expected =
            "https://commons.wikimedia.org/wiki/Special:FilePath/File%3ABr%C3%BCgge-Muntpoort_6-29510-58192.jpg?width=500&height=400"
        await expects(
            muntpoort_expected,
            {
                wikimedia_commons: "File:Brügge-Muntpoort_6-29510-58192.jpg",
            },
            "WikimediaImageProvider"
        )

        await expects(
            muntpoort_expected,
            {
                wikimedia_commons:
                    "https://upload.wikimedia.org/wikipedia/commons/c/cd/Br%C3%BCgge-Muntpoort_6-29510-58192.jpg",
            },
            "WikimediaImageProvider"
        )

        await expects(
            muntpoort_expected,
            {
                image: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Br%C3%BCgge-Muntpoort_6-29510-58192.jpg",
            },
            "WikimediaImageProvider"
        )

        await expects(
            "https://commons.wikimedia.org/wiki/Special:FilePath/File%3ABelgium-5955_-_Simon_Stevin_(13746657193).jpg?width=500&height=400",
            {
                image: "File:Belgium-5955_-_Simon_Stevin_(13746657193).jpg",
            },
            "WikimediaImageProvider"
        )

        await expects(
            "https://commons.wikimedia.org/wiki/Special:FilePath/File%3ABelgium-5955_-_Simon_Stevin_(13746657193).jpg?width=500&height=400",
            {
                wikimedia_commons: "File:Belgium-5955_-_Simon_Stevin_(13746657193).jpg",
            },
            "WikimediaImageProvider"
        )

        await expects(
            "https://commons.wikimedia.org/wiki/Special:FilePath/File%3ABrugge_Leeuwstraat_zonder_nummer_Leeuwbrug_-_119334_-_onroerenderfgoed.jpg?width=500&height=400",
            {
                image: "File:Brugge_Leeuwstraat_zonder_nummer_Leeuwbrug_-_119334_-_onroerenderfgoed.jpg",
            },
            "WikimediaImageProvider"
        )

        await expects(
            "https://commons.wikimedia.org/wiki/Special:FilePath/File%3APapageno_Jef_Claerhout.jpg?width=500&height=400",
            {
                wikimedia_commons: "File:Papageno_Jef_Claerhout.jpg",
            },
            "WikimediaImageProvider"
        )

        Utils.injectJsonDownloadForTests(
            "https://graph.mapillary.com/196804715753265?fields=thumb_1024_url,thumb_original_url,captured_at,compass_angle,geometry,creator&access_token=MLY|4441509239301885|b40ad2d3ea105435bd40c7e76993ae85",
            {
                thumb_1024_url:
                    "https://scontent-bru2-1.xx.fbcdn.net/m1/v/t6/An8HQ3DrfU76tWMC602spvM_e_rqOHyiUcYUTetXM7K52DDBEY5J4FWg4WKQqVUlMsWJn4nLXk0pxlBLx31146FqZ2Kg65z7lJUfR6wpW6WPSR5_y7RKdv4YEuzPjwIN0lagBnQONV3UjmXnEGpMouU?stp=s1024x768&ccb=10-5&oh=d460b401c505714ee1cb8bd6baf8ae5d&oe=61731FC3&_nc_sid=122ab1",
                thumb_original_url:
                    "https://scontent-bru2-1.xx.fbcdn.net/m1/v/t6/Alorup_ipsumMC602spvM_e_rqOHyiUcYUTetXM7K52DDBEY5J4FWg4WKQqVUlMsWJn4nLXk0pxlBLx31146FqZ2Kg65z7lJUfR6wpW6WPSR5_y7RKdv4YEuzPjwIN0lagBnQONV3UjmXnEGpMouU?stp=s1024x768&ccb=10-5&oh=d460b401c505714ee1cb8bd6baf8ae5d&oe=61731FC3&_nc_sid=122ab1",

                id: "196804715753265",
                captured_at: 1627748022000,
                compass_angle: 0,
                geometry: {
                    type: "Point",
                    coordinates: [3.2153751999722, 51.215653199972],
                },
                creator: {
                    username: "filipc",
                    id: "109372117958792",
                },
            }
        )

        await expects(
            "https://scontent-bru2-1.xx.fbcdn.net/m1/v/t6/An8HQ3DrfU76tWMC602spvM_e_rqOHyiUcYUTetXM7K52DDBEY5J4FWg4WKQqVUlMsWJn4nLXk0pxlBLx31146FqZ2Kg65z7lJUfR6wpW6WPSR5_y7RKdv4YEuzPjwIN0lagBnQONV3UjmXnEGpMouU?stp=s1024x768&ccb=10-5&oh=d460b401c505714ee1cb8bd6baf8ae5d&oe=61731FC3&_nc_sid=122ab1",
            {
                mapillary: "https://www.mapillary.com/app/?pKey=196804715753265",
            }
        )
        await expects(
            "https://commons.wikimedia.org/wiki/Special:FilePath/File%3A11-04%20Gand%20180%20monument%20Jakob%20Van%20Artevelde.jpg?width=500&height=400",
            { wikimedia_commons: "Category:Statue of Jacob van Artevelde in Ghent" }
        )
    })
})
