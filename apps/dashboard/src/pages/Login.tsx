import BrandMark from "@/components/auth/BrandMark";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import Notice from "@/components/ui/Notice";

const ERROR_COPY: Record<string, string> = {
  not_invited:
    "That Google account isn't on the invite list. Ask an admin to add it, then sign in again.",
  auth_failed: "Sign-in didn't finish. Try again.",
};

/** Sample of what the product produces, so the sign-in page shows the job
 *  rather than describing it. */
const SAMPLE = [
  ["hero-banner.png", "brand"],
  ["loader.riv", "onboarding"],
  ["checkout-demo.mp4", "checkout-v2"],
] as const;

export default function Login() {
  const error = new URLSearchParams(window.location.search).get("error");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-5 py-12">
      <div className="w-full max-w-sm">
        <BrandMark size="lg" />
        <h1 className="mt-4 text-xl font-semibold">Assets in, URLs out.</h1>
        <p className="mt-1.5 text-sm text-ink-2">
          An invite-only drive for the team and its agents. Drop a file, get a permanent public CDN
          URL you can paste straight into code.
        </p>

        {error && ERROR_COPY[error] && (
          <div className="mt-5">
            <Notice>{ERROR_COPY[error]}</Notice>
          </div>
        )}

        <div className="mt-7">
          <GoogleSignInButton />
        </div>
        <p className="mt-3 text-xs text-ink-3">
          Use the Google account that was invited — there's no separate password.
        </p>
      </div>

      <div className="w-full max-w-sm rounded-lg bg-surface p-4">
        <p className="text-2xs font-medium text-ink-3">What you get back</p>
        <ul className="mt-2.5 space-y-1.5">
          {SAMPLE.map(([file, folder]) => (
            <li key={file} className="truncate font-mono text-xs">
              <span className="text-ink-3">/{folder}/</span>
              <span className="text-ink">{file}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
