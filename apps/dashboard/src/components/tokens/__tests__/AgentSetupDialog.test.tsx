import { describe, expect, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import AgentSetupDialog from "@/components/tokens/AgentSetupDialog";

const props = {
  tokenName: "agent-2026-08-23",
  prompt: "Set up r-drop …",
  copied: true,
  onClose: () => {},
};

describe("AgentSetupDialog", () => {
  test("is a real dialog, not an aside", () => {
    render(<AgentSetupDialog {...props} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.textContent).toContain("paste it into your agent");
  });

  // The whole point of replacing the toast: the next action has to be spelled out.
  test("spells out what the user does next", () => {
    render(<AgentSetupDialog {...props} />);
    const steps = screen.getAllByRole("listitem");
    expect(steps.length).toBe(3);
    expect(steps[1]?.textContent).toContain("Paste the prompt");
    expect(screen.getByRole("dialog").textContent).toContain("agent-2026-08-23");
  });

  test("shows the prompt to copy by hand when the clipboard was blocked", () => {
    render(<AgentSetupDialog {...props} copied={false} prompt="verbatim-prompt-body" />);
    const box = screen.getByLabelText("Agent setup prompt") as HTMLTextAreaElement;
    expect(box.value).toBe("verbatim-prompt-body");
    expect(box.readOnly).toBe(true);
  });

  test("hides the textarea once the copy succeeded", () => {
    render(<AgentSetupDialog {...props} />);
    expect(screen.queryByLabelText("Agent setup prompt")).toBeNull();
  });

  test("escape closes", () => {
    let closed = false;
    render(<AgentSetupDialog {...props} onClose={() => (closed = true)} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(closed).toBe(true);
  });
});
