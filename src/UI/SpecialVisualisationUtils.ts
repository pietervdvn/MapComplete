import { RenderingSpecification, SpecialVisualization } from "./SpecialVisualization"

export default class SpecialVisualisationUtils {


    /**
     *
     * For a given string, returns a specification what parts are fixed and what parts are special renderings.
     * Note that _normal_ substitutions are ignored.
     *
     * import SpecialVisualisations from "./SpecialVisualizations"
     *
     * // Return empty list on empty input
     * SpecialVisualisationUtils.constructSpecification("", SpecialVisualisations.specialVisualisationsDict) // => []
     *
     * // Simple case
     * const oh = SpecialVisualisationUtils.constructSpecification("The opening hours with value {opening_hours} can be seen in the following table: <br/> {opening_hours_table()}", SpecialVisualisations.specialVisualisationsDict)
     * oh[0] // => "The opening hours with value {opening_hours} can be seen in the following table: <br/> "
     * oh[1].func.funcName // => "opening_hours_table"
     *
     * // Advanced cases with commas, braces and newlines should be handled without problem
     * const templates = SpecialVisualisationUtils.constructSpecification("{send_email(&LBRACEemail&RBRACE,Broken bicycle pump,Hello&COMMA\n\nWith this email&COMMA I'd like to inform you that the bicycle pump located at https://mapcomplete.org/cyclofix?lat=&LBRACE_lat&RBRACE&lon=&LBRACE_lon&RBRACE&z=18#&LBRACEid&RBRACE is broken.\n\n Kind regards,Report this bicycle pump as broken)}",  SpecialVisualisations.specialVisualisationsDict)
     * const templ = <Exclude<RenderingSpecification, string>> templates[0]
     * templ.func.funcName // => "send_email"
     * templ.args[0] = "{email}"
     */
    public static constructSpecification(
        template: string,
        specialVisualisations: Map<string, SpecialVisualization>,
        extraMappings: SpecialVisualization[] = [],
    ): RenderingSpecification[] {
        if (template === "") {
            return []
        }

        if (template["type"] !== undefined) {
            console.trace(
                "Got a non-expanded template while constructing the specification, it still has a 'special-key':",
                template,
            )
            throw "Got a non-expanded template while constructing the specification"
        }

        // Note: the '.*?' in the regex reads as 'any character, but in a non-greedy way'
        const matched = template.match(
            new RegExp(`(.*){\([a-zA-Z_]+\)\\((.*?)\\)(:.*)?}(.*)`, "s"),
        )
        if (matched === null) {
            // IF we end up here, no changes have to be made - except to remove any resting {}
            return [template]
        }

        const fName = matched[2]
        let knownSpecial = specialVisualisations.get(fName)
        if(!knownSpecial && extraMappings?.length > 0){
            knownSpecial = extraMappings.find(em => em.funcName === fName)
        }
        if(!knownSpecial){
            throw "Didn't find a special visualisation: "+fName+" in "+template
        }

        // Always a boring string
        const partBefore: string = matched[1]
        const argument: string =
            matched[3] /* .trim()  // We don't trim, as spaces might be relevant, e.g. "what is ... of {title()}"*/
        const style: string = matched[4]?.substring(1) ?? ""
        const partAfter: RenderingSpecification[] = SpecialVisualisationUtils.constructSpecification(
            matched[5],
            specialVisualisations,
            extraMappings,
        )



        const args: string[] = knownSpecial.args.map((arg) => arg.defaultValue ?? "")
        if (argument.length > 0) {
            const realArgs = argument
                .split(",")
                .map((str) => SpecialVisualisationUtils.undoEncoding(str))
            for (let i = 0; i < realArgs.length; i++) {
                if (args.length <= i) {
                    args.push(realArgs[i])
                } else {
                    args[i] = realArgs[i]
                }
            }
        }

        const element: RenderingSpecification = {
            args,
            style,
            func: knownSpecial,
        }
        partAfter.unshift(element)
        if(partBefore.length > 0){
            partAfter.unshift(partBefore)

        }
        return partAfter

    }

    private static undoEncoding(str: string) {
        return str
            .trim()
            .replace(/&LPARENS/g, "(")
            .replace(/&RPARENS/g, ")")
            .replace(/&LBRACE/g, "{")
            .replace(/&RBRACE/g, "}")
            .replace(/&COMMA/g, ",")
    }
}
