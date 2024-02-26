import Browser, { Menus } from "webextension-polyfill";

Browser.runtime.onInstalled.addListener(function () {
  Browser.contextMenus.create({
    title: "Compare",
    contexts: ["selection"],
    id: "compareText",
  });
});

const menusOnClick = async function (info: Menus.OnClickData) {
  if (info.menuItemId !== "compareText") {
    return;
  }

  const saveData: { [key: string]: string } = {};
  saveData["text1"] = info.selectionText!;

  Browser.storage.local.set(saveData);
};

Browser.contextMenus.onClicked.addListener(menusOnClick);
