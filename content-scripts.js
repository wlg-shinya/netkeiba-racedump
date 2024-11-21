// 全馬情報の読み込み
function executeLoadHorseInfoAll() {
  // 「結果・払戻」タブにあるレース結果テーブルの要素を特定
  const tbody = document.querySelector("#All_Result_Table > tbody");

  // 各馬情報ページを読み込むためのパラメータを用意
  const loadHorseInfoParams = Array.from(tbody.rows).map((x) => {
    return { num: Number(x.querySelector(".Num.Txt_C > div").innerText), url: x.querySelector(".Horse_Info > span.Horse_Name > a").href };
  });

  // 各馬情報ページリンク一覧を送信して情報を読み込む
  chrome.runtime.sendMessage({ type: "loadHorseInfoAll", value: loadHorseInfoParams });
  //   chrome.runtime.sendMessage({ type: "loadHorseInfoAll", value: [{ num: 1, url: "https://db.netkeiba.com/horse/2018105573" }] });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "executeLoadHorseInfoAll":
      executeLoadHorseInfoAll();
      break;
    default:
      throw new Error(`Unknown type '${request.type}'`);
  }
});

// // 指定クエリパスのDOM要素を見つけたら処理を行う
// async function actionAfterFindElement(querySelectorPath, action) {
//   return new Promise((resolve, rejected) => {
//     const intervalId = setInterval(() => {
//       try {
//         const element = document.querySelector(querySelectorPath);
//         if (element) {
//           clearInterval(intervalId);
//           action(element);
//           resolve();
//         }
//       } catch (e) {
//         rejected(e);
//       }
//     }, 100);
//   });
// }
