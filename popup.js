const texts = [0, 0];

let diffText;
let statusBar;

const compareFunc = function () {
  texts.forEach((text) => {
    text.value = removeExtraSpaces(text.value);
  });

  const dmp = new diff_match_patch();
  const d = dmp.diff_main(texts[0].value, texts[1].value);
  let ds = dmp.diff_prettyHtml(d);
  ds = ds.replace("¶", " ");

  diffText.innerHTML = ds;

  if (d.length === 1) {
    statusBar.textContent = "Two texts are identical";
    statusBar.parentElement.classList.remove("is-danger");
    statusBar.parentElement.classList.add("message", "is-success");
  } else {
    statusBar.textContent = "TEXTS ARE DIFFERENT";
    statusBarRemoveClasses();
    statusBar.parentElement.classList.add("message", "is-danger");
  }
};

window.removeExtraSpaces = function (str) {
  return str.replace(/\s+/g, " ").trim();
};

window.statusBarRemoveClasses = function () {
  statusBar.parentElement.classList.remove("is-danger", "is-success");
};

window.clearFields = function () {
  browser.storage.local.set({ text1: "", text2: "" });

  for (const textElm of texts) {
    textElm.value = "";
  }
  diffText.innerHTML = "";

  statusBar.textContent = "";
  statusBarRemoveClasses();
};

window.assignVariables = function () {
  for (let index = 0; index < texts.length; index++) {
    texts[index] = document.getElementById(`text${index + 1}`);
  }

  const compareBut = document.getElementById("compare");
  compareBut.addEventListener("click", compareFunc);

  const clearBut = document.getElementById("clear");
  clearBut.addEventListener("click", clearFields);

  diffText = document.getElementById("diffText");
  statusBar = document.getElementById("status");
};

window.loadData = async function () {
  for (const textElm of texts) {
    const loadData = {};
    loadData[textElm.id] = "";

    const textSavedVal = await browser.storage.local.get(loadData);
    textElm.value = textSavedVal[textElm.id];
  }
};

window.saveData = function () {
  for (const textElm of texts) {
    textElm.addEventListener(
      "input",
      function () {
        const saveData = {};
        saveData[textElm.id] = textElm.value;

        browser.storage.local.set(saveData);
      },
      false
    );
  }
};

(function Main() {
  assignVariables();
  loadData();
  saveData();
})();
