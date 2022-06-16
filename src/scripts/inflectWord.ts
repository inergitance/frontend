export function inflect_word(amount: number, variants: string[]): string{
    if(variants.length === 0 || (typeof variants.length === "undefined" )) return "";
    if(variants.length === 1) return variants[0];
    return (Math.abs(amount) === 1) ? variants[0] : variants[1];
}
