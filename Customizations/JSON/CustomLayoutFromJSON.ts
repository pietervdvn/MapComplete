import {TagRenderingOptions} from "../TagRenderingOptions";
import {LayerDefinition, Preset} from "../LayerDefinition";
import {Layout} from "../Layout";
import Translation from "../../UI/i18n/Translation";
import {type} from "os";
import Combine from "../../UI/Base/Combine";
import {UIElement} from "../../UI/UIElement";
import {And, Tag, TagsFilter} from "../../Logic/TagsFilter";
import FixedText from "../Questions/FixedText";
import {ImageCarouselWithUploadConstructor} from "../../UI/Image/ImageCarouselWithUpload";


export class CustomLayoutFromJSON {

    public static exampleLayer = {
        id: "bookcase",
        icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzExMzgyIgogICBoZWlnaHQ9IjkwMCIKICAgd2lkdGg9IjkwMCIKICAgdmVyc2lvbj0iMS4wIj4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGExMCI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGRlZnMKICAgICBpZD0iZGVmczExMzg0IiAvPgogIDxnCiAgICAgaWQ9ImxheWVyMSIKICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjkwMTAzMjU4LDAsMCwwLjkwMTAzMjU4LDExMi44NDA1OCwtMS45MDYwMTc3KSI+CiAgICA8ZwogICAgICAgaWQ9ImcxMTQ3NiI+CiAgICAgIDxwYXRoCiAgICAgICAgIGlkPSJwYXRoMTE0NzIiCiAgICAgICAgIHN0eWxlPSJmb250LXN0eWxlOm5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zaXplOjEyMDEuOTI0OTI2NzZweDtmb250LWZhbWlseTonQml0c3RyZWFtIFZlcmEgU2Fucyc7dGV4dC1hbGlnbjpjZW50ZXI7dGV4dC1hbmNob3I6bWlkZGxlO2ZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MXB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICAgIGQ9Ik0gNDc0LjUwODg4LDcxOC4yMjg0MSBIIDMwMy40OTU0NyB2IC0yMi4zMDEzNCBjIC0yLjRlLTQsLTM3Ljk1MTA4IDQuMzAzNTIsLTY4Ljc2MjExIDEyLjkxMTMsLTkyLjQzMzE5IDguNjA3MjgsLTIzLjY3MDMyIDIzLjYzMzUyLC00NS4yODY5NSA0MC42NTMyNCwtNjQuODQ5OTYgMTcuMDE5MTQsLTE5LjU2MjExIDQxLjk4NzM0LC0yNi4zMzI2NCAxMDEuNDU3OTMsLTc1LjYzMDg1IDMxLjY5MDk1LC0yNS44MjIwMyA1NS4yODEzLC03Ny4xNTIzIDU1LjI4MTc1LC05OC42NzE3NCAyLjIxMjMyLC01Ni45MjI0NSAtMTMuOTM5ODMsLTc5LjM0MjIgLTM0LjU2Mjg3LC05OS45NjUyNCAtMjIuNjczNTUsLTE5LjY3NzE3IC02MC42NzAyNywtMzAuMDY5OTggLTkwLjk5ODkyLC0zMC4wNjk5OCAtMjcuNzc5MjEsNi45ZS00IC02OC40NjczNSw4LjA4ODcxIC04Ny43NjY2LDI1LjM3MDQ3IC0yNS45MzgxNywxNy4yODMwOCAtNjUuMjM3NDcsNzMuNzA2MTEgLTU3LjA0Njg3LDEzMC41NDU3NyBsIC0xOTQuNTE2OTQzLDEuNzAyMjIgYyAwLC0xNTcuMjEzOTkgMjkuMzkzNjk5LC0xOTguNjk0NjUgOTkuMDA0MTEzLC0yNjMuMDMwMzIgNjcuMzk3MzksLTU0LjM3NjY0MyAxMjYuNTMxMjgsLTczLjI2ODM2NSAyNDMuODQ3NTcsLTczLjI2ODM2NSA4OS43MTc5MSwwIDE2MS44OTcyOCwxNy44MDI4MSAyMTQuMzI1NTIsNTMuNDA1ODU1IDcxLjIwNzE0LDQ4LjEyNDcyIDEyMi4zMDEwNSwxMTEuMTgzNTQgMTIyLjMwMTA1LDIzMC4xMTI4MSAtNi45ZS00LDQ0LjMyMDgxIC0xOS4xNTI1Myw5MC43ODYzOCAtNDMuMDcyNiwxMjguMzMyOTkgLTE4LjM4OTQ3LDMwLjkwOTM4IC02MC4zNzUxMSw2Ni40NTIzNiAtMTE4LjIxMjM3LDEwNC40MTYyOCAtNDIuODM2MDcsMjUuNzY4NiAtNjYuNjcxOTYsNTMuMTE5MjYgLTc3LjAzOTY0LDcyLjA5NDYgLTEwLjM2ODYzLDE4Ljk3NjAzIC0xNS41NTI3MSw0My43MjI2NyAtMTUuNTUyMjUsNzQuMjM5OTkgeiIgLz4KICAgICAgPHBhdGgKICAgICAgICAgaWQ9InBhdGgxMTQ3NCIKICAgICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MztzdHJva2UtbGluZWNhcDpzcXVhcmU7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1kYXNob2Zmc2V0OjA7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4xMDYzODMsLTUuNTMxOTE0OSkiCiAgICAgICAgIGQ9Im0gNDgyLjM4Mjk4LDg2OS44MDkwMiBhIDk0LjA0MjU1Nyw3My4wMjEyNzggMCAxIDEgLTE4OC4wODUxMSwwIDk0LjA0MjU1Nyw3My4wMjEyNzggMCAxIDEgMTg4LjA4NTExLDAgeiIgLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=",
        title: "Bookcase",
        description: "A small, public cabinet with books. Anyone can leave or take a book",
        minzoom: 12,
        color: "#0000ff",
        overpassTags: "amenity=public_bookcase",
        presets: [
            {
                // icon: optional. Uses the layer icon by default
                // title: optional. Uses the layer title by default
                // description: optional. Uses the layer description by default
                // tags: optional list {k:string, v:string}[]
            }
        ],
        tagRenderings: [
            {
                // If this key is present, then...
                key: "name",
                // Use this string to render
                render: "{name}",
                // One of string, int, nat, float, pfloat, email, phone. Default: string
                type: "string",
                // If it is not known (and no mapping below matches), this question is asked; a textfield is inserted in the rendering above
                question: "Wat is de naam van dit boekenruilkastje?",
                // If a value is added with the textfield, this extra tag is addded. Optional field
                addExtraTags: [{
                    "k": "fixme",
                    "v": "Added with mapcomplete, to be checked"
                }],
                // Alternatively, these tags are shown if they match - even if the key above is not there
                // If unknown, these become a radio button
                mappings: [
                    {
                        if: "noname=yes",
                        then: "Dit boekenruilkastje heeft geen naam"
                    }
                ]
            }
        ]
    }

