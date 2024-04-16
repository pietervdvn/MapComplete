import { describe, expect, it } from "vitest"
import LinkedDataLoader from "../../../src/Logic/Web/LinkedDataLoader"

describe("LinkedDataLoader", () => {
    it("should compact a shop entry", async () => {
        const graph = {
            "@context": "http://schema.org",
            "@type": "LocalBusiness",
            "@id": "http://stores.delhaize.be/nl/ad-delhaize-munsterbilzen",
            name: "AD Delhaize Munsterbilzen",
            url: "http://stores.delhaize.be/nl/ad-delhaize-munsterbilzen",
            logo: "https://stores.delhaize.be/build/images/web/shop/delhaize-be/favicon.ico",
            image: "http://stores.delhaize.be/image/mobilosoft-testing?apiPath=rehab/delhaize-be/images/location/ad%20delhaize%20image%20ge%CC%81ne%CC%81rale%20%281%29%201652787176865&imageSize=h_500",
            email: "",
            telephone: "+3289413520",
            address: {
                "@type": "PostalAddress",
                streetAddress: "Waterstraat, 18",
                addressLocality: "Bilzen",
                postalCode: "3740",
                addressCountry: "BE",
            },
            geo: {
                "@type": "GeoCoordinates",
                latitude: 50.8906898,
                longitude: 5.5260586,
            },
            openingHoursSpecification: [
                {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: "Tuesday",
                    opens: "08:00",
                    closes: "18:30",
                },
                {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: "Wednesday",
                    opens: "08:00",
                    closes: "18:30",
                },
                {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: "Thursday",
                    opens: "08:00",
                    closes: "18:30",
                },
                {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: "Friday",
                    opens: "08:00",
                    closes: "18:30",
                },
                {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: "Saturday",
                    opens: "08:00",
                    closes: "18:30",
                },
                {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: "Sunday",
                    opens: "08:00",
                    closes: "12:00",
                },
                {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: "Monday",
                    opens: "12:00",
                    closes: "18:30",
                },
            ],
            "@base": "https://stores.delhaize.be/nl/ad-delhaize-munsterbilzen",
        }
        const compacted = await LinkedDataLoader.compact(graph)
        expect(compacted.phone).equal("+32 89 41 35 20")
    })
})
