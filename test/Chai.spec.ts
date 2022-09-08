import { describe } from "mocha"
import { expect } from "chai"

describe("TestSuite", () => {
    describe("function under test", () => {
        it("should work", () => {
            expect("abc").eq("abc")
        })
    })
})

it("global test", async () => {
    expect("abc").eq("abc")
    expect(() => {
        throw "hi"
    }).throws(/hi/)
})
