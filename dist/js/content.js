/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/tools/cai.ts":
/*!**************************!*\
  !*** ./src/tools/cai.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   fetchHistory: () => (/* binding */ fetchHistory),
/* harmony export */   getRecent: () => (/* binding */ getRecent),
/* harmony export */   getTurn: () => (/* binding */ getTurn)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/tools/utils.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const CAI_OPT = () => ({
    headers: {
        Authorization: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getCAIToken)() || "",
    },
});
function getRecent(charID) {
    return __awaiter(this, void 0, void 0, function* () {
        const chatInfo = yield (yield fetch(`https://neo.character.ai/chats/recent/${charID}`, CAI_OPT())).json();
        return chatInfo;
    });
}
function getTurn(chatID, nextToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const recentHistory = yield (yield fetch(`https://neo.character.ai/turns/${chatID}?next_token=${nextToken}`, CAI_OPT())).json();
        return recentHistory;
    });
}
function fetchHistory(chatId_1) {
    return __awaiter(this, arguments, void 0, function* (chatId, all = false, history = [], nextToken) {
        let chat = yield getTurn(chatId, nextToken);
        history.push(...(0,_utils__WEBPACK_IMPORTED_MODULE_0__.formatHistory)(chat.turns));
        if (all && chat.meta.next_token)
            return fetchHistory(chatId, all, history, chat.meta.next_token);
        return history;
    });
}


/***/ }),

/***/ "./src/tools/cohere.ts":
/*!*****************************!*\
  !*** ./src/tools/cohere.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   COHERE_KEY: () => (/* binding */ COHERE_KEY),
/* harmony export */   MAX_PARTS: () => (/* binding */ MAX_PARTS),
/* harmony export */   generateSummary: () => (/* binding */ generateSummary),
/* harmony export */   getToken: () => (/* binding */ getToken),
/* harmony export */   saveToken: () => (/* binding */ saveToken),
/* harmony export */   validateToken: () => (/* binding */ validateToken)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const COHERE_KEY = "cohere-token";
const MAX_PARTS = 3;
const getHeaders = () => ({
    Authorization: `bearer ${getToken()}`,
    "Content-Type": "application/json",
    Accept: "application/json",
});
function validateToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!token)
            token = localStorage.getItem(COHERE_KEY);
        if (!token)
            return false;
        if (!token || !(yield (yield fetch("https://api.cohere.ai/v1/check-api-key", { headers: Object.assign(Object.assign({}, getHeaders()), { Authorization: `bearer ${token}` }), method: "POST" })).json()).valid) {
            console.log("Invalid API key");
            console.log("Please enter a valid API key");
            return false;
        }
        return true;
    });
}
function saveToken(hook) {
    return __awaiter(this, void 0, void 0, function* () {
        return localStorage.setItem(COHERE_KEY, hook);
    });
}
function getToken() {
    return localStorage.getItem(COHERE_KEY);
}
function generateSummary(text_1) {
    return __awaiter(this, arguments, void 0, function* (text, { parts = 0, history = [], final = [] } = {}, cb) {
        const MAX_TOKEN = 4090;
        let percentage = Math.floor((1 / MAX_PARTS) * 100);
        let templateSummary = `Summarize the ${!parts ? "" : parts == 1 ? `first ${percentage}% of the` : `next ${percentage}% of the`} story from this document, ${parts > 1 ? "START AFTER THE LAST SUMMARY DON'T REPEAT PREVIOUS SUMMARY" : ""} don't make anything up. Only use fact provided by the story. Use third person perspective, Make it into multiple paragraphs. Anything inside * or () is OOC, Out of character. Means, the character didnt actually say it.\nFor example *smile* means the character is smiling:`;
        let preamble = "You are an ordinary man. you happened to like an interesting story\n\nYou got a job to summarize a story with the provided requirements without any questions";
        console.log("Request to cohere ai");
        let docs = [
            {
                title: "Story",
                text,
            },
        ];
        if (cb)
            cb(parts);
        let summary = yield (yield fetch("https://api.cohere.ai/v1/chat", {
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
        })).json();
        console.log("Summary completed");
        final.push({ index: parts, text: summary.text });
        if (parts == null || parts == 0 || parts >= MAX_PARTS)
            return final;
        return yield generateSummary(text, { parts: parts + 1, history: summary.chat_history, final }, cb);
    });
}


