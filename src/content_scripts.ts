import { LoadHorseInfoParam } from "./types";

const CHUOH_SHUTUBA_TBODY_QUERY_PATH = "#page > div.RaceColumn02 > div.RaceTableArea > table > tbody";
const CHIHOU_SHUTUBA_TBODY_QUERY_PATH =
  "#Netkeiba_Race_Nar_Shutuba > div.Wrap.fc > div.RaceColumn02 > div.RaceTableArea.Shutuba_HorseList > table > tbody";
const TBODY_NUM_QUERY_PATH = "td[class*='Umaban']";
const TBODY_URL_QUERY_PATH = ".HorseInfo > div > div > span > a";

// １レース分の全馬情報を読み込める状態か？
function existsElementHorseInfoAll() {
  return _existsElementHorseInfo(CHUOH_SHUTUBA_TBODY_QUERY_PATH) || _existsElementHorseInfo(CHIHOU_SHUTUBA_TBODY_QUERY_PATH);
}

// １レース分の全馬情報読み込みを実行する
function executeLoadHorseInfoAll() {
  if (_existsElementHorseInfo(CHUOH_SHUTUBA_TBODY_QUERY_PATH)) {
    _executeLoadHorseInfo(CHUOH_SHUTUBA_TBODY_QUERY_PATH, TBODY_NUM_QUERY_PATH, TBODY_URL_QUERY_PATH);
  } else if (_existsElementHorseInfo(CHIHOU_SHUTUBA_TBODY_QUERY_PATH)) {
    _executeLoadHorseInfo(CHIHOU_SHUTUBA_TBODY_QUERY_PATH, TBODY_NUM_QUERY_PATH, TBODY_URL_QUERY_PATH);
  }
}

// 指定テーブルの１レース分の全馬情報を読み込める状態か？
function _existsElementHorseInfo(tbodyQueryPath: string) {
  return document.querySelector(tbodyQueryPath) !== null;
}

// 指定テーブルの１レース分の全馬情報読み込みを実行する
function _executeLoadHorseInfo(tbodyQueryPath: string, numQueryPath: string, urlQueryPath: string) {
  // 「出馬表」タブにあるレース結果テーブルの要素を特定
  const tbody: HTMLTableElement | null = document.querySelector(tbodyQueryPath);
  if (!tbody) return;

  // 各馬情報ページを読み込むためのパラメータを用意
  const loadHorseInfoParams = Array.from(tbody.rows)
    // DOM要素から馬順と馬情報URLを抽出。見つからなかったらダミーデータで埋める
    .map((x): LoadHorseInfoParam => {
      const numElement: HTMLElement | null = x.querySelector(numQueryPath);
      const urlElement: HTMLLinkElement | null = x.querySelector(urlQueryPath);
      if (numElement && urlElement) {
        return { num: Number(numElement.innerText), url: urlElement.href };
      } else {
        return { num: -1, url: "" }; // ダミーデータ
      }
    })
    // ダミーデータを除外
    .filter((x) => x.num !== -1);

  // 各馬情報ページリンク一覧を送信して情報を読み込む
  chrome.runtime.sendMessage({ type: "loadHorseInfoAll", value: loadHorseInfoParams });
  // chrome.runtime.sendMessage({ type: "loadHorseInfoAll", value: [{ num: 1, url: "https://db.netkeiba.com/horse/2018105573" }] });
}

// メッセージごとの振る舞い
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
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
