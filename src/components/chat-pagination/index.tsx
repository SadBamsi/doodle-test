import { Button } from "@/components/button";

import styles from "./styles.module.css";

type ChatPaginationProps = {
  newerHref: string | null;
  olderHref: string | null;
};

export function ChatPagination({ newerHref, olderHref }: ChatPaginationProps) {
  return (
    <nav className={styles.pagination} aria-label="Pagination">
      <Button href={newerHref ?? undefined} disabled={!newerHref}>
        Newer
      </Button>
      <Button href={olderHref ?? undefined} disabled={!olderHref}>
        Older
      </Button>
    </nav>
  );
}