    public static exampleLayout = {
        name: "bookcases",
        title: "Custom Open bookcases map",
        description: "Welcome to a custom layout",
        language: "en",
        layers: [CustomLayoutFromJSON.exampleLayer],
        startZoom: 12,
        startLat: 0,
        startLon: 0,
        icon: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgaWQ9InN2ZzExMzgyIgogICBoZWlnaHQ9IjkwMCIKICAgd2lkdGg9IjkwMCIKICAgdmVyc2lvbj0iMS4wIj4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGExMCI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgICA8ZGM6dGl0bGU+PC9kYzp0aXRsZT4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGRlZnMKICAgICBpZD0iZGVmczExMzg0IiAvPgogIDxnCiAgICAgaWQ9ImxheWVyMSIKICAgICB0cmFuc2Zvcm09Im1hdHJpeCgwLjkwMTAzMjU4LDAsMCwwLjkwMTAzMjU4LDExMi44NDA1OCwtMS45MDYwMTc3KSI+CiAgICA8ZwogICAgICAgaWQ9ImcxMTQ3NiI+CiAgICAgIDxwYXRoCiAgICAgICAgIGlkPSJwYXRoMTE0NzIiCiAgICAgICAgIHN0eWxlPSJmb250LXN0eWxlOm5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zaXplOjEyMDEuOTI0OTI2NzZweDtmb250LWZhbWlseTonQml0c3RyZWFtIFZlcmEgU2Fucyc7dGV4dC1hbGlnbjpjZW50ZXI7dGV4dC1hbmNob3I6bWlkZGxlO2ZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MXB4O3N0cm9rZS1saW5lY2FwOmJ1dHQ7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgICAgIGQ9Ik0gNDc0LjUwODg4LDcxOC4yMjg0MSBIIDMwMy40OTU0NyB2IC0yMi4zMDEzNCBjIC0yLjRlLTQsLTM3Ljk1MTA4IDQuMzAzNTIsLTY4Ljc2MjExIDEyLjkxMTMsLTkyLjQzMzE5IDguNjA3MjgsLTIzLjY3MDMyIDIzLjYzMzUyLC00NS4yODY5NSA0MC42NTMyNCwtNjQuODQ5OTYgMTcuMDE5MTQsLTE5LjU2MjExIDQxLjk4NzM0LC0yNi4zMzI2NCAxMDEuNDU3OTMsLTc1LjYzMDg1IDMxLjY5MDk1LC0yNS44MjIwMyA1NS4yODEzLC03Ny4xNTIzIDU1LjI4MTc1LC05OC42NzE3NCAyLjIxMjMyLC01Ni45MjI0NSAtMTMuOTM5ODMsLTc5LjM0MjIgLTM0LjU2Mjg3LC05OS45NjUyNCAtMjIuNjczNTUsLTE5LjY3NzE3IC02MC42NzAyNywtMzAuMDY5OTggLTkwLjk5ODkyLC0zMC4wNjk5OCAtMjcuNzc5MjEsNi45ZS00IC02OC40NjczNSw4LjA4ODcxIC04Ny43NjY2LDI1LjM3MDQ3IC0yNS45MzgxNywxNy4yODMwOCAtNjUuMjM3NDcsNzMuNzA2MTEgLTU3LjA0Njg3LDEzMC41NDU3NyBsIC0xOTQuNTE2OTQzLDEuNzAyMjIgYyAwLC0xNTcuMjEzOTkgMjkuMzkzNjk5LC0xOTguNjk0NjUgOTkuMDA0MTEzLC0yNjMuMDMwMzIgNjcuMzk3MzksLTU0LjM3NjY0MyAxMjYuNTMxMjgsLTczLjI2ODM2NSAyNDMuODQ3NTcsLTczLjI2ODM2NSA4OS43MTc5MSwwIDE2MS44OTcyOCwxNy44MDI4MSAyMTQuMzI1NTIsNTMuNDA1ODU1IDcxLjIwNzE0LDQ4LjEyNDcyIDEyMi4zMDEwNSwxMTEuMTgzNTQgMTIyLjMwMTA1LDIzMC4xMTI4MSAtNi45ZS00LDQ0LjMyMDgxIC0xOS4xNTI1Myw5MC43ODYzOCAtNDMuMDcyNiwxMjguMzMyOTkgLTE4LjM4OTQ3LDMwLjkwOTM4IC02MC4zNzUxMSw2Ni40NTIzNiAtMTE4LjIxMjM3LDEwNC40MTYyOCAtNDIuODM2MDcsMjUuNzY4NiAtNjYuNjcxOTYsNTMuMTE5MjYgLTc3LjAzOTY0LDcyLjA5NDYgLTEwLjM2ODYzLDE4Ljk3NjAzIC0xNS41NTI3MSw0My43MjI2NyAtMTUuNTUyMjUsNzQuMjM5OTkgeiIgLz4KICAgICAgPHBhdGgKICAgICAgICAgaWQ9InBhdGgxMTQ3NCIKICAgICAgICAgc3R5bGU9ImZpbGw6IzAwMDAwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MztzdHJva2UtbGluZWNhcDpzcXVhcmU7c3Ryb2tlLWxpbmVqb2luOm1pdGVyO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1kYXNob2Zmc2V0OjA7c3Ryb2tlLW9wYWNpdHk6MSIKICAgICAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4xMDYzODMsLTUuNTMxOTE0OSkiCiAgICAgICAgIGQ9Im0gNDgyLjM4Mjk4LDg2OS44MDkwMiBhIDk0LjA0MjU1Nyw3My4wMjEyNzggMCAxIDEgLTE4OC4wODUxMSwwIDk0LjA0MjU1Nyw3My4wMjEyNzggMCAxIDEgMTg4LjA4NTExLDAgeiIgLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo="
    }


