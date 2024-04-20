import { Change, diffChars } from "diff";
import { Alert, Button, Spinner, Textarea } from "flowbite-react";
import React, { useEffect, useState } from "react";
import { HiInformationCircle } from "react-icons/hi";
import Browser from "webextension-polyfill";
import "./Popup.css";

let text1: HTMLTextAreaElement;
let text2: HTMLTextAreaElement;

let diffText: HTMLParagraphElement;

const statusBarDefText = "Compare output";

interface Data {
  text1: string;
  text2: string;
}
let data: Data;

function partRemoved(part: Change) {
  return part.removed ? "text-red-500" : "text-gray-500";
}

function saveSettings(event: React.MouseEvent<HTMLTextAreaElement>) {
  const elm: HTMLTextAreaElement = event.currentTarget;
  data[elm.id as keyof typeof data] = elm.value;

  Browser.storage.local.set(data);
}

function textAreaAdjust(
  ev:
    | React.KeyboardEvent<HTMLTextAreaElement>
    | React.FocusEvent<HTMLTextAreaElement>,
) {
  const elm: HTMLTextAreaElement = ev.currentTarget;

  elm.style.height = "1px";
  elm.style.height = `${25 + elm.scrollHeight}px`;
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

export default function Popup(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [isIdentical, setIsIdentical] = useState<boolean | null>(null);

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
      const color = part.added ? "text-green-600" : partRemoved(part);
      span = document.createElement("span");
      span.classList.add(color);
      span.appendChild(document.createTextNode(part.value));
      fragment.appendChild(span);
    });

    diffText.appendChild(fragment);

    if (diff.length === 1) {
      setIsIdentical(true);
    } else {
      setIsIdentical(false);
    }

    scrollToBottom();
  }

  function clearFields() {
    Browser.storage.local.set({ text1: "", text2: "" });

    text1.value = "";
    text1.style.height = "";

    text2.value = "";
    text2.style.height = "";

    diffText.innerHTML = statusBarDefText;

    setIsIdentical(null);
  }

  async function assignVariables() {
    text1 = document.getElementById("text1") as HTMLTextAreaElement;
    text2 = document.getElementById("text2") as HTMLTextAreaElement;
    diffText = document.getElementById("diffText") as HTMLParagraphElement;

    data = (await Browser.storage.local.get()) as Data;

    setIsLoading(false);
  }

  useEffect(() => {
    assignVariables();

    if (isIdentical != null) {
      scrollToBottom();
    }
  });

  if (isLoading) {
    return (
      <div className="grid h-44 place-items-center">
        <Spinner aria-label="Default status example" />
      </div>
    );
  }

  return (
    <div className="dark flex flex-col gap-3 p-3">
      <Textarea
        shadow
        onFocus={textAreaAdjust}
        onKeyUp={textAreaAdjust}
        onInput={saveSettings}
        defaultValue={data.text1}
        className="text-lg"
        id="text1"
        placeholder="Original text"
        rows={6}
      />

      <Textarea
        shadow
        onFocus={textAreaAdjust}
        onKeyUp={textAreaAdjust}
        onInput={saveSettings}
        defaultValue={data.text2}
        className="text-lg"
        id="text2"
        placeholder="Text to compare"
        rows={6}
      />

      <div className="sticky bottom-5 top-5 flex flex-row gap-3">
        <Button color="success" onClick={compare}>
          <p className="text-lg">Compare</p>
        </Button>
        <Button color="failure" onClick={clearFields}>
          <p className="text-lg">Clear</p>
        </Button>
      </div>

      <Alert color="indigo" rounded={false}>
        <p id="diffText" className="text-xl">
          {statusBarDefText}
        </p>
      </Alert>

      {isIdentical != null && (
        <Alert
          color={isIdentical ? "success" : "failure"}
          icon={HiInformationCircle}
        >
          <span id="statusBar" className="text-2xl">
            TEXTS ARE {isIdentical ? "IDENTICAL" : "DIFFERENT"}
          </span>
        </Alert>
      )}
    </div>
  );
}
