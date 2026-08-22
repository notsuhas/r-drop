// Primary upload control: a button plus the two hidden pickers it drives.
// "New folder" lives in the same menu so it stays reachable on narrow screens
// where the standalone icon button is hidden.
import { FolderPlus, Upload } from "lucide-react";
import { useRef } from "react";
import Button from "@/components/ui/Button";
import Menu from "@/components/ui/Menu";
import { useMenu } from "@/hooks/useMenu";
import { relativeDirOf } from "@/lib/dropped";

export interface IUploadEntry {
  file: File;
  dir: string;
}

interface IUploadButton {
  uploadTarget: string;
  onUpload: (entries: IUploadEntry[]) => void;
  onNewFolder: () => void;
}

/** Stable id so the empty state can trigger the same picker. */
export const UPLOAD_INPUT_ID = "files-upload-input";

export default function UploadButton(props: IUploadButton) {
  const { uploadTarget, onUpload, onNewFolder } = props;
  const filePicker = useRef<HTMLInputElement>(null);
  const folderPicker = useRef<HTMLInputElement>(null);
  const menu = useMenu();

  return (
    <>
      <Button
        variant="primary"
        icon={<Upload size={14} />}
        onClick={menu.openBelow}
        aria-haspopup
        aria-expanded={menu.open}
      >
        Upload
      </Button>

      <input
        ref={filePicker}
        id={UPLOAD_INPUT_ID}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length)
            onUpload([...e.target.files].map((file) => ({ file, dir: "" })));
          e.target.value = "";
        }}
      />
      <input
        ref={folderPicker}
        type="file"
        multiple
        // @ts-expect-error non-standard but universally supported directory picker
        webkitdirectory=""
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length)
            onUpload([...e.target.files].map((file) => ({ file, dir: relativeDirOf(file) })));
          e.target.value = "";
        }}
      />

      {menu.anchor && (
        <Menu
          label="Upload"
          anchor={menu.anchor}
          onClose={menu.close}
          groups={[
            {
              label: `Into ${uploadTarget}/`,
              items: [
                {
                  id: "files",
                  label: "Upload files…",
                  icon: <Upload size={14} />,
                  onSelect: () => filePicker.current?.click(),
                },
                {
                  id: "folder",
                  label: "Upload a folder…",
                  icon: <FolderPlus size={14} />,
                  onSelect: () => folderPicker.current?.click(),
                },
              ],
            },
            {
              items: [
                {
                  id: "new-folder",
                  label: "New folder",
                  icon: <FolderPlus size={14} />,
                  onSelect: onNewFolder,
                },
              ],
            },
          ]}
        />
      )}
    </>
  );
}
