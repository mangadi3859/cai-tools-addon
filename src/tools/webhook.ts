import { MAX_PARTS } from "./cohere";

export const HOOK_KEY = "webhook-url";

export async function validateHook(hook?: string): Promise<boolean> {
    if (!hook) hook = <string | undefined>localStorage.getItem(HOOK_KEY);
    if (!hook) return false;

    let regex = /^(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])$/gi;
    if (!regex.test(hook) || new URL(hook).hostname != "discord.com" || !(await fetch(hook)).ok) {
        console.log("Webhook url is invalid");
        return false;
    }

    return true;
}

export async function saveHook(hook: string): Promise<void> {
    return localStorage.setItem(HOOK_KEY, hook);
}

export function getHook() {
    return localStorage.getItem(HOOK_KEY);
}

export async function sendWebhook(msg: string, { multiples = false, index = 0, max = MAX_PARTS } = {}) {
    let webhookPayload = new FormData();
    const blob = new Blob([msg], { type: "text/plain" });
    let hook = getHook();

    if (!hook) throw new Error("Webhook url didn't exist");

    webhookPayload.append(
        "payload_json",
        JSON.stringify({
            embeds: [
                {
                    title: `Chat Summary`,
                    color: 0x98ffbe,
                    author: { name: multiples ? `Part (${index}/${max})` : "" },
                    description: msg.slice(0, 4090),
                    footer: {
                        text: "Cohere AI",
                        icon_url: "https://raw.githubusercontent.com/mangadi3859/random/main/cai/images/cohere.png",
                    },
                    timestamp: new Date().toISOString(),
                },
            ],
            username: "Summary",
        })
    );

    webhookPayload.append("file[0]", blob, `summary${multiples ? `-part-${index}` : ""}.txt`);
    await fetch(hook, {
        headers: {
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
        },
        referrer: "https://discohook.org/",
        referrerPolicy: "strict-origin",
        body: webhookPayload,
        method: "POST",
        mode: "cors",
        credentials: "omit",
    });

    console.log("Completed");
}
