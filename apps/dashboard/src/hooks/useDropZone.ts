// Window-level drag-drop: tracks the overlay state and walks dropped folders.
import { useState } from "react";
import { collectDropped } from "@/lib/dropped";

export function useDropZone(onFile: (file: File, dir: string) => void) {
  const [dragging, setDragging] = useState(false);

  const handlers = {
    onDragOver: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: (e: React.DragEvent<HTMLElement>) => {
      if (e.currentTarget === e.target) setDragging(false);
    },
    onDrop: (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      setDragging(false);
      void collectDropped(e.dataTransfer).then((dropped) => {
        for (const { file, dir } of dropped) onFile(file, dir);
      });
    },
  };

  return { dragging, handlers };
}
