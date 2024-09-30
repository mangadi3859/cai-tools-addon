import { ITurn } from "./cai";

export function getCAIToken() {
    return document.querySelector("[cai_token]")?.getAttribute("cai_token");
}

export function formatHistory(turns: ITurn[]) {
    let res = turns.map((turn) => `[${turn.author.name}]\n<---- BEGIN ---->\n${turn.candidates[0].raw_content}\n<---- END ---->`);
    return res;
}

export function getCharID(): string | null {
    let char = window.location.pathname.match(/(?<=^\/chat\/).+$/);
    return char && char[0];
}

export function formatHistoryResult(history: string[]): string {
    return history
        .reverse()
        .map((message) => message.replace(/(\[-\])\(#-\s\"Memory:\s.+\"\)/g, ""))
        .join("\n\n");
}
