const ERROR_COPY: Record<string, string> = {
  not_invited: "That Google account isn't invited. Ask for an invite, then sign in again.",
  auth_failed: "Sign-in didn't complete. Try again.",
};

export default function Login() {
  const error = new URLSearchParams(window.location.search).get("error");
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8">
        <div className="font-display text-2xl font-bold tracking-tight">
          ho<span className="text-honey">·</span>drops
        </div>
        <p className="mt-2 text-sm text-muted">
          Asset drive for theclau.de. Invite-only — sign in with the Google account that was
          invited.
        </p>
        {error && ERROR_COPY[error] && (
          <p className="mt-4 rounded-lg border border-[rgba(255,110,110,0.35)] bg-[rgba(255,110,110,0.06)] px-3 py-2 text-sm text-danger">
            {ERROR_COPY[error]}
          </p>
        )}
        <button
          type="button"
          onClick={() => {
            window.location.href = "/api/auth/login";
          }}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-honey px-4 py-3 font-display font-semibold text-honey-ink transition-transform hover:brightness-105 active:scale-[0.99]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              fill="currentColor"
              d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
            />
            <path
              fill="currentColor"
              opacity="0.7"
              d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
            />
            <path
              fill="currentColor"
              opacity="0.5"
              d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9l3.3-2.5Z"
            />
            <path
              fill="currentColor"
              opacity="0.85"
              d="M12 6c1.5 0 2.8.5 3.8 1.5L18.7 5A10 10 0 0 0 3.1 7.5L6.4 10c.8-2.3 3-4 5.6-4Z"
            />
          </svg>
          Continue with Google
        </button>
        <p className="mt-4 text-center text-xs text-muted">
          Public assets live at <span className="font-mono">ho-drops.theclau.de</span>
        </p>
      </div>
    </div>
  );
}
