export const ALPHANUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function _provisionNewID(): string {
    let id = "";

    for (let i = 0; i < 16; i++) {
        id += Math.floor(Math.random() * 16).toString(16);
    }

    return id;
}

export type KatexRenderer = (latex: string) => string;
