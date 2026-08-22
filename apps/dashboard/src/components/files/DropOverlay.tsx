interface IDropOverlay {
  target: string;
}

export default function DropOverlay(props: IDropOverlay) {
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-bg/85 backdrop-blur-sm">
      <div className=" rounded-none border-2 border-dashed border-honey px-16 py-12 text-center">
        <p className="font-display text-xl font-semibold">
          Drop to upload to <span className="text-honey">{props.target}/</span>
        </p>
        <p className="mt-2 text-sm text-muted">Files get a public URL immediately</p>
      </div>
    </div>
  );
}
