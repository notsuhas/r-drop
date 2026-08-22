import { Check, Copy } from "lucide-react";
import { useState } from "react";
import IconButton from "@/components/ui/IconButton";

interface ICopyField {
  value: string;
  /** Announced on the copy control, e.g. "Copy public URL". */
  label?: string;
}

export default function CopyField(props: ICopyField) {
  const { value, label = "Copy" } = props;
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-1 rounded-md bg-bg pl-2.5 pr-1 py-1">
      <code className="min-w-0 flex-1 truncate font-mono text-xs text-ink-2">{value}</code>
      <IconButton
        size="sm"
        label={copied ? "Copied" : label}
        onClick={() => {
          void navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? <Check size={12} className="text-ok" /> : <Copy size={12} />}
      </IconButton>
    </div>
  );
}
