import { Change, diffChars } from "diff";
import React, {
  FocusEvent,
  FormEvent,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useAsync } from "react-async";
import { Alert, Button, Loading, Textarea } from "react-daisyui";
import Browser from "webextension-polyfill";
import { create } from "zustand";
import ReactDocumentFragment, {
  statusBarDefText,
} from "../../containers/ReactDocumentFragment";
import StatusAlert from "../../containers/StatusAlert";
import { SavedData } from "../../shared";

type IsIdenticalType = boolean | null;
export type IsIdenticalFunctionType = (isIdentical: IsIdenticalType) => void;

type DiffTextType = ReactNode | string;

let text1Ref: RefObject<HTMLTextAreaElement>;
let text2Ref: RefObject<HTMLTextAreaElement>;

const useStateCompare = create<{
  isIdentical: IsIdenticalType;
  setIsIdentical: IsIdenticalFunctionType;
  diffText: DiffTextType;
  setDiffText: (diffText: DiffTextType) => void;
}>((set) => ({
  isIdentical: null,
  setIsIdentical: (isIdentical) =>
    set(() => ({
      isIdentical,
    })),
  diffText: statusBarDefText,
  setDiffText: (diffText) =>
    set(() => ({
      diffText,
    })),
}));

function textAreaAdjust(
  ev: FormEvent<HTMLTextAreaElement> | FocusEvent<HTMLTextAreaElement>,
) {
  const elm: HTMLTextAreaElement = ev.currentTarget;

  elm.style.height = "auto";
  elm.style.height = elm.scrollHeight + "px";
}

function saveSettings(
  event: FormEvent<HTMLTextAreaElement>,
  data: SavedData | undefined,
) {
  if (!data) {
    return;
  }

  const elm: HTMLTextAreaElement = event.currentTarget;
  data[elm.id as keyof typeof data] = elm.value;

  Browser.storage.local.set(data);
}

function compare() {
  if (!text1Ref.current || !text2Ref.current) {
    return;
  }

  const one: string = text1Ref.current.value.trim(),
    other: string = text2Ref.current.value.trim();

  const diff: Change[] = diffChars(one, other);

  useStateCompare.setState({
    diffText: ReactDocumentFragment({ diff }),
    isIdentical: diff.length === 1,
  });
}

function clearFields() {
  if (!text1Ref.current || !text2Ref.current) {
    return;
  }

  Browser.storage.local.set({ text1: "", text2: "" });

  text1Ref.current.value = "";
  text1Ref.current.style.height = "";

  text2Ref.current.value = "";
  text2Ref.current.style.height = "";

  useStateCompare.setState({
    diffText: statusBarDefText,
    isIdentical: null,
  });
}

async function initVariables() {
  return Browser.storage.local.get() as SavedData;
}

export default function Popup() {
  const { data, error, isPending } = useAsync({ promiseFn: initVariables });
  const { isIdentical, setIsIdentical, diffText } = useStateCompare();

  const adjustAndSaveSettings = useCallback(
    (ev: FormEvent<HTMLTextAreaElement>) => {
      textAreaAdjust(ev);
      saveSettings(ev, data);
    },
    [data],
  );

  text1Ref = useRef<HTMLTextAreaElement>(null);
  text2Ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [diffText]);

  if (isPending) {
    return <Loading />;
  }

  if (error || !data) {
    return `Something went wrong: ${error?.message ?? "savedData is undefined"}`;
  }

  return (
    <div className="dark flex flex-col gap-3">
      <Textarea
        ref={text1Ref}
        onFocus={textAreaAdjust}
        onInput={adjustAndSaveSettings}
        defaultValue={data.text1}
        className="h-44 overflow-y-hidden text-lg"
        placeholder="Original text"
        id="text1"
      />

      <Textarea
        ref={text2Ref}
        onFocus={textAreaAdjust}
        onInput={adjustAndSaveSettings}
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

      <Alert>
        <p className="text-xl">{diffText}</p>
      </Alert>

      {isIdentical != null && (
        <StatusAlert
          isIdentical={isIdentical}
          setIsIdentical={setIsIdentical}
        />
      )}
    </div>
  );
}
