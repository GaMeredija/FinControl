type Item = {
  label: string;
  income: number;
  expense: number;
};

export function MonthlyBarsChart({
  items,
}: {
  items: Item[];
}) {
  if (!items.length) {
    return (
      <div className="fc-empty" style={{ minHeight: 280 }}>
        Sem historico suficiente para o grafico.
      </div>
    );
  }

  const width = 640;
  const height = 280;
  const maxValue = Math.max(
    ...items.flatMap((item) => [item.income, item.expense]),
    1,
  );
  const chartTop = 24;
  const chartBottom = 218;
  const chartHeight = chartBottom - chartTop;
  const groupGap = 20;
  const barWidth = 22;
  const groupWidth = barWidth * 2 + 10;
  const innerWidth = items.length * groupWidth + Math.max(items.length - 1, 0) * groupGap;
  const startX = (width - innerWidth) / 2;
  const gridValues = [0.25, 0.5, 0.75, 1];

  function barHeight(value: number) {
    return Math.max(6, (value / maxValue) * chartHeight);
  }

  return (
    <div className="fc-trend-chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="fc-trend-chart__svg" aria-label="Historico mensal de receitas e despesas" role="img">
        {gridValues.map((ratio) => {
          const y = chartBottom - ratio * chartHeight;
          return (
            <g key={ratio}>
              <line x1="28" y1={y} x2={width - 24} y2={y} className="fc-trend-chart__grid" />
              <text x="8" y={y + 4} className="fc-trend-chart__axis">
                {Math.round(maxValue * ratio).toLocaleString('pt-BR')}
              </text>
            </g>
          );
        })}

        {items.map((item, index) => {
          const x = startX + index * (groupWidth + groupGap);
          const incomeHeight = barHeight(item.income);
          const expenseHeight = barHeight(item.expense);

          return (
            <g key={item.label}>
              <rect
                x={x}
                y={chartBottom - incomeHeight}
                width={barWidth}
                height={incomeHeight}
                rx="7"
                className="fc-trend-chart__income"
              />
              <rect
                x={x + barWidth + 10}
                y={chartBottom - expenseHeight}
                width={barWidth}
                height={expenseHeight}
                rx="7"
                className="fc-trend-chart__expense"
              />
              <text x={x + groupWidth / 2 + 5} y={height - 18} textAnchor="middle" className="fc-trend-chart__label">
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="fc-trend-chart__legend">
        <span><i className="fc-trend-chart__swatch fc-trend-chart__swatch--income" />Receitas</span>
        <span><i className="fc-trend-chart__swatch fc-trend-chart__swatch--expense" />Despesas</span>
      </div>
    </div>
  );
}
