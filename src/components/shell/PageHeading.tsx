export function PageHeading({
  title,
  description,
}: {
  title: string;
  description?: string | null;
}) {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="text-muted mt-2 max-w-prose">{description}</p>
      )}
    </div>
  );
}
