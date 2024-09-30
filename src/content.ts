import { getHook, HOOK_KEY, saveHook, sendWebhook, validateHook } from "./tools/webhook";
import { generateSummary, getToken, MAX_PARTS, saveToken, validateToken } from "./tools/cohere";
import { fetchHistory, getRecent } from "./tools/cai";
import { formatHistoryResult, getCharID } from "./tools/utils";

const caiTools = <HTMLDivElement>document.querySelector(".cai_tools");
const cBody = <HTMLDivElement>document.querySelector(".cait-body");
const outerCait = <HTMLDivElement>document.querySelector(".cai_tools-cont");

async function main() {
    const head = document.createElement("h6");
    const list = document.createElement("ul");
    head.innerText = "Addon";

    const hookBtn = document.createElement("li");
    const cohereBtn = document.createElement("li");
    const sumBtn = document.createElement("li");
    const hookModal = document.createElement("div");
    const cohereModal = document.createElement("div");
    const summaryModal = document.createElement("div");

    hookBtn.innerText = "Webhook";
    cohereBtn.innerText = "Cohere";
    sumBtn.innerText = "Summarize";

    //Webhook
    hookModal.classList.add("cait_addons");
    hookModal.dataset["tool"] = "cai_tools";
    hookModal.innerHTML = `
<div class="cait_addons-cont">
    <div class="cait_addons-header">
        <h3>Webhook Settings</h3><span class="x-svg"></span>
    </div>
    <div class="cait_addons-body" style="display: flex;gap:.5rem;flex-direction:column;">
    </div>
    <div style="justify-content: center;" class="cait_addons-footer">
        <button id="caitHookSave" style="background-color: var(--btn-primary);" class="btn">Save</button>
    </div>
</div>`;

    hookBtn.addEventListener("click", openHookModal);
    hookModal.querySelector(".x-svg")?.addEventListener("click", closeHookModal);
    hookModal.addEventListener("click", (e) => e.target == hookModal && closeHookModal());
    hookModal.querySelector("#caitHookSave")?.addEventListener("click", async (e) => {
        let input = <HTMLTextAreaElement>hookModal.querySelector("#caitHookInput");
        saveHook(input.value);
        closeHookModal();
    });

    list.append(hookBtn, cohereBtn, sumBtn);
    cBody?.append(head, list);
    document.body.append(hookModal);

    function closeHookModal() {
        hookModal.classList.remove("active");
    }

    async function openHookModal() {
        closeTools();
        hookModal.classList.add("active");
        let hookBody = hookModal.querySelector(".cait_addons-body");
        if (!hookBody) return;
        hookBody.innerHTML = `
        <label for="caitHookInput">Webhook URL</label>
        <textarea id="caitHookInput" class="text-input" data-cait="hookInput" style="width:100%;resize:vertical;" row="5">${getHook()}</textarea>
        <div style="${(await validateHook()) ? "display:none;" : ""} color: var(--btn-danger);">Invalid webhook, please enter a valid discord webhook url</div>
        
`;
    }

    //Cohere
    cohereModal.classList.add("cait_addons");
    cohereModal.dataset["tool"] = "cai_tools";
    cohereModal.innerHTML = `
<div class="cait_addons-cont">
    <div class="cait_addons-header">
        <h3>Cohere Settings</h3><span class="x-svg"></span>
    </div>
    <div class="cait_addons-body" style="display: flex;gap:.5rem;flex-direction:column;">
    </div>
    <div style="justify-content: center;" class="cait_addons-footer">
        <button id="caitCohereSave" style="background-color: var(--btn-primary);" class="btn">Save</button>
    </div>
</div>`;

    cohereBtn.addEventListener("click", openCohereModal);
    cohereModal.querySelector(".x-svg")?.addEventListener("click", closeCohereModal);
    cohereModal.addEventListener("click", (e) => e.target == cohereModal && closeCohereModal());
    cohereModal.querySelector("#caitCohereSave")?.addEventListener("click", async (e) => {
        let input = <HTMLTextAreaElement>cohereModal.querySelector("#caitCohereInput");
        let isValid = await validateToken(input.value);
        if (!isValid) return alert("Invalid cohere token. try again.");
        saveToken(input.value);
        closeCohereModal();
    });

    document.body.append(cohereModal);
    function closeCohereModal() {
        cohereModal.classList.remove("active");
    }

    async function openCohereModal() {
        closeTools();
        cohereModal.classList.add("active");
        let hookBody = cohereModal.querySelector(".cait_addons-body");
        if (!hookBody) return;
        hookBody.innerHTML = `
        <label for="caitCohereInput">Cohere API Key</label>
        <textarea id="caitCohereInput" class="text-input" data-cait="cohereInput" style="width:100%;resize:vertical;" row="5">${getToken()}</textarea>
        <div style="${(await validateToken()) ? "display:none;" : ""} color: var(--btn-danger);">Invalid cohere ai TOKEN</div>
`;
    }

    //Summary
    summaryModal.classList.add("cait_addons");
    summaryModal.dataset["tool"] = "cai_tools";
    summaryModal.innerHTML = `
<div class="cait_addons-cont">
    <div class="cait_addons-header">
        <h3>Summary</h3><span class="x-svg"></span>
    </div>
    <div class="cait_addons-body" style="display: flex;gap:.5rem;flex-direction:column;">
    </div>
    <div style="justify-content: start; gap: 1rem;" class="cait_addons-footer">
        <button id="caitSumSubmit" style="background-color: var(--btn-primary);" class="btn">Generate</button>
        <button id="caitSendHook" style="display: none;background-color: var(--btn-primary);" class="btn">Send Webhook</button>
        <button id="caitCopySum" style="display: none;background-color: var(--btn-primary);" class="btn">Copy</button>
        <button id="caitDoneSum" style="display: none;background-color: var(--btn-primary);" class="btn">Done</button>
    </div>
</div>`;

    sumBtn.addEventListener("click", openSumModal);
    summaryModal.querySelector(".x-svg")?.addEventListener("click", closeSumModal);
    summaryModal.addEventListener("click", (e) => e.target == summaryModal && closeSumModal());
    summaryModal.querySelector("#caitSumSubmit")?.addEventListener("click", async (e) => {
        // closeSumModal();
        let submitBtn = <HTMLButtonElement>e.target;
        let webhookBtn = <HTMLButtonElement>document.querySelector("#caitSendHook");
        let doneSumBtn = <HTMLButtonElement>document.querySelector("#caitDoneSum");
        let copySumBtn = <HTMLButtonElement>document.querySelector("#caitCopySum");
        let hookBody = <HTMLDivElement>summaryModal.querySelector(".cait_addons-body");
        submitBtn.disabled = true;

        submitBtn.innerText = "Fetching chat data...";
        let charId = <string>getCharID();
        let chatInfo = await getRecent(charId);

        submitBtn.innerText = "Fetching turns...";
        let limit = (<HTMLInputElement>hookBody.querySelector("#caitFetchAllInput")).checked;
        let history = await fetchHistory(chatInfo.chats[0].chat_id, limit);

        submitBtn.innerText = "Generating Summaries...";
        let parts = (<HTMLInputElement>hookBody.querySelector("#caitMultipleInput")).checked;
        let summaries = await generateSummary(formatHistoryResult(history), { parts: parts ? 1 : 0 }, (i) => {
            if (!limit) return;
            submitBtn.innerText = `Generating Summaries... (${i}/${MAX_PARTS})`;
        });

        hookBody.innerHTML =
            hookBody.innerHTML +
            `
            <label>Result</label>
            <p class="text-input" style="height:10rem;padding-block:.5rem;">${summaries.map((e) => e.text).join("<br/><br/>")}</p>
        `;

        submitBtn.disabled = true;
        submitBtn.innerText = "completed...";
        webhookBtn.style.display = "block";
        copySumBtn.style.display = "block";
        doneSumBtn.style.display = "block";

        doneSumBtn.addEventListener(
            "click",
            async (e) => {
                cleanUp();
                closeSumModal();
            },
            { once: true }
        );
        copySumBtn.addEventListener("click", copyToClipboard, { once: true });
        async function copyToClipboard(e: MouseEvent) {
            await navigator.clipboard.writeText(summaries.map((e) => e.text).join("\n\n"));
            copySumBtn.disabled = true;
            copySumBtn.innerText = "Copied...";
            setTimeout(() => {
                copySumBtn.innerText = "Copy";
                copySumBtn.disabled = false;
            }, 3000);
        }
        webhookBtn.addEventListener(
            "click",
            async (e) => {
                webhookBtn.innerText = "Sending webhook...";
                webhookBtn.disabled = true;
                for (let data of summaries) {
                    await sendWebhook(data.text, { index: data.index, max: MAX_PARTS, multiples: parts });
                }

                //Clean up
                cleanUp();
                closeSumModal();
            },
            { once: true }
        );

        function cleanUp() {
            webhookBtn.style.display = "none";
            doneSumBtn.style.display = "none";
            copySumBtn.style.display = "none";

            submitBtn.innerText = "Generate";
            webhookBtn.innerText = "Send Webhook";
            submitBtn.disabled = false;
            webhookBtn.disabled = false;

            copySumBtn.removeEventListener("click", copyToClipboard);
        }
    });

    document.body.append(summaryModal);
    function closeSumModal() {
        summaryModal.classList.remove("active");
    }

    async function openSumModal() {
        closeTools();
        let btn = <HTMLButtonElement>summaryModal.querySelector("#caitSumSubmit");
        let tokenValid = await validateToken();
        if (!tokenValid) btn.classList.add("disabled");
        btn.disabled = !tokenValid;

        summaryModal.classList.add("active");
        let hookBody = summaryModal.querySelector(".cait_addons-body");
        if (!hookBody) return;
        hookBody.innerHTML = `
        <div style="display:flex;align-items:center;gap:.5rem;">
            <label class="normal" for="caitFetchAllInput">Fetch all message</label>
            <input type="checkbox" id="caitFetchAllInput" data-cait="summaryInput" />
        </div>
        <div style="display:flex;align-items:center;gap:.5rem;">
            <label class="normal" for="caitMultipleInput">Multiple Summaries</label>
            <input type="checkbox" id="caitMultipleInput" data-cait="summaryInput" />
        </div>
        <div style="${tokenValid ? "display:none;" : ""} color: var(--btn-danger);">Invalid cohere ai TOKEN</div>        
`;
    }

    function closeTools() {
        outerCait.classList.remove("active");
    }
}

main();
