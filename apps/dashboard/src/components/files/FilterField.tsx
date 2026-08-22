import { Search, X } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import Input from "@/components/ui/Input";

interface IFilterField {
  value: string;
  folder: string;
  onChange: (value: string) => void;
}

/** Stable id so the "/" shortcut can focus the field from anywhere. */
export const FILTER_INPUT_ID = "files-filter";

export default function FilterField(props: IFilterField) {
  const { value, folder, onChange } = props;
  return (
    <Input
      id={FILTER_INPUT_ID}
      type="search"
      value={value}
      onChange={onChange}
      onEscape={() => onChange("")}
      aria-label="Filter files in this folder"
      placeholder={folder ? `Filter ${folder}…` : "Filter files…"}
      icon={<Search size={14} />}
      trailing={
        value ? (
          <IconButton size="sm" label="Clear filter" onClick={() => onChange("")}>
            <X size={12} />
          </IconButton>
        ) : undefined
      }
    />
  );
}
