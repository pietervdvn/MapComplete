import { RenderingSpecification, SpecialVisualization } from "./SpecialVisualization"

export default class SpecialVisualisationUtils {
    /**
     * Seeded by 'SpecialVisualisations' when that static class is initialized
     * This is to avoid some pesky circular imports
     */
    public static specialVisualizations: SpecialVisualization[]

    /**
     *
     * For a given string, returns a specification what parts are fixed and what parts are special renderings.
     * Note that _normal_ substitutions are ignored.
     *
     * import SpecialVisualisations from "./SpecialVisualizations"
     *
     * // Return empty list on empty input
     * SpecialVisualisationUtils.specialVisualizations = SpecialVisualisations.specialVisualizations
     * SpecialVisualisationUtils.constructSpecification("") // => []
     *
     * // Simple case
     * SpecialVisualisationUtils.specialVisualizations = SpecialVisualisations.specialVisualizations
     * const oh = SpecialVisualisationUtils.constructSpecification("The opening hours with value {opening_hours} can be seen in the following table: <br/> {opening_hours_table()}")
     * oh[0] // => "The opening hours with value {opening_hours} can be seen in the following table: <br/> "
     * oh[1].func.funcName // => "opening_hours_table"
     *
     * // Advanced cases with commas, braces and newlines should be handled without problem
     * SpecialVisualisationUtils.specialVisualizations = SpecialVisualisations.specialVisualizations
     * const templates = SpecialVisualisationUtils.constructSpecification("{send_email(&LBRACEemail&RBRACE,Broken bicycle pump,Hello&COMMA\n\nWith this email&COMMA I'd like to inform you that the bicycle pump located at https://mapcomplete.org/cyclofix?lat=&LBRACE_lat&RBRACE&lon=&LBRACE_lon&RBRACE&z=18#&LBRACEid&RBRACE is broken.\n\n Kind regards,Report this bicycle pump as broken)}")
     * const templ = <Exclude<RenderingSpecification, string>> templates[0]
     * templ.func.funcName // => "send_email"
     * templ.args[0] = "{email}"
     */
    public static constructSpecification(
        template: string,
        extraMappings: SpecialVisualization[] = []
    ): RenderingSpecification[] {
        if (template === "") {
            return []
        }

        if (template["type"] !== undefined) {
            console.trace(
                "Got a non-expanded template while constructing the specification, it still has a 'special-key':",
                template
            )
            throw "Got a non-expanded template while constructing the specification"
        }
        const allKnownSpecials = extraMappings.concat(
            SpecialVisualisationUtils.specialVisualizations
        )
        for (const knownSpecial of allKnownSpecials) {
            // Note: the '.*?' in the regex reads as 'any character, but in a non-greedy way'
            const matched = template.match(
                new RegExp(`(.*){${knownSpecial.funcName}\\((.*?)\\)(:.*)?}(.*)`, "s")
            )
            if (matched != null) {
                // We found a special component that should be brought to live
                const partBefore = SpecialVisualisationUtils.constructSpecification(
                    matched[1],
                    extraMappings
                )
                const argument =
                    matched[2] /* .trim()  // We don't trim, as spaces might be relevant, e.g. "what is ... of {title()}"*/
                const style = matched[3]?.substring(1) ?? ""
                const partAfter = SpecialVisualisationUtils.constructSpecification(
                    matched[4],
                    extraMappings
                )
                const args = knownSpecial.args.map((arg) => arg.defaultValue ?? "")
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
                    args: args,
                    style: style,
                    func: knownSpecial,
                }
                return [...partBefore, element, ...partAfter]
            }
        }

        // IF we end up here, no changes have to be made - except to remove any resting {}
        return [template]
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
