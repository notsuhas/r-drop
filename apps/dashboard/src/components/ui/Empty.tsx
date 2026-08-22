interface IEmpty {
  title: string;
  hint: string;
}

export default function Empty(props: IEmpty) {
  const { title, hint } = props;
  return (
    <div className="flex flex-col items-center justify-center rounded-none border border-dashed border-line py-20 text-center">
      <p className="font-display font-medium">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted">{hint}</p>
    </div>
  );
}
