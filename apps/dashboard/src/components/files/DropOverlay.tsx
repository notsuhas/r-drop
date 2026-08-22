import { Upload } from "lucide-react";

interface IDropOverlay {
  target: string;
}

export default function DropOverlay(props: IDropOverlay) {
  return (
    <div className="animate-fade-in pointer-events-none fixed inset-0 z-(--z-index-backdrop) flex items-center justify-center bg-bg/80 p-6 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-honey px-10 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-honey-wash text-honey">
          <Upload size={22} />
        </span>
        <p className="text-md font-medium">
          Drop to upload into <span className="font-mono text-honey">{props.target}/</span>
        </p>
        <p className="max-w-xs text-sm text-ink-2">
          Folders keep their structure. Every file gets a public URL as soon as it lands.
        </p>
      </div>
    </div>
  );
}
