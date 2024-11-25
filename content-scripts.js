const CHUOH_SHUTUBA_TBODY_QUERY_PATH = "#page > div.RaceColumn02 > div.RaceTableArea > table > tbody";

// 全馬情報を読み込める状態か？
function existsElementHorseInfoChuohShutuba() {
  return document.querySelector(CHUOH_SHUTUBA_TBODY_QUERY_PATH) !== null;
}

// 全馬情報読み込みを実行する
function executeLoadHorseInfoChuohShutuba() {
  // 「レース」カテゴリ以下のレースページにある「出馬表」タブにあるレース結果テーブルの要素を特定
  const tbody = document.querySelector(CHUOH_SHUTUBA_TBODY_QUERY_PATH);

  // 各馬情報ページを読み込むためのパラメータを用意
  const loadHorseInfoParams = Array.from(tbody.rows).map((x) => {
    return { num: Number(x.querySelector("td[class*='Umaban']").innerText), url: x.querySelector(".HorseInfo > div > div > span > a").href };
  });

  // 各馬情報ページリンク一覧を送信して情報を読み込む
  chrome.runtime.sendMessage({ type: "loadHorseInfoAll", value: loadHorseInfoParams });
  // chrome.runtime.sendMessage({ type: "loadHorseInfoAll", value: [{ num: 1, url: "https://db.netkeiba.com/horse/2018105573" }] });
}

// メッセージごとの振る舞い
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "existsElementHorseInfoChuohShutuba":
      sendResponse(existsElementHorseInfoChuohShutuba());
      break;
    case "executeLoadHorseInfoChuohShutuba":
      executeLoadHorseInfoChuohShutuba();
      break;
    default:
      throw new Error(`Unknown type '${request.type}'`);
  }
});
