import Link from "next/link";
import { secondaryButtonClass } from "./styles";

export function Pagination({
  page,
  size,
  total,
  href,
}: {
  page: number;
  size: number;
  total: number;
  href: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / size));
  if (pages === 1 && page <= 1) {
    return null;
  }
  return (
    <nav
      aria-label="Page navigation"
      className="border-line flex flex-wrap items-center gap-3 border-t p-4 text-sm"
    >
      {page > 1 && (
        <Link className={secondaryButtonClass} href={href(page - 1)}>
          Previous
        </Link>
      )}
      <span>
        Page {page} of {pages}
      </span>
      {page < pages && (
        <Link className={secondaryButtonClass} href={href(page + 1)}>
          Next
        </Link>
      )}
    </nav>
  );
}
