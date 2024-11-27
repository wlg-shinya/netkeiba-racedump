"use strict";
const CHUOH_SHUTUBA_TBODY_QUERY_PATH = "#page > div.RaceColumn02 > div.RaceTableArea > table > tbody";
const CHIHOU_SHUTUBA_TBODY_QUERY_PATH = "#Netkeiba_Race_Nar_Shutuba > div.Wrap.fc > div.RaceColumn02 > div.RaceTableArea.Shutuba_HorseList > table > tbody";
const TBODY_NUM_QUERY_PATH = "td[class*='Umaban']";
const TBODY_URL_QUERY_PATH = ".HorseInfo > div > div > span > a";
function existsElementHorseInfoAll() {
    return _existsElementHorseInfo(CHUOH_SHUTUBA_TBODY_QUERY_PATH) || _existsElementHorseInfo(CHIHOU_SHUTUBA_TBODY_QUERY_PATH);
}
function executeLoadHorseInfoAll() {
    if (_existsElementHorseInfo(CHUOH_SHUTUBA_TBODY_QUERY_PATH)) {
        _executeLoadHorseInfo(CHUOH_SHUTUBA_TBODY_QUERY_PATH, TBODY_NUM_QUERY_PATH, TBODY_URL_QUERY_PATH);
    }
    else if (_existsElementHorseInfo(CHIHOU_SHUTUBA_TBODY_QUERY_PATH)) {
        _executeLoadHorseInfo(CHIHOU_SHUTUBA_TBODY_QUERY_PATH, TBODY_NUM_QUERY_PATH, TBODY_URL_QUERY_PATH);
    }
}
function _existsElementHorseInfo(tbodyQueryPath) {
    return document.querySelector(tbodyQueryPath) !== null;
}
function _executeLoadHorseInfo(tbodyQueryPath, numQueryPath, urlQueryPath) {
    const tbody = document.querySelector(tbodyQueryPath);
    const loadHorseInfoParams = Array.from(tbody.rows).map((x) => {
        return { num: Number(x.querySelector(numQueryPath).innerText), url: x.querySelector(urlQueryPath).href };
    });
    chrome.runtime.sendMessage({ type: "loadHorseInfoAll", value: loadHorseInfoParams });
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.type) {
        case "existsElementHorseInfoAll":
            sendResponse(existsElementHorseInfoAll());
            break;
        case "executeLoadHorseInfoAll":
            executeLoadHorseInfoAll();
            break;
        default:
            throw new Error(`Unknown type '${request.type}'`);
    }
});
