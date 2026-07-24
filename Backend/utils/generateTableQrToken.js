import { customAlphabet } from "nanoid";

const generateSecureToken = customAlphabet(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    12
);

function generateQrToken() {
    return `TBL_${generateSecureToken()}`; // e.g. TBL_a8F3eK9pQ2rT
}

export { generateQrToken };