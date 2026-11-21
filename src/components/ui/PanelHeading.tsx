import type { LucideIcon } from "lucide-react";

export function PanelHeading({
  icon: Icon,
  title,
  id,
}: {
  icon: LucideIcon;
  title: string;
  id: string;
}) {
  return (
    <div className="border-line flex items-center gap-3 border-b px-4 py-4 sm:px-6">
      <span className="bg-brand-soft text-brand grid size-9 shrink-0 place-items-center rounded-lg">
        <Icon aria-hidden="true" className="size-[18px]" />
      </span>
      <h2 className="font-semibold" id={id}>
        {title}
      </h2>
    </div>
  );
}
