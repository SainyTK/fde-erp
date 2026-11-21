export function describeChanges(
  action: string,
  changes: Record<string, unknown>,
) {
  if (action !== "UPDATE") {
    return Object.entries(changes)
      .filter(([, value]) => value !== null && value !== "")
      .slice(0, 4)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(", ");
  }
  return Object.entries(changes)
    .map(([key, value]) => {
      const { from, to } = value as { from: unknown; to: unknown };
      return `${key}: ${String(from)} to ${String(to)}`;
    })
    .join(", ");
}
