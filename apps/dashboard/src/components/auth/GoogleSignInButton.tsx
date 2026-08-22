export default function GoogleSignInButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = "/api/auth/login";
      }}
      className="flex w-full items-center justify-center gap-2.5 rounded-md bg-honey px-4 py-2.5 font-medium text-honey-ink shadow-e1 transition-colors duration-(--duration-fast) ease-(--ease-out-quart) hover:bg-honey-dim"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
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
  );
}