/***/ }),

/***/ "./src/tools/utils.ts":
/*!****************************!*\
  !*** ./src/tools/utils.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   formatHistory: () => (/* binding */ formatHistory),
/* harmony export */   formatHistoryResult: () => (/* binding */ formatHistoryResult),
/* harmony export */   getCAIToken: () => (/* binding */ getCAIToken),
/* harmony export */   getCharID: () => (/* binding */ getCharID)
/* harmony export */ });
function getCAIToken() {
    var _a;
    return (_a = document.querySelector("[cai_token]")) === null || _a === void 0 ? void 0 : _a.getAttribute("cai_token");
}
function formatHistory(turns) {
    let res = turns.map((turn) => `[${turn.author.name}]\n<---- BEGIN ---->\n${turn.candidates[0].raw_content}\n<---- END ---->`);
    return res;
}
function getCharID() {
    let char = window.location.pathname.match(/(?<=^\/chat\/).+$/);
    return char && char[0];
}
function formatHistoryResult(history) {
    return history
        .reverse()
        .map((message) => message.replace(/(\[-\])\(#-\s\"Memory:\s.+\"\)/g, ""))
        .join("\n\n");
}


/***/ }),

/***/ "./src/tools/webhook.ts":
/*!******************************!*\
  !*** ./src/tools/webhook.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HOOK_KEY: () => (/* binding */ HOOK_KEY),
/* harmony export */   getHook: () => (/* binding */ getHook),
/* harmony export */   saveHook: () => (/* binding */ saveHook),
/* harmony export */   sendWebhook: () => (/* binding */ sendWebhook),
/* harmony export */   validateHook: () => (/* binding */ validateHook)
/* harmony export */ });
/* harmony import */ var _cohere__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cohere */ "./src/tools/cohere.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

const HOOK_KEY = "webhook-url";
function validateHook(hook) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!hook)
            hook = localStorage.getItem(HOOK_KEY);
        if (!hook)
            return false;
        let regex = /^(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])$/gi;
        if (!regex.test(hook) || new URL(hook).hostname != "discord.com" || !(yield fetch(hook)).ok) {
            console.log("Webhook url is invalid");
            return false;
        }
        return true;
    });
}
function saveHook(hook) {
    return __awaiter(this, void 0, void 0, function* () {
        return localStorage.setItem(HOOK_KEY, hook);
    });
}
function getHook() {
    return localStorage.getItem(HOOK_KEY);
}
function sendWebhook(msg_1) {
    return __awaiter(this, arguments, void 0, function* (msg, { multiples = false, index = 0, max = _cohere__WEBPACK_IMPORTED_MODULE_0__.MAX_PARTS } = {}) {
        let webhookPayload = new FormData();
        const blob = new Blob([msg], { type: "text/plain" });
        let hook = getHook();
        if (!hook)
            throw new Error("Webhook url didn't exist");
        webhookPayload.append("payload_json", JSON.stringify({
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
        }));
        webhookPayload.append("file[0]", blob, `summary${multiples ? `-part-${index}` : ""}.txt`);
        yield fetch(hook, {
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
    });
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!************************!*\
  !*** ./src/content.ts ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _tools_webhook__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./tools/webhook */ "./src/tools/webhook.ts");
/* harmony import */ var _tools_cohere__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./tools/cohere */ "./src/tools/cohere.ts");
/* harmony import */ var _tools_cai__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tools/cai */ "./src/tools/cai.ts");
/* harmony import */ var _tools_utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./tools/utils */ "./src/tools/utils.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};




