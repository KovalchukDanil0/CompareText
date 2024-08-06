import React, { useEffect } from "react";
import { Alert, Toast } from "react-daisyui";
import { HiCheckCircle, HiExclamationCircle } from "react-icons/hi";
import { IsIdenticalFunctionType } from "../../pages/Popup/Popup";

type Props = { isIdentical: boolean; setIsIdentical: IsIdenticalFunctionType };

export default function StatusAlert({
  isIdentical,
  setIsIdentical,
}: Readonly<Props>) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsIdentical(null);
    }, 2000);

    // this will clear Timeout
    // when component unmount like in willComponentUnmount
    // and show will not change to true
    return () => {
      clearTimeout(timeout);
    };
  }, [setIsIdentical]);

  return (
    <Toast className="animate-fade-down">
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
    </Toast>
  );
}
