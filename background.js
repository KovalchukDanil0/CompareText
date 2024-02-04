try {
  importScripts(
    "./node_modules/webextension-polyfill/dist/browser-polyfill.min.js"
  );
} catch (e) {
  throw new Error(e);
}

browser.runtime.onInstalled.addListener(function () {
  browser.contextMenus.create({
    title: "Compare",
    contexts: ["selection"],
    id: "compareText",
  });
});

const menusOnClick = async function (info) {
  if (info.menuItemId !== "compareText") {
    return;
  }

  const saveData = {};
  saveData["text1"] = info.selectionText;

  browser.storage.local.set(saveData);
};

browser.contextMenus.onClicked.addListener(menusOnClick);
