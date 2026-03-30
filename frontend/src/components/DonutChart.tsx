type Slice = {
  label: string;
  value: number;
  color: string;
};

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

export function DonutChart({
  title,
  totalLabel,
  slices,
}: {
  title: string;
  totalLabel: string;
  slices: Slice[];
}) {
  const total = slices.reduce((sum, item) => sum + item.value, 0);
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (!slices.length || total <= 0) {
    return (
      <div className="fc-empty" style={{ minHeight: 280 }}>
        Sem dados suficientes para o grafico.
      </div>
    );
  }

  return (
    <div className="fc-donut-card">
      <div className="fc-donut-card__visual">
        <svg viewBox="0 0 220 220" className="fc-donut-chart" aria-label={title} role="img">
          <circle cx="110" cy="110" r={radius} className="fc-donut-chart__track" />
          <g transform="rotate(-90 110 110)">
            {slices.map((slice) => {
              const length = (slice.value / total) * circumference;
              const dashOffset = -offset;
              offset += length;

              return (
                <circle
                  key={slice.label}
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="24"
                  strokeLinecap="butt"
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={dashOffset}
                />
              );
            })}
          </g>
        </svg>
        <div className="fc-donut-card__center">
          <span>Total</span>
          <strong>{totalLabel}</strong>
        </div>
      </div>

      <div className="fc-donut-card__legend">
        {slices.map((slice) => (
          <article key={slice.label} className="fc-donut-legend">
            <div className="fc-donut-legend__meta">
              <span
                className="fc-donut-legend__dot"
                style={{ background: slice.color }}
                aria-hidden
              />
              <strong>{slice.label}</strong>
            </div>
            <div className="fc-donut-legend__values">
              <span>{slice.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span>{formatPercent((slice.value / total) * 100)}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
