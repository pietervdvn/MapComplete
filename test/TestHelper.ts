
export default class T {
    
    constructor(testsuite: string, tests: [string, () => void ][]) {
        let failures : string []= [];
        for (const [name, test] of tests) {
            try {
                test();
            } catch (e) {
                failures.push(name);
                console.warn("Failed test: ", name, "because", e);
            }
        }
        if (failures.length == 0) {
            console.log(`All tests of ${testsuite} done!`)
        } else {
            console.warn(failures.length, `tests of ${testsuite} failed :(`)
            console.log("Failed tests: ", failures.join(","))
        }
    }

    static assertContains(needle: string, actual: string){
        if(actual.indexOf(needle) < 0){
            throw `The substring ${needle} was not found`
        }
    }

    static isTrue(b: boolean, msg: string) {
        if(!b){
            throw "Expected true, but got false: "+msg
        }
    }
}