    public static FromQueryParam(layoutFromBase64: string): Layout {
        if(layoutFromBase64 === "test"){
            console.log(btoa(JSON.stringify(CustomLayoutFromJSON.exampleLayout)));
            return CustomLayoutFromJSON.LayoutFromJSON(CustomLayoutFromJSON.exampleLayout);
        }
        const spec = JSON.parse(atob(layoutFromBase64));
        return CustomLayoutFromJSON.LayoutFromJSON(spec);
    }

    private static TagRenderingFromJson(json: any): TagRenderingOptions {

        if (typeof (json) === "string") {
            return new FixedText(json);
        }

        let freeform = undefined;
        if (json.key !== undefined && json.render !== undefined) {
            const type = json.type ?? "text";
            freeform = {
                key: json.key,
                template: json.render.replace("{" + json.key + "}", "$" + type + "$"),
                renderTemplate: json.render,
                extraTags: CustomLayoutFromJSON.TagsFromJson(json.addExtraTags),
            }
        }

        let mappings = undefined;
        if (json.mappings !== undefined) {
            mappings = [];
            for (const mapping of json.mappings) {
                mappings.push({
                    k: new And(CustomLayoutFromJSON.TagsFromJson(mapping.if)), txt: mapping.then
                })
            }
        }

        return new TagRenderingOptions({
            question: json.question,
            freeform: freeform,
            mappings: mappings
        })
    }

    private static PresetFromJson(layout: any, preset: any): Preset {
        const t = CustomLayoutFromJSON.MaybeTranslation;
        const tags = CustomLayoutFromJSON.TagsFromJson;
        return {
            icon: preset.icon ?? layout.icon,
            tags: tags(preset.tags) ?? tags(layout.overpassTags),
            title: t(preset.title) ?? t(layout.title),
            description: t(preset.description) ?? t(layout.description)
        }
    }

    private static StyleFromJson(layout: any, styleJson: any): ((tags) => {
        color: string,
        weight?: number,
        icon: {
            iconUrl: string,
            iconSize: number[],
        },
    }) {
        return (tags) => {
            return {
                color: layout.color,
                weight: 10,
                icon: {
                    iconUrl: layout.icon,
                    iconSize: [40, 40],
                },
            }
        };
    }

    private static TagFromJson(json: any): Tag {
        if (json === undefined) {
            return undefined;
        }
        if (typeof (json) === "string") {
            const kv = json.split("=");
            return new Tag(kv[0].trim(), kv[1].trim());
        }
        return new Tag(json.k.trim(), json.v.trim())
    }

    private static TagsFromJson(json: any): Tag[] {
        if (json === undefined) {
            return undefined;
        }
        if (typeof (json) === "string") {
            return json.split(",").map(CustomLayoutFromJSON.TagFromJson);
        }
        return json.map(CustomLayoutFromJSON.TagFromJson)
    }

    private static LayerFromJson(json: any): LayerDefinition {
        const t = CustomLayoutFromJSON.MaybeTranslation;
        const tr = CustomLayoutFromJSON.TagRenderingFromJson;
        return new LayerDefinition(
            json.id,
            {
                description: t(json.description),
                name: t(json.title),
                icon: json.icon,
                minzoom: json.minzoom,
                title: tr(json.title),
                presets: json.presets.map((preset) => {
                    return CustomLayoutFromJSON.PresetFromJson(json, preset)
                }),
                elementsToShow:
                    [new ImageCarouselWithUploadConstructor()].concat(json.tagRenderings.map(tr)),
                overpassFilter: new And(CustomLayoutFromJSON.TagsFromJson(json.overpassTags)),
                wayHandling: LayerDefinition.WAYHANDLING_CENTER_AND_WAY,
                maxAllowedOverlapPercentage: 0,
                style: CustomLayoutFromJSON.StyleFromJson(json, json.style)
            }
        )
    }


    private static MaybeTranslation(json: any): Translation | string {
        if (json === undefined) {
            return undefined;
        }
        if (typeof (json) === "string") {
            return json;
        }
        return new Translation(json);
    }

    private static LayoutFromJSON(json: any) {
        const t = CustomLayoutFromJSON.MaybeTranslation;
        const layout = new Layout(json.name,
            [json.language],
            t(json.title),
            json.layers.map(CustomLayoutFromJSON.LayerFromJson),
            json.startZoom,
            json.startLat,
            json.startLon,
            new Combine(['<h3>', t(json.title), '</h3><br/>', t(json.description)])
        );
        layout.icon = json.icon;
        return layout;
    }


    public static TagRenderingOptionsFromJson(spec: any): TagRenderingOptions {
        return new TagRenderingOptions(spec);
    }

}