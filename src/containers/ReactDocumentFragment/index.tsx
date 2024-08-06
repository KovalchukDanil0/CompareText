import { Change } from "diff";
import React from "react";

export const statusBarDefText = "Compare output";

function partRemoved(part: Change) {
  return part.removed ? "text-red-800" : "text-gray-500";
}

export default function ReactDocumentFragment({
  diff,
}: Readonly<{ diff: Change[] }>) {
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