const caiTools = document.querySelector(".cai_tools");
const cBody = document.querySelector(".cait-body");
const outerCait = document.querySelector(".cai_tools-cont");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
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
        (_a = hookModal.querySelector(".x-svg")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", closeHookModal);
        hookModal.addEventListener("click", (e) => e.target == hookModal && closeHookModal());
        (_b = hookModal.querySelector("#caitHookSave")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            let input = hookModal.querySelector("#caitHookInput");
            (0,_tools_webhook__WEBPACK_IMPORTED_MODULE_0__.saveHook)(input.value);
            closeHookModal();
        }));
        list.append(hookBtn, cohereBtn, sumBtn);
        cBody === null || cBody === void 0 ? void 0 : cBody.append(head, list);
        document.body.append(hookModal);
        function closeHookModal() {
            hookModal.classList.remove("active");
        }
        function openHookModal() {
            return __awaiter(this, void 0, void 0, function* () {
                closeTools();
                hookModal.classList.add("active");
                let hookBody = hookModal.querySelector(".cait_addons-body");
                if (!hookBody)
                    return;
                hookBody.innerHTML = `
        <label for="caitHookInput">Webhook URL</label>
        <textarea id="caitHookInput" class="text-input" data-cait="hookInput" style="width:100%;resize:vertical;" row="5">${(0,_tools_webhook__WEBPACK_IMPORTED_MODULE_0__.getHook)()}</textarea>
        <div style="${(yield (0,_tools_webhook__WEBPACK_IMPORTED_MODULE_0__.validateHook)()) ? "display:none;" : ""} color: var(--btn-danger);">Invalid webhook, please enter a valid discord webhook url</div>
        
`;
            });
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
        (_c = cohereModal.querySelector(".x-svg")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", closeCohereModal);
        cohereModal.addEventListener("click", (e) => e.target == cohereModal && closeCohereModal());
        (_d = cohereModal.querySelector("#caitCohereSave")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            let input = cohereModal.querySelector("#caitCohereInput");
            let isValid = yield (0,_tools_cohere__WEBPACK_IMPORTED_MODULE_1__.validateToken)(input.value);
            if (!isValid)
                return alert("Invalid cohere token. try again.");
            (0,_tools_cohere__WEBPACK_IMPORTED_MODULE_1__.saveToken)(input.value);
            closeCohereModal();
        }));
        document.body.append(cohereModal);
        function closeCohereModal() {
            cohereModal.classList.remove("active");
        }
        function openCohereModal() {
            return __awaiter(this, void 0, void 0, function* () {
                closeTools();
                cohereModal.classList.add("active");
                let hookBody = cohereModal.querySelector(".cait_addons-body");
                if (!hookBody)
                    return;
                hookBody.innerHTML = `
        <label for="caitCohereInput">Cohere API Key</label>
        <textarea id="caitCohereInput" class="text-input" data-cait="cohereInput" style="width:100%;resize:vertical;" row="5">${(0,_tools_cohere__WEBPACK_IMPORTED_MODULE_1__.getToken)()}</textarea>
        <div style="${(yield (0,_tools_cohere__WEBPACK_IMPORTED_MODULE_1__.validateToken)()) ? "display:none;" : ""} color: var(--btn-danger);">Invalid cohere ai TOKEN</div>
`;
            });
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
        (_e = summaryModal.querySelector(".x-svg")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", closeSumModal);
        summaryModal.addEventListener("click", (e) => e.target == summaryModal && closeSumModal());
        (_f = summaryModal.querySelector("#caitSumSubmit")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
            // closeSumModal();
            let submitBtn = e.target;
            let webhookBtn = document.querySelector("#caitSendHook");
            let doneSumBtn = document.querySelector("#caitDoneSum");
            let copySumBtn = document.querySelector("#caitCopySum");
            let hookBody = summaryModal.querySelector(".cait_addons-body");
            submitBtn.disabled = true;
            submitBtn.innerText = "Fetching chat data...";
            let charId = (0,_tools_utils__WEBPACK_IMPORTED_MODULE_3__.getCharID)();
            let chatInfo = yield (0,_tools_cai__WEBPACK_IMPORTED_MODULE_2__.getRecent)(charId);
            submitBtn.innerText = "Fetching turns...";
            let limit = hookBody.querySelector("#caitFetchAllInput").checked;
            let history = yield (0,_tools_cai__WEBPACK_IMPORTED_MODULE_2__.fetchHistory)(chatInfo.chats[0].chat_id, limit);
            console.log(history);
            submitBtn.innerText = "Generating Summaries...";
            let parts = hookBody.querySelector("#caitMultipleInput").checked;
            let summaries = yield (0,_tools_cohere__WEBPACK_IMPORTED_MODULE_1__.generateSummary)((0,_tools_utils__WEBPACK_IMPORTED_MODULE_3__.formatHistoryResult)(history), { parts: parts ? 1 : 0 }, (i) => {
                if (!limit)
                    return;
                submitBtn.innerText = `Generating Summaries... (${i}/${_tools_cohere__WEBPACK_IMPORTED_MODULE_1__.MAX_PARTS})`;
            });
            hookBody.innerHTML =
                hookBody.innerHTML +
                    `
            <label>Result</label>
            <button id="caitCopyHistory" style="background-color: var(--btn-primary); margin-right: auto; padding: .25rem 1rem;" class="btn">Copy History</button>
            <p class="text-input" style="height:10rem;padding-block:.5rem;">${summaries.map((e) => e.text).join("<br/><br/>")}</p>
        `;
            let copyHisBtn = document.querySelector("#caitCopyHistory");
            submitBtn.disabled = true;
            submitBtn.innerText = "completed...";
            webhookBtn.style.display = "block";
            copySumBtn.style.display = "block";
            doneSumBtn.style.display = "block";
            doneSumBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                cleanUp();
                closeSumModal();
            }), { once: true });
            copyHisBtn.addEventListener("click", copyHistoryToClipboard);
            copySumBtn.addEventListener("click", copyToClipboard);
            function copyHistoryToClipboard(e) {
                return __awaiter(this, void 0, void 0, function* () {
                    copyHisBtn.disabled = true;
                    copyHisBtn.innerText = "Copied...";
                    setTimeout(() => {
                        copyHisBtn.innerText = "Copy History";
                        copyHisBtn.disabled = false;
                    }, 3000);
                    yield navigator.clipboard.writeText(history.join("\n\n"));
                });
            }
            function copyToClipboard(e) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield navigator.clipboard.writeText(summaries.map((e) => e.text).join("\n\n"));
                    copySumBtn.disabled = true;
                    copySumBtn.innerText = "Copied...";
                    setTimeout(() => {
                        copySumBtn.innerText = "Copy";
                        copySumBtn.disabled = false;
                    }, 3000);
                });
            }
            webhookBtn.addEventListener("click", (e) => __awaiter(this, void 0, void 0, function* () {
                webhookBtn.innerText = "Sending webhook...";
                webhookBtn.disabled = true;
                for (let data of summaries) {
                    yield (0,_tools_webhook__WEBPACK_IMPORTED_MODULE_0__.sendWebhook)(data.text, { index: data.index, max: _tools_cohere__WEBPACK_IMPORTED_MODULE_1__.MAX_PARTS, multiples: parts });
                }
                //Clean up
                cleanUp();
                closeSumModal();
            }), { once: true });
            function cleanUp() {
                webhookBtn.style.display = "none";
                doneSumBtn.style.display = "none";
                copySumBtn.style.display = "none";
                submitBtn.innerText = "Generate";
                webhookBtn.innerText = "Send Webhook";
                submitBtn.disabled = false;
                webhookBtn.disabled = false;
                copySumBtn.removeEventListener("click", copyToClipboard);
                copyHisBtn.removeEventListener("click", copyHistoryToClipboard);
            }
        }));
        document.body.append(summaryModal);
        function closeSumModal() {
            summaryModal.classList.remove("active");
        }
        function openSumModal() {
            return __awaiter(this, void 0, void 0, function* () {
                closeTools();
                let btn = summaryModal.querySelector("#caitSumSubmit");
                let tokenValid = yield (0,_tools_cohere__WEBPACK_IMPORTED_MODULE_1__.validateToken)();
                if (!tokenValid)
                    btn.classList.add("disabled");
                btn.disabled = !tokenValid;
                summaryModal.classList.add("active");
                let hookBody = summaryModal.querySelector(".cait_addons-body");
                if (!hookBody)
                    return;
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
            });
        }
        function closeTools() {
            outerCait.classList.remove("active");
        }
    });
}
main();

/******/ })()
;
//# sourceMappingURL=content.js.map