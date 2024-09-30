import { getCAIToken, formatHistory } from "./utils";

export interface IChat {
    chat_id: string;
    create_time: string;
    creator_id: string;
    character_id: string;
    state: string;
    type: string;
    visibility: string;
    character_name: string;
    character_avatar_uri: string;
    character_visibility: string;
    character_translations: ICharacterTranslations;
    default_voice_id: string | null;
}

export interface ICharacterTranslations {
    name: Record<string, any>;
}

export type Chats = { chats: IChat[] };

export interface ITurnsResponse {
    turns: ITurn[];
    meta: IMeta;
}

export interface ITurn {
    turn_key: ITurnKey;
    create_time: string;
    last_update_time: string;
    state: string;
    author: IAuthor;
    candidates: ICandidate[];
    primary_candidate_id: string;
}

interface ITurnKey {
    chat_id: string;
    turn_id: string;
}

interface IAuthor {
    author_id: string;
    name: string;
}

interface ICandidate {
    candidate_id: string;
    create_time: string;
    raw_content: string;
    is_final: boolean;
}

interface IMeta {
    next_token: string;
}

const CAI_OPT = () => ({
    headers: {
        Authorization: getCAIToken() || "",
    },
});

export async function getRecent(charID: string): Promise<Chats> {
    const chatInfo = await (await fetch(`https://neo.character.ai/chats/recent/${charID}`, CAI_OPT())).json();
    return chatInfo;
}

export async function getTurn(chatID: string, nextToken?: string): Promise<ITurnsResponse> {
    const recentHistory = await (await fetch(`https://neo.character.ai/turns/${chatID}?next_token=${nextToken}`, CAI_OPT())).json();
    return recentHistory;
}

export async function fetchHistory(chatId: string, all: boolean = false, history: string[] = [], nextToken?: string): Promise<string[]> {
    let chat = await getTurn(chatId, nextToken);
    history.push(...formatHistory(chat.turns));
    if (all && chat.meta.next_token) return fetchHistory(chatId, all, history, chat.meta.next_token);
    return history;
}
