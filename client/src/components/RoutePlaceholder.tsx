export default function RoutePlaceholder({
  title,
}: {
  title: string;
}) {
  return (
    <main style={{ padding: 32 }}>
      <h1>{title}</h1>
      <p>This page is being developed.</p>
    </main>
  );
}