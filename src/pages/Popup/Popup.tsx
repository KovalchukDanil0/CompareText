import { Change, diffChars } from "diff";
import { Alert, Button, Spinner, Textarea } from "flowbite-react";
import React, { useEffect, useState } from "react";
import Browser from "webextension-polyfill";
import "./Popup.css";

let text1: HTMLTextAreaElement;
let text2: HTMLTextAreaElement;

let diffText: HTMLParagraphElement;

let statusBar: HTMLSpanElement;
const statusBarDefText = "Compare output";

interface Data {
  text1: string;
  text2: string;
}
let data: Data;

function compare() {
  const one: string = text1.value.trim(),
    other: string = text2.value.trim();

  let span: HTMLSpanElement;

  const diff: Change[] = diffChars(one, other),
    fragment: DocumentFragment = document.createDocumentFragment();

  diffText.textContent = "";

  diff.forEach((part: Change) => {
    // green for additions, red for deletions
    // grey for common parts
    const color = part.added
      ? "text-lime-500"
      : part.removed
        ? "text-red-500"
        : "text-gray-500";
    span = document.createElement("span");
    span.classList.add(color);
    span.appendChild(document.createTextNode(part.value));
    fragment.appendChild(span);
  });

  diffText.appendChild(fragment);

  if (diff.length === 1) {
    statusBar.textContent = "TEXTS ARE IDENTICAL";
    statusBar.parentElement!.className = "text-green-500";
  } else {
    statusBar.textContent = "TEXTS ARE DIFFERENT";
    statusBar.parentElement!.className = "text-red-500";
  }

  window.scrollTo(0, document.body.scrollHeight);
}

function clearFields() {
  Browser.storage.local.set({ text1: "", text2: "" });

  text1.value = "";
  text2.value = "";

  diffText.innerHTML = "";

  statusBar.parentElement!.className = "";
  statusBar.textContent = statusBarDefText;
}

function saveSettings(event: React.MouseEvent<HTMLTextAreaElement>) {
  const elm: HTMLTextAreaElement = event.currentTarget;
  data[elm.id as keyof typeof data] = elm.value;

  Browser.storage.local.set(data);
}

const Popup = (): React.JSX.Element => {
  const [isLoading, setIsLoading] = useState(true);

  async function assignVariables() {
    text1 = document.getElementById("text1") as HTMLTextAreaElement;
    text2 = document.getElementById("text2") as HTMLTextAreaElement;
    diffText = document.getElementById("diffText") as HTMLParagraphElement;
    statusBar = document.getElementById("statusBar") as HTMLSpanElement;

    data = (await Browser.storage.local.get()) as Data;

    setIsLoading(false);
  }

  useEffect(() => {
    assignVariables();
  });

  if (isLoading) {
    return (
      <div className="grid h-44 place-items-center">
        <Spinner aria-label="Default status example" />
      </div>
    );
  }

  return (
    <div className="mx-3 my-3">
      <div>
        <Textarea
          shadow
          defaultValue={data.text1}
          onInput={saveSettings}
          className="mt-3 text-lg"
          id="text1"
          placeholder="Original text"
          rows={6}
        ></Textarea>
        <Textarea
          defaultValue={data.text2}
          onInput={saveSettings}
          className="mt-3 text-lg"
          id="text2"
          placeholder="Text to compare"
          rows={6}
        ></Textarea>
      </div>

      <div className="sticky top-3 mt-3 flex gap-3">
        <Button color="success" onClick={compare}>
          <p className="text-lg">Compare</p>
        </Button>
        <Button color="failure" onClick={clearFields}>
          <p className="text-lg">Clear</p>
        </Button>
      </div>

      <Alert className="mt-3" color="yellow">
        <p id="diffText" className="text-xl"></p>
        <span id="statusBar" className="text-2xl">
          {statusBarDefText}
        </span>
      </Alert>
    </div>
  );
};

export default Popup;
