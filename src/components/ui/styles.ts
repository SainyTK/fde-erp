export const controlClass =
  "min-h-11 w-full min-w-0 rounded-lg border border-control bg-surface px-3 text-base text-ink placeholder:text-muted";

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold motion-safe:transition-colors disabled:cursor-wait disabled:opacity-60";

export const primaryButtonClass = `${buttonBase} bg-brand text-white hover:bg-brand-hover`;
export const secondaryButtonClass = `${buttonBase} border border-line bg-surface text-ink hover:bg-brand-soft`;
export const dangerButtonClass = `${buttonBase} border border-danger/30 text-danger hover:bg-danger-soft`;
export const panelClass = "min-w-0 rounded-xl border border-line bg-surface";
