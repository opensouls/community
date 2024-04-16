export function stripAndTrim(str: string) {
    const index = str.indexOf(':');
    return str.slice(index + 1).trim();
}