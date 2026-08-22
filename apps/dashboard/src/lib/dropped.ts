export interface IDroppedFile {
  file: File;
  dir: string;
}

// Walk dropped items with webkitGetAsEntry so macOS folder drops upload
// their contents (with the folder name as the target folder), like Drive.
export async function collectDropped(dt: DataTransfer): Promise<IDroppedFile[]> {
  const entries = [...dt.items]
    .map((item) => item.webkitGetAsEntry?.())
    .filter((e): e is FileSystemEntry => e != null);
  if (entries.length === 0) return [...dt.files].map((file) => ({ file, dir: "" }));

  const out: IDroppedFile[] = [];
  const walk = async (entry: FileSystemEntry, dir: string): Promise<void> => {
    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) =>
        (entry as FileSystemFileEntry).file(resolve, reject),
      );
      out.push({ file, dir });
      return;
    }
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    const childDir = dir ? `${dir}/${entry.name}` : entry.name;
    // readEntries returns batches of ≤100; loop until empty.
    for (;;) {
      const batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
        reader.readEntries(resolve, reject),
      );
      if (batch.length === 0) break;
      for (const child of batch) await walk(child, childDir);
    }
  };
  for (const entry of entries) await walk(entry, "");
  return out;
}
