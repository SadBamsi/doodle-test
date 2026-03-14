import { Button } from "@/components/button";
import { MAX_LIMIT, MIN_LIMIT } from "@/lib/constants";
import { formatDateTimeLocalInput } from "@/lib/date-time";

import styles from "./styles.module.css";

type ChatFiltersProps = {
  limit: number;
  before?: string;
  after?: string;
  latestHref: string;
};

export function ChatFilters({
  limit,
  before,
  after,
  latestHref,
}: ChatFiltersProps) {
  return (
    <form method="get" className={styles.filterBar}>
      <label className={styles.fieldCompact}>
        <span className={styles.label}>Limit</span>
        <input
          className={styles.inputCompact}
          type="number"
          name="limit"
          min={MIN_LIMIT}
          max={MAX_LIMIT}
          defaultValue={limit}
        />
      </label>

      <label className={styles.fieldCompact}>
        <span className={styles.label}>Before</span>
        <input
          className={styles.inputCompact}
          type="datetime-local"
          name="before"
          defaultValue={formatDateTimeLocalInput(before)}
        />
      </label>

      <label className={styles.fieldCompact}>
        <span className={styles.label}>After</span>
        <input
          className={styles.inputCompact}
          type="datetime-local"
          name="after"
          defaultValue={formatDateTimeLocalInput(after)}
        />
      </label>

      <Button type="submit">Apply</Button>
      <Button href={latestHref}>Latest</Button>
    </form>
  );
}
