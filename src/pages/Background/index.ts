import Browser, { Menus } from "webextension-polyfill";
import { SavedData } from "../../shared";

Browser.runtime.onInstalled.addListener(function () {
  Browser.contextMenus.create({
    title: "Compare",
    contexts: ["selection"],
    id: "compareText",
  });
});

async function menusOnClick(info: Menus.OnClickData) {
  if (info.menuItemId !== "compareText") {
    return;
  }

  const saveData: SavedData = {};
  saveData["text2"] = info.selectionText;

  Browser.storage.local.set(saveData);
}

Browser.contextMenus.onClicked.addListener(menusOnClick);
