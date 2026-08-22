import { useEffect, useState } from "react";
import { COPY_FORMATS, type CopyFormat } from "../../lib/links";

interface ISelectionPill {
  count: number;
  onCopy: (format: CopyFormat) => void;
  onDelete: () => void;
  copied: boolean;
}

export default function SelectionPill(props: ISelectionPill) {
  const { count, onCopy, onDelete, copied } = props;
  const [confirming, setConfirming] = useState(false);

  useEffect(() => setConfirming(false), []);

  return (
    <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-none border border-line bg-panel-2 p-1.5 shadow-[6px_6px_0_rgba(0,0,0,0.55)]">
      <span className="px-3 font-display text-sm">{count} selected</span>
      <span className="mr-1 text-xs text-muted">copy as</span>
      {COPY_FORMATS.map((fmt) => (
        <button
          key={fmt.id}
          type="button"
          onClick={() => onCopy(fmt.id)}
          className=" rounded-none px-2.5 py-1.5 font-mono text-xs text-ink transition-colors hover:bg-[rgba(255,178,86,0.15)]"
        >
          {fmt.label}
        </button>
      ))}
      <div className="mx-1 h-5 w-px bg-line" />
      {confirming ? (
        <>
          <button
            type="button"
            onClick={() => {
              onDelete();
              setConfirming(false);
            }}
            className=" rounded-none bg-[rgba(255,110,110,0.15)] px-2.5 py-1.5 font-mono text-xs text-danger"
          >
            confirm — urls will 404
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className=" rounded-none px-2.5 py-1.5 font-mono text-xs text-muted hover:text-ink"
          >
            cancel
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className=" rounded-none px-2.5 py-1.5 font-mono text-xs text-danger transition-colors hover:bg-[rgba(255,110,110,0.12)]"
        >
          delete
        </button>
      )}
      {copied && <span className="px-2 text-xs text-ok">copied</span>}
    </div>
  );
}
