const APP_NAME = "netkeiba-racedump";
const OUTPUT_TEXT_ID = `${APP_NAME}_OutputText`;
const CLIPBOARD_COPY_BUTTON_ID = `${APP_NAME}_ClipboardCopyButton`;

function defaultDownloadedData() {
  return {
    horseInfoAll: [],
  };
}
let downloadedData = defaultDownloadedData();

main();
function main() {
  const card = createCard(true, false);
  componentTitle(card.header);
  componentExecuteButton(card.body);
  componentClipboardCopyButton(card.body);
  componentOutputText(card.body);
  // componentDownloadButton(card.footer);

  pollingUpdateOutputText();
}

function pollingUpdateOutputText() {
  // ローカルで保存しているデータとbackgroundで得たデータに差異があったらOutputTextを更新
  chrome.runtime.sendMessage({ type: "download", key: "horseInfoAll" }, (res) => {
    if (JSON.stringify(downloadedData.horseInfoAll) !== JSON.stringify(res)) {
      downloadedData.horseInfoAll = structuredClone(res);
      updateOutputText();
    }
  });
  // この処理を定期的に繰り返す
  setTimeout(() => {
    pollingUpdateOutputText();
  }, 1000);
}

function updateOutputText() {
  const element = document.querySelector(`#${OUTPUT_TEXT_ID}`);
  if (element && downloadedData.horseInfoAll.length > 0) {
    const outputText = downloadedData.horseInfoAll
      .sort((a, b) => (a.num < b.num ? -1 : 1))
      .map((horseInfo) => horseInfo.pastRaceDataArray.map((x) => x.join("\t").trim()).join("\n"))
      .join("\n\n");
    element.textContent = outputText;

    // 出力文字が何かしらある場合はクリップボードボタンを表示
    if (element.textContent) {
      const ccb = document.querySelector(`#${CLIPBOARD_COPY_BUTTON_ID}`);
      ccb.style.display = "block";
    }
  }
}

function createCard(enableHeader, enableFooter) {
  const card = document.createElement("div");
  card.classList.add("card");
  const cardHeader = document.createElement("div");
  if (enableHeader) {
    cardHeader.classList.add("card-header");
    card.appendChild(cardHeader);
  }
  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");
  card.appendChild(cardBody);
  const cardFooter = document.createElement("div");
  if (enableFooter) {
    cardFooter.classList.add("card-footer");
    card.appendChild(cardFooter);
  }
  document.body.appendChild(card);
  return {
    header: cardHeader,
    body: cardBody,
    footer: cardFooter,
  };
}

function componentTitle(parent) {
  const icon = document.createElement("img");
  icon.classList.add("me-1");
  icon.src = chrome.runtime.getURL("images/icon16.png");
  parent.appendChild(icon);
  const title = document.createElement("span");
  title.textContent = APP_NAME;
  parent.appendChild(title);
}

function componentExecuteButton(parent) {
  const div = document.createElement("div");
  div.classList.add("d-flex");
  div.classList.add("justify-content-center");
  const button = document.createElement("button");
  button.classList.add("btn");
  button.classList.add("btn-primary");
  button.textContent = "このページにある馬の情報をすべて読み込む";
  button.onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // これまでの情報はクリア
      downloadedData = defaultDownloadedData();

      // 全馬情報の読み込みをbackgroundに要求
      chrome.tabs.sendMessage(tabs[0].id, { type: "executeLoadHorseInfoAll" });
    });
  };
  div.appendChild(button);
  parent.appendChild(div);
}

function componentClipboardCopyButton(parent) {
  const div = document.createElement("div");
  div.classList.add("d-flex");
  div.classList.add("justify-content-center");
  const button = document.createElement("button");
  div.appendChild(button);
  button.id = CLIPBOARD_COPY_BUTTON_ID;
  button.classList.add("btn");
  button.classList.add("btn-outline-primary");
  button.style.display = "none"; // 生成時は非表示
  button.textContent = "出力結果をクリップボードにコピー";
  button.onclick = () => {
    const outputText = document.querySelector(`#${OUTPUT_TEXT_ID}`);
    navigator.clipboard.writeText(outputText.textContent);
  };
  parent.appendChild(div);
}

function componentOutputText(parent) {
  const element = document.createElement("pre");
  element.id = OUTPUT_TEXT_ID;
  element.style.fontSize = "6px";
  element.style.userSelect = "all";
  parent.appendChild(element);
}
