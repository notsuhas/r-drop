import Empty from "@/components/ui/Empty";
import { SkeletonRows } from "@/components/ui/Skeleton";

interface IListSection {
  title: string;
  /** Rendered beside the title once there's something to count. */
  count?: number;
  isLoading: boolean;
  isEmpty: boolean;
  emptyIcon: React.ReactNode;
  emptyTitle: string;
  emptyHint: string;
  children: React.ReactNode;
}

/** Heading + count over a loading / empty / populated body. Shared by the
 *  settings pages so both report state the same way. */
export default function ListSection(props: IListSection) {
  const { title, count, isLoading, isEmpty, emptyIcon, emptyTitle, emptyHint, children } = props;

  return (
    <section>
      <h2 className="text-sm font-medium">
        {title}
        {count ? <span className="ml-1.5 text-ink-3">{count}</span> : null}
      </h2>
      <div className="mt-2.5">
        {isLoading ? (
          <SkeletonRows count={3} />
        ) : isEmpty ? (
          <Empty size="sm" icon={emptyIcon} title={emptyTitle} hint={emptyHint} />
        ) : (
          <div className="divide-y divide-hairline overflow-hidden rounded-lg bg-surface">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
