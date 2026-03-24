type Item = { label: string; value: number; color: string; aside: string };

export function BarList({
  items,
  emptyMessage,
}: {
  items: Item[];
  emptyMessage: string;
}) {
  if (!items.length) {
    return <div className="fc-empty">{emptyMessage}</div>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div>
      {items.map((item) => (
        <article key={item.label} className="fc-bar-item">
          <div className="fc-bar-item__top">
            <strong>{item.label}</strong>
            <span>{item.aside}</span>
          </div>
          <div className="fc-bar-track" aria-hidden>
            <span
              className="fc-bar-fill"
              style={{
                width: `${Math.max((item.value / max) * 100, 6)}%`,
                background: item.color,
              }}
            />
          </div>
        </article>
      ))}
    </div>
  );
}
