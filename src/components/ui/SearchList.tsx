"use client";

import { Search } from "lucide-react";
import { type ReactNode, useState } from "react";
import { controlClass } from "./styles";

export function SearchList({
  items,
  label,
  empty,
}: {
  items: { id: string | number; search: string; content: ReactNode }[];
  label: string;
  empty: string;
}) {
  const [query, setQuery] = useState("");
  const words = query.toLowerCase().trim().split(/\s+/);
  const matches = items.map(({ search }) =>
    words.every((word) => search.toLowerCase().includes(word)),
  );
  const matchCount = matches.filter(Boolean).length;
  if (items.length === 0) {
    return <p className="text-muted px-4 py-6 text-sm sm:px-6">{empty}</p>;
  }
  return (
    <>
      <div className="border-line border-b px-4 py-4 sm:px-6">
        <label className="relative block max-w-sm">
          <span className="sr-only">{label}</span>
          <Search
            aria-hidden="true"
            className="text-muted pointer-events-none absolute inset-y-0 left-3 my-auto size-4"
          />
          <input
            className={`${controlClass} pl-9`}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={label}
            type="search"
            value={query}
          />
        </label>
      </div>
      <p
        className={
          matchCount === 0 ? "text-muted px-4 py-6 text-sm sm:px-6" : "sr-only"
        }
        role="status"
      >
        {matchCount === 0
          ? "No records match your search."
          : `${matchCount} ${matchCount === 1 ? "result" : "results"}`}
      </p>
      <ul className="[&>li:not([hidden])~li:not([hidden])]:border-line [&>li:not([hidden])~li:not([hidden])]:border-t">
        {items.map(({ id, content }, index) => (
          <li hidden={!matches[index]} key={id}>
            {content}
          </li>
        ))}
      </ul>
    </>
  );
}
