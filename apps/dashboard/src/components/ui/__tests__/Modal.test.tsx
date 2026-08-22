import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import Modal from "@/components/ui/Modal";

function open(onClose = () => {}) {
  return render(
    <Modal
      title="Title"
      subtitle="Subtitle"
      onClose={onClose}
      footer={<button type="button">Done</button>}
    >
      <button type="button">Inside</button>
    </Modal>,
  );
}

describe("Modal", () => {
  test("is labelled by its title and described by its subtitle", () => {
    open();
    const dialog = screen.getByRole("dialog");
    const labelId = dialog.getAttribute("aria-labelledby");
    const describedId = dialog.getAttribute("aria-describedby");
    expect(document.getElementById(labelId ?? "")?.textContent).toBe("Title");
    expect(document.getElementById(describedId ?? "")?.textContent).toBe("Subtitle");
  });

  test("portals to body so an ancestor cannot clip it", () => {
    const { container } = open();
    expect(container.contains(screen.getByRole("dialog"))).toBe(false);
    expect(document.body.contains(screen.getByRole("dialog"))).toBe(true);
  });

  test("escape and backdrop both close", () => {
    let closes = 0;
    open(() => closes++);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(closes).toBe(1);
    fireEvent.click(screen.getByRole("dialog").parentElement?.firstElementChild as Element);
    expect(closes).toBe(2);
  });

  test("locks page scroll while open and restores it after", () => {
    const { unmount } = open();
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  // Focus opens on the panel, so a back-tab from there must wrap rather than
  // walk out to the page hidden behind the backdrop.
  test("tab wraps inside the dialog in both directions", () => {
    open();
    const items = [...screen.getByRole("dialog").querySelectorAll("button")];
    const last = items[items.length - 1];

    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(items[0]);
  });
});
