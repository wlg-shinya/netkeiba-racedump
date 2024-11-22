const HORSE_INFO_ALL_TBODY_QUERY_PATH = "#All_Result_Table > tbody";

// 全馬情報を読み込める状態か？
function existsElementHorseInfoAll() {
  return document.querySelector(HORSE_INFO_ALL_TBODY_QUERY_PATH) !== null;
}

// 全馬情報読み込みを実行する
function executeLoadHorseInfoAll() {
  // 「結果・払戻」タブにあるレース結果テーブルの要素を特定
  const tbody = document.querySelector(HORSE_INFO_ALL_TBODY_QUERY_PATH);

  // 各馬情報ページを読み込むためのパラメータを用意
  const loadHorseInfoParams = Array.from(tbody.rows).map((x) => {
    return { num: Number(x.querySelector(".Num.Txt_C > div").innerText), url: x.querySelector(".Horse_Info > span.Horse_Name > a").href };
  });

  // 各馬情報ページリンク一覧を送信して情報を読み込む
  chrome.runtime.sendMessage({ type: "loadHorseInfoAll", value: loadHorseInfoParams });
  // chrome.runtime.sendMessage({ type: "loadHorseInfoAll", value: [{ num: 1, url: "https://db.netkeiba.com/horse/2018105573" }] });
}

// メッセージごとの振る舞い
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
