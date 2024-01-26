const compareFunc = function () {
  const text1 = document.getElementById("text1").value;
  const text2 = document.getElementById("text2").value;

  const dmp = new diff_match_patch();
  const d = dmp.diff_main(text1, text2);
  let ds = dmp.diff_prettyHtml(d);
  ds = ds.replace("¶", " ");

  const diffText = document.getElementById("diffText");
  diffText.innerHTML = ds;

  const statusBar = document.getElementById("status");
  if (d.length === 1) {
    statusBar.textContent = "Two texts are identical";
    statusBar.parentElement.classList.remove("is-danger");
    statusBar.parentElement.classList.add("message", "is-success");
  } else {
    statusBar.textContent = "TEXTS ARE DIFFERENT";
    statusBar.parentElement.classList.remove("is-success");
    statusBar.parentElement.classList.add("message", "is-danger");
  }
};

const compareBut = document.getElementById("compare");
compareBut.addEventListener("click", compareFunc);
