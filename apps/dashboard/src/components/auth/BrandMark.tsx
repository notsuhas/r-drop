interface IBrandMark {
  size?: "md" | "lg";
}

export default function BrandMark(props: IBrandMark) {
  const { size = "md" } = props;
  return (
    <span
      className={`font-display font-bold tracking-tight ${size === "lg" ? "text-2xl" : "text-lg"}`}
    >
      ho<span className="text-honey">·</span>drive
    </span>
  );
}
