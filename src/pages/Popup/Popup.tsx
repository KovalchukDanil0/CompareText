import { Change, diffChars } from "diff";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useAsync } from "react-async";
import { Alert, Button, Loading, Textarea } from "react-daisyui";
import { HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
import Browser from "webextension-polyfill";
import { SavedData } from "../../shared";

const statusBarDefText = "Compare output";

function textAreaAdjust(
  ev:
    | React.FormEvent<HTMLTextAreaElement>
    | React.FocusEvent<HTMLTextAreaElement>,
) {
  const elm: HTMLTextAreaElement = ev.currentTarget;

  elm.style.height = "auto";
  elm.style.height = elm.scrollHeight + "px";
}

function partRemoved(part: Change) {
  return part.removed ? "text-red-800" : "text-gray-800";
}

function saveSettings(
  event: React.FormEvent<HTMLTextAreaElement>,
  data: SavedData,
) {
  if (data == null) {
    return;
  }

  const elm: HTMLTextAreaElement = event.currentTarget;
  data[elm.id as keyof typeof data] = elm.value;

  Browser.storage.local.set(data);
}

function ReactDocumentFragment({ diff }: Readonly<{ diff: Change[] }>) {
  if (diff.length === 1 && diff[0].value === "") {
    return statusBarDefText;
  }

  return (
    <div>
      {diff.map((part) => {
        const color = part.added ? "text-green-800" : partRemoved(part);
        return (
          <span key={part.value} className={color}>
            {part.value}
          </span>
        );
      })}
    </div>
  );
}

async function loadPlayer() {
  return (await Browser.storage.local.get()) as SavedData;
}

export default function Popup() {
  const { data, error, isPending } = useAsync({ promiseFn: loadPlayer });

  const [isIdentical, setIsIdentical] = useState<boolean | null>(null);
  const [diffText, setDiffText] = useState<ReactNode | string>(
    statusBarDefText,
  );

  const text1Ref = useRef<HTMLTextAreaElement>(null);
  const text2Ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [isIdentical]);

  if (isPending) {
    return <Loading />;
  }

  if (error || data == null) {
    return `Something went wrong: ${error?.message ?? "savedData is undefined"}`;
  }

  function compare() {
    if (text1Ref.current == null || text2Ref.current == null) {
      return;
    }

    const one: string = text1Ref.current.value.trim(),
      other: string = text2Ref.current.value.trim();

    const diff: Change[] = diffChars(one, other);

    setDiffText(ReactDocumentFragment({ diff }));
    setIsIdentical(diff.length === 1);

    window.scrollTo(0, document.body.scrollHeight);
  }

  function clearFields() {
    if (text1Ref.current == null || text2Ref.current == null) {
      return;
    }

    Browser.storage.local.set({ text1: "", text2: "" });

    text1Ref.current.value = "";
    text1Ref.current.style.height = "";

    text2Ref.current.value = "";
    text2Ref.current.style.height = "";

    setDiffText(statusBarDefText);
    setIsIdentical(null);
  }

  return (
    <div className="dark flex flex-col gap-3">
      <Textarea
        ref={text1Ref}
        onFocus={textAreaAdjust}
        onInput={(ev) => {
          saveSettings(ev, data);
          textAreaAdjust(ev);
        }}
        defaultValue={data.text1}
        className="h-44 overflow-y-hidden text-lg"
        placeholder="Original text"
        id="text1"
      />

      <Textarea
        ref={text2Ref}
        onFocus={textAreaAdjust}
        onInput={(ev) => {
          saveSettings(ev, data);
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
        <Button color="error" onClick={clearFields}>
          <p className="text-lg">Clear</p>
        </Button>
      </div>

      <Alert status="info">
        <p className="text-xl">{diffText}</p>
      </Alert>

      {isIdentical != null && (
        <Alert
          icon={
            isIdentical ? (
              <HiCheckCircle className="size-5" />
            ) : (
              <HiExclamationCircle className="size-5" />
            )
          }
          status={isIdentical ? "success" : "error"}
        >
          <span id="statusBar" className="text-2xl">
            TEXTS ARE {isIdentical ? "IDENTICAL" : "DIFFERENT"}
          </span>
        </Alert>
      )}
    </div>
  );
}
