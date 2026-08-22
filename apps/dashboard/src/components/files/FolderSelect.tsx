interface IFolderSelect {
  current: string;
  folders: string[];
  onMove: (folder: string) => void;
}

export default function FolderSelect(props: IFolderSelect) {
  const { current, folders, onMove } = props;
  return (
    <select
      value={current}
      onChange={(e) => onMove(e.target.value)}
      className="border border-line bg-bg px-2 py-1 font-mono text-xs"
    >
      {[current, ...folders.filter((f) => f !== current)].map((f) => (
        <option key={f} value={f}>
          {f}
        </option>
      ))}
    </select>
  );
}
