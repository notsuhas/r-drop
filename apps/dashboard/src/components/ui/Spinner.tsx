interface ISpinner {
  size?: number;
  className?: string;
}

export default function Spinner(props: ISpinner) {
  const { size = 14, className = "" } = props;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`animate-spin ${className}`}
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.2"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
