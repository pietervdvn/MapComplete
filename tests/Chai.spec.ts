import {describe} from 'mocha'
import {expect} from 'chai'

describe("TestSuite", () => {
    
    describe("function onder test", () => {
        it("should work", () => {
        expect("abc").eq("abc")
        })
    })
})

it("global test", () => {
    expect("abc").eq("abc")
})