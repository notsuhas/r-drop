// bun test runs hook tests in a happy-dom document with React act() enabled.
import { afterEach } from "bun:test";
import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register();
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;

// Testing Library's auto-cleanup hooks into a global afterEach, which bun
// doesn't provide — without this, trees stay mounted and `screen` queries see
// every render the file has ever done. Registering it from the preload covers
// all test files and unmounts components that touch document/window on teardown
// (Modal's scroll lock and key listeners).
//
// Imported dynamically on purpose: @testing-library/dom binds `screen` to
// document.body at module load, and a static import is hoisted above
// register(), which binds every query to a document that doesn't exist yet.
const { cleanup } = await import("@testing-library/react");
afterEach(cleanup);
