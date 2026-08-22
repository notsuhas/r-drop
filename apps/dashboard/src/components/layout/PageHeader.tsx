interface IPageHeader {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

/** Header for the settings-style pages, matching the file browser's header
 *  height so the shell doesn't shift when you switch tabs. */
export default function PageHeader(props: IPageHeader) {
  const { title, description, actions } = props;
  return (
    <header className="shrink-0 border-b border-hairline px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-ink">{title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-2">{description}</p>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
