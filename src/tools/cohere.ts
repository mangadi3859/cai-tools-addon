import { Chats, IChat } from "./cai";

export const COHERE_KEY = "cohere-token";
export const MAX_PARTS = 3;

const getHeaders = () => ({
    Authorization: `bearer ${getToken()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
});

interface ICohereSummary {
    text: string;
    generation_id: string;
    citations: ICitation[];
    documents: IDocument[];
    search_queries: ISearchQuery[];
    search_results: ISearchResult[];
    finish_reason: string;
    chat_history: IChatHistory[];
    meta: IMeta;
}

interface ICitation {
    start: number;
    end: number;
    text: string;
    document_ids: string[];
}

interface IDocument {
    id: string;
    snippet: string;
    timestamp: string;
    title: string;
    url: string;
}

interface ISearchQuery {
    text: string;
    generation_id: string;
}

interface ISearchResult {
    connector: IConnector;
    document_ids: string[];
    search_query: ISearchQuery;
}

interface IConnector {
    id: string;
}

interface IChatHistory {
    role: string;
    message: string;
}

interface IMeta {
    api_version: IApiVersion;
    billed_units: IBilledUnits;
    tokens: ITokens;
}

interface IApiVersion {
    version: string;
}

interface IBilledUnits {
    input_tokens: number;
    output_tokens: number;
}

interface ITokens {
    input_tokens: number;
    output_tokens: number;
}

export async function validateToken(token?: string): Promise<boolean> {
    if (!token) token = <string | undefined>localStorage.getItem(COHERE_KEY);
    if (!token) return false;

    if (!token || !(await (await fetch("https://api.cohere.ai/v1/check-api-key", { headers: { ...getHeaders(), Authorization: `bearer ${token}` }, method: "POST" })).json()).valid) {
        console.log("Invalid API key");
        console.log("Please enter a valid API key");
        return false;
    }

    return true;
}

export async function saveToken(hook: string): Promise<void> {
    return localStorage.setItem(COHERE_KEY, hook);
}

export function getToken() {
    return localStorage.getItem(COHERE_KEY);
}

type SummaryOpt = {
    parts?: number;
    history?: IChatHistory[];
    final?: IFormatedSummary[];
};
interface IFormatedSummary {
    text: string;
    index: number;
}

export async function generateSummary(text: string, { parts = 0, history = [], final = [] }: SummaryOpt = {}, cb?: (i: number) => any) {
    const MAX_TOKEN = 4090;
    let percentage = Math.floor((1 / MAX_PARTS) * 100);
    let templateSummary = `Summarize the ${!parts ? "" : parts == 1 ? `first ${percentage}% of the` : `next ${percentage}% of the`} story from this document, ${
        parts > 1 ? "START AFTER THE LAST SUMMARY DON'T REPEAT PREVIOUS SUMMARY" : ""
    } don't make anything up. Only use fact provided by the story. Use third person perspective, Make it into multiple paragraphs. Anything inside * or () is OOC, Out of character. Means, the character didnt actually say it.\nFor example *smile* means the character is smiling:`;
    let preamble = "You are an ordinary man. you happened to like an interesting story\n\nYou got a job to summarize a story with the provided requirements without any questions";

    console.log("Request to cohere ai");
    let docs = [
        {
            title: "Story",
            text,
        },
    ];

    if (cb) cb(parts);
    let summary = <ICohereSummary>await (
        await fetch("https://api.cohere.ai/v1/chat", {
            body: JSON.stringify({
                preamble,
                chat_history: history,
                documents: docs,
                max_tokens: MAX_TOKEN,
                temperature: 0.2,
                message: `${templateSummary}`,
            }),
            method: "POST",
            headers: getHeaders(),
        })
    ).json();

    console.log("Summary completed");
    final.push({ index: parts, text: summary.text });
    if (parts == null || parts == 0 || parts >= MAX_PARTS) return final;
    return await generateSummary(text, { parts: parts + 1, history: summary.chat_history, final }, cb);
}
