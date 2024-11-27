import { PastRaceData, HorseInfo, LoadedData } from "./types";

// メッセージごとの振る舞い
chrome.runtime.onMessage.addListener(async (request, _sender, sendResponse) => {
  switch (request.type) {
    // background内変数に読み込み済みのデータ(loadedData)を送る
    case "download":
      const key = request.key as keyof LoadedData;
      sendResponse(loadedData[key]);
      break;
    // 全馬情報を読み込みローカルストレージに保存
    case "loadHorseInfoAll":
      const loadHorseInfoParam = request.value;
      const horseInfoAll: HorseInfo[] = [];

      // これまでの情報はクリア
      await chrome.storage.local.set({ horseInfoAll: horseInfoAll });

      // 馬情報ページから必要な情報を収集
      const tabCreatePromises = [];
      for (const param of loadHorseInfoParam) {
        const horseInfo: HorseInfo = { num: param.num, pastRaceDataArray: [] };
        tabCreatePromises.push(
          chrome.tabs.create({ url: param.url, active: false }).then(async (tab) => {
            const tabId = tab.id ?? 0;
            await chrome.scripting
              .executeScript({
                target: { tabId: tabId },
                func: () => {
                  // この関数内はbackground外の処理。background中のコードは利用不可

                  const pastRaceDataArray = [];
                  const tbody: HTMLTableElement | null = document.querySelector("#contents > div.db_main_race.fc > div > table > tbody");
                  if (tbody) {
                    for (const row of tbody.rows) {
                      // この馬の過去のレース情報
                      // -  0:日付
                      // -  1:開催
                      // -  2:天気
                      // -  3:R
                      // -  4:レース名
                      // -  5:映像
                      // -  6:頭数
                      // -  7:枠番
                      // -  8:馬番
                      // -  9:オッズ
                      // - 10:人気
                      // - 11:着順
                      // - 12:騎手
                      // - 13:斤量
                      // - 14:距離
                      // - 15:馬場
                      // - 16:馬場指数
                      // - 17:タイム
                      // - 18:着差
                      // - 19:タイム指数
                      // - 20:通過
                      // - 21:ペース
                      // - 22:上り
                      // - 23:馬体重
                      // - 24:厩舎コメント
                      // - 25:備考
                      // - 26:勝馬(2着馬)
                      const pastRaceData = [];
                      for (const cell of row.cells) {
                        pastRaceData.push(cell.innerText.trim());
                      }
                      pastRaceDataArray.push(pastRaceData);
                    }
                  }
                  return pastRaceDataArray;
                },
              })
              .then((injectionResult) => {
                // executeScript.functionの戻り値をbackgroundで受け取る
                horseInfo.pastRaceDataArray = injectionResult[0].result as PastRaceData[];
                horseInfoAll.push(horseInfo);
              });

            // タブ内の処理が終わったので閉じる
            chrome.tabs.remove(tabId);
          })
        );
      }
      await Promise.allSettled(tabCreatePromises).then(async () => {
        // 得た情報をストレージに書き込む
        await chrome.storage.local.set({ horseInfoAll: horseInfoAll });
      });
      break;
    default:
      throw new Error(`Unknown type '${request.type}'`);
  }
});

// ストレージに変更があったらbackground内変数にその情報を保持
let loadedData: LoadedData = {
  horseInfoAll: [],
};
chrome.storage.onChanged.addListener((changes, namespace) => {
  switch (namespace) {
    case "local":
      for (const [key, { /*oldValue,*/ newValue }] of Object.entries(changes)) {
        if (key === "horseInfoAll") {
          loadedData.horseInfoAll = newValue;
        }
      }
      break;
  }
});
