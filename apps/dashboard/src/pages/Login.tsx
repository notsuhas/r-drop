import BrandMark from "@/components/auth/BrandMark";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import Notice from "@/components/ui/Notice";

const ERROR_COPY: Record<string, string> = {
  not_invited: "That Google account isn't invited. Ask for an invite, then sign in again.",
  auth_failed: "Sign-in didn't complete. Try again.",
};

export default function Login() {
  const error = new URLSearchParams(window.location.search).get("error");

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-sm border-2 border-line bg-panel p-8">
        <BrandMark size="lg" />
        <p className="mt-2 text-sm text-muted">
          Invite-only asset drive. Sign in with the Google account that was invited.
        </p>
        {error && ERROR_COPY[error] && (
          <div className="mt-4">
            <Notice>{ERROR_COPY[error]}</Notice>
          </div>
        )}
        <div className="mt-8">
          <GoogleSignInButton />
        </div>
      </div>
    </div>
  );
}
