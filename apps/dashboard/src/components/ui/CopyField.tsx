import { useState } from "react";
import Button from "./Button";

interface ICopyField {
  value: string;
  label?: string;
}

export default function CopyField(props: ICopyField) {
  const { value, label = "Copy" } = props;
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate bg-bg px-2.5 py-1.5 font-mono text-xs">{value}</code>
      <Button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? "Copied" : label}
      </Button>
    </div>
  );
}
