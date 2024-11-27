"use strict";
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    switch (request.type) {
        case "download":
            sendResponse(loadedData[request.key]);
            break;
        case "loadHorseInfoAll":
            const loadHorseInfoParam = request.value;
            const horseInfoAll = [];
            await chrome.storage.local.set({ horseInfoAll: horseInfoAll });
            const tabCreatePromises = [];
            for (const param of loadHorseInfoParam) {
                const horseInfo = { num: param.num, pastRaceDataArray: [] };
                tabCreatePromises.push(chrome.tabs.create({ url: param.url, active: false }).then(async (tab) => {
                    await chrome.scripting
                        .executeScript({
                        target: { tabId: tab.id },
                        function: () => {
                            const tbody = document.querySelector("#contents > div.db_main_race.fc > div > table > tbody");
                            const pastRaceDataArray = [];
                            for (const row of tbody.rows) {
                                const pastRaceData = [];
                                for (const cell of row.cells) {
                                    pastRaceData.push(cell.innerText.trim());
                                }
                                pastRaceDataArray.push(pastRaceData);
                            }
                            return pastRaceDataArray;
                        },
                    })
                        .then((injectionResult) => {
                        horseInfo.pastRaceDataArray = injectionResult[0].result;
                        horseInfoAll.push(horseInfo);
                    });
                    chrome.tabs.remove(tab.id);
                }));
            }
            await Promise.allSettled(tabCreatePromises).then(async () => {
                await chrome.storage.local.set({ horseInfoAll: horseInfoAll });
            });
            break;
        default:
            throw new Error(`Unknown type '${request.type}'`);
    }
});
let loadedData = {
    horseInfoAll: [],
};
let netkeibaRaceInfo = {};
chrome.storage.onChanged.addListener((changes, namespace) => {
    switch (namespace) {
        case "local":
            for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
                if (key === "horseInfoAll") {
                    loadedData.horseInfoAll = newValue;
                }
            }
            break;
    }
});
