export default interface ExtraLinkConfigJson {
    icon?: string,
    text?: string | any,
    href: string,
    newTab?: false | boolean,
    requirements?: ("iframe" | "no-iframe" | "welcome-message" | "no-welcome-message")[]
}