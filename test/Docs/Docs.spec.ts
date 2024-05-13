import { describe, expect, it } from "vitest"
import * as fs from "fs"

describe("Docs", () => {
    describe("bookcases", () => {
        it("bookcases docs should contain basic tags", () => {
            const docs = fs.readFileSync("./Docs/Layers/public_bookcase.md", "utf8")
            const basicTags =
                "<a href='https://wiki.openstreetmap.org/wiki/Key:amenity' target='_blank'>amenity</a>=<a href='https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dpublic_bookcase' target='_blank'>public_bookcase</a>"
            expect(docs).to.contain(basicTags)
            const overpassLink =
                "[Execute on overpass](http://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%5Btimeout%3A90%5D%3B%28%20%20%20%20nwr%5B%22amenity%22%3D%22public_bookcase%22%5D%28%7B%7Bbbox%7D%7D%29%3B%0A%29%3Bout%20body%3B%3E%3Bout%20skel%20qt%3B)"
            expect(docs).to.contain(overpassLink)
        })
    })
})
