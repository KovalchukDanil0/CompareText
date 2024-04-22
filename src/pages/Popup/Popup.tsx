import { Change, diffChars } from "diff";
import { Alert, Button, Spinner, Textarea } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { HiInformationCircle } from "react-icons/hi";
import Browser from "webextension-polyfill";
import "./Popup.css";

const statusBarDefText = "Compare output";

interface Data {
  text1: string;
  text2: string;
}

function textAreaAdjust(
  ev:
    | React.FormEvent<HTMLTextAreaElement>
    | React.FocusEvent<HTMLTextAreaElement>,
) {
  const elm: HTMLTextAreaElement = ev.currentTarget;

  elm.style.height = "auto";
  elm.style.height = elm.scrollHeight + "px";
}

export default function Popup(): React.JSX.Element {
  const [isIdentical, setIsIdentical] = useState<boolean | null>(null);
  const [data, setData] = useState<Data | null>(null);

  const text1Ref = useRef<HTMLTextAreaElement>(null);
  const text2Ref = useRef<HTMLTextAreaElement>(null);

  const diffTextRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    assignVariables();
  }, []);

  async function assignVariables() {
    const dataTemp = (await Browser.storage.local.get()) as Data;

    console.log(dataTemp);

    setData(dataTemp);
  }

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [isIdentical]);

  function partRemoved(part: Change) {
    return part.removed ? "text-red-500" : "text-gray-500";
  }

  function saveSettings(event: React.FormEvent<HTMLTextAreaElement>) {
    if (data == null) {
      return;
    }

    console.log(data);

    const elm: HTMLTextAreaElement = event.currentTarget;
    data[elm.id as keyof typeof data] = elm.value;

    Browser.storage.local.set(data);
  }

  function compare() {
    if (
      text1Ref.current == null ||
      text2Ref.current == null ||
      diffTextRef.current == null
    ) {
      return;
    }

    const one: string = text1Ref.current.value.trim(),
      other: string = text2Ref.current.value.trim();

    let span: HTMLSpanElement;

    const diff: Change[] = diffChars(one, other),
      fragment: DocumentFragment = document.createDocumentFragment();

    diffTextRef.current.textContent = "";

    diff.forEach((part: Change) => {
      // green for additions, red for deletions
      // grey for common parts
      const color = part.added ? "text-green-600" : partRemoved(part);
      span = document.createElement("span");
      span.classList.add(color);
      span.appendChild(document.createTextNode(part.value));
      fragment.appendChild(span);
    });

    diffTextRef.current?.appendChild(fragment);

    if (diff.length === 1) {
      setIsIdentical(true);
    } else {
      setIsIdentical(false);
    }

    window.scrollTo(0, document.body.scrollHeight);
  }

  function clearFields() {
    if (
      text1Ref.current == null ||
      text2Ref.current == null ||
      diffTextRef.current == null
    ) {
      return;
    }

    Browser.storage.local.set({ text1: "", text2: "" });

    text1Ref.current.value = "";
    text1Ref.current.style.height = "";

    text2Ref.current.value = "";
    text2Ref.current.style.height = "";

    diffTextRef.current.innerHTML = statusBarDefText;

    setIsIdentical(null);
  }

  if (data == null) {
    return <Spinner />;
  }

  return (
    <div className="dark flex flex-col gap-3 p-3">
      <Textarea
        shadow
        ref={text1Ref}
        onFocus={textAreaAdjust}
        onInput={(ev) => {
          saveSettings(ev);
          textAreaAdjust(ev);
        }}
        defaultValue={data.text1}
        className="h-44 overflow-y-hidden text-lg"
        placeholder="Original text"
        id="text1"
      />

      <Textarea
        shadow
        ref={text2Ref}
        onFocus={textAreaAdjust}
        onInput={(ev) => {
          saveSettings(ev);
          textAreaAdjust(ev);
        }}
        defaultValue={data.text2}
        className="h-44 overflow-y-hidden text-lg"
        placeholder="Text to compare"
        id="text2"
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
        <p ref={diffTextRef} className="text-xl">
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
