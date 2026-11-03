import React, { useState } from 'react';

// ============================================================================
// 1. STAT CARD COMPONENT
// ============================================================================
export const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  color = '#4f46e5',
  bgColor = 'rgba(79, 70, 229, 0.1)',
  onClick,
}) => {
  return (
    <div
      className="admin-stat-card"
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div className="admin-stat-card-top">
        <span className="admin-stat-label">{label}</span>
        <div
          className="admin-stat-icon-wrapper"
          style={{ backgroundColor: bgColor, color: color }}
        >
          {Icon && <Icon size={22} />}
        </div>
      </div>

      <div className="admin-stat-value">{value}</div>

      <div className="admin-stat-bottom">
        {trend && (
          <span className={`admin-stat-trend ${trendType}`}>
            {trendType === 'up' && '↑'}
            {trendType === 'down' && '↓'}
            {trend}
          </span>
        )}
        {subtext && <span className="admin-stat-subtext">{subtext}</span>}
      </div>
    </div>
  );
};

// ============================================================================
// 2. INTERACTIVE SVG AREA & LINE CHART
// ============================================================================
export const AreaLineChart = ({
  data = [], // [{ label: 'Oct 01', value: 120, secondary: 5 }]
  title = 'Revenue Trend',
  currency = '$',
  height = 260,
  strokeColor = '#4f46e5',
  gradientId = 'revGrad',
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-text-subtle)' }}>
        No chart data available for the selected period
      </div>
    );
  }

  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 35;
  const width = 640;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const values = data.map((d) => d.value || 0);
  const maxValue = Math.max(...values, 10);
  const roundedMax = Math.ceil(maxValue * 1.15);

  const points = data.map((d, index) => {
    const x =
      data.length > 1
        ? paddingLeft + (index / (data.length - 1)) * innerWidth
        : paddingLeft + innerWidth / 2;
    const y = paddingTop + innerHeight - (d.value / roundedMax) * innerHeight;
    return { x, y, ...d };
  });

  // Generate smooth cubic Bézier curve
  let pathD = '';
  if (points.length === 1) {
    pathD = `M ${points[0].x - 10} ${points[0].y} L ${points[0].x + 10} ${points[0].y}`;
  } else {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  const areaD = `${pathD} L ${points[points.length - 1].x} ${
    paddingTop + innerHeight
  } L ${points[0].x} ${paddingTop + innerHeight} Z`;

  // Horizontal guide lines (4 lines)
  const guideLines = [0, 0.33, 0.66, 1].map((ratio) => {
    const y = paddingTop + innerHeight - ratio * innerHeight;
    const val = Math.round(ratio * roundedMax);
    return { y, val };
  });

  const activePoint = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="admin-chart-container" style={{ height }}>
      {activePoint && (
        <div
          className="admin-chart-tooltip"
          style={{
            left: `${(activePoint.x / width) * 100}%`,
            top: `${(activePoint.y / height) * 100}%`,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{activePoint.label}</div>
          <div style={{ color: strokeColor, fontWeight: 600 }}>
            Revenue: {currency}
            {activePoint.value.toFixed(2)}
          </div>
          {activePoint.secondary !== undefined && (
            <div style={{ color: 'var(--admin-text-muted)' }}>
              Orders: {activePoint.secondary}
            </div>
          )}
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines and labels */}
        {guideLines.map((g, idx) => (
          <g key={idx}>
            <line
              x1={paddingLeft}
              y1={g.y}
              x2={width - paddingRight}
              y2={g.y}
              stroke="var(--admin-border-subtle)"
              strokeDasharray="4 4"
            />
            <text
              x={paddingLeft - 8}
              y={g.y + 4}
              fontSize="10"
              fill="var(--admin-text-subtle)"
              textAnchor="end"
              fontFamily="var(--admin-font-sans)"
            >
              {currency}
              {g.val >= 1000 ? `${(g.val / 1000).toFixed(1)}k` : g.val}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaD} fill={`url(#${gradientId})`} />

        {/* Curve stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* X axis labels (skip some if too dense) */}
        {points.map((p, idx) => {
          const step = Math.ceil(points.length / 7);
          const showLabel = idx % step === 0 || idx === points.length - 1;
          if (!showLabel) return null;
          return (
            <text
              key={idx}
              x={p.x}
              y={height - 8}
              fontSize="10.5"
              fill="var(--admin-text-muted)"
              textAnchor="middle"
              fontFamily="var(--admin-font-sans)"
            >
              {p.label}
            </text>
          );
        })}

        {/* Hover Crosshair & Data Points */}
        {points.map((p, idx) => (
          <g
            key={idx}
            onMouseEnter={() => setHoverIndex(idx)}
            style={{ cursor: 'pointer' }}
          >
            {/* Transparent hover capture column */}
            <rect
              x={p.x - innerWidth / (points.length * 2 || 1)}
              y={paddingTop}
              width={innerWidth / (points.length || 1)}
              height={innerHeight}
              fill="transparent"
            />

            {hoverIndex === idx && (
              <>
                <line
                  x1={p.x}
                  y1={paddingTop}
                  x2={p.x}
                  y2={paddingTop + innerHeight}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="6"
                  fill={strokeColor}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
              </>
            )}

            {hoverIndex !== idx && (
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill="#ffffff"
                stroke={strokeColor}
                strokeWidth="2"
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

// ============================================================================
// 3. INTERACTIVE SVG BAR CHART
// ============================================================================
export const BarChart = ({
  data = [], // [{ label: 'Fiction', value: 45 }]
  height = 240,
  barColor = '#3b82f6',
  valuePrefix = '',
  valueSuffix = '',
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--admin-text-subtle)' }}>
        No chart data available
      </div>
    );
  }

  const paddingLeft = 35;
  const paddingRight = 15;
  const paddingTop = 20;
  const paddingBottom = 35;
  const width = 500;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data.map((d) => d.value || 0), 5);
  const roundedMax = Math.ceil(maxValue * 1.2);

  const barWidth = Math.min(36, Math.max(14, (innerWidth / data.length) * 0.6));
  const slotWidth = innerWidth / data.length;

  return (
    <div className="admin-chart-container" style={{ height }}>
      {hoverIndex !== null && data[hoverIndex] && (
        <div
          className="admin-chart-tooltip"
          style={{
            left: `${
              ((paddingLeft + slotWidth * hoverIndex + slotWidth / 2) / width) * 100
            }%`,
            top: '20%',
          }}
        >
          <div style={{ fontWeight: 700 }}>{data[hoverIndex].label}</div>
          <div style={{ color: barColor, fontWeight: 600 }}>
            {valuePrefix}
            {data[hoverIndex].value}
            {valueSuffix}
          </div>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: '100%' }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const y = paddingTop + innerHeight - ratio * innerHeight;
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="var(--admin-border-subtle)"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 6}
                y={y + 4}
                fontSize="10"
                fill="var(--admin-text-subtle)"
                textAnchor="end"
                fontFamily="var(--admin-font-sans)"
              >
                {Math.round(ratio * roundedMax)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, idx) => {
          const barHeight = Math.max(4, (d.value / roundedMax) * innerHeight);
          const x = paddingLeft + idx * slotWidth + (slotWidth - barWidth) / 2;
          const y = paddingTop + innerHeight - barHeight;
          const isHovered = hoverIndex === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoverIndex(idx)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="5"
                ry="5"
                fill={isHovered ? '#2563eb' : barColor}
                opacity={isHovered ? 1 : 0.88}
                style={{ transition: 'all 0.2s ease' }}
              />

              {/* Value on top of bar */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                fontSize="10.5"
                fontWeight="600"
                fill={isHovered ? 'var(--admin-primary)' : 'var(--admin-text-muted)'}
                textAnchor="middle"
                fontFamily="var(--admin-font-sans)"
              >
                {d.value}
              </text>

              {/* Label at bottom */}
              <text
                x={x + barWidth / 2}
                y={height - 10}
                fontSize="10.5"
                fill="var(--admin-text-muted)"
                textAnchor="middle"
                fontFamily="var(--admin-font-sans)"
              >
                {d.label.length > 8 ? `${d.label.slice(0, 7)}…` : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ============================================================================
// 4. INTERACTIVE SVG DONUT / PIE CHART
// ============================================================================
const PALETTE = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

export const DonutChart = ({
  data = [], // [{ label: 'Fiction', value: 12 }]
  size = 200,
  strokeWidth = 24,
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--admin-text-subtle)' }}>
        No category distribution data
      </div>
    );
  }

  const total = data.reduce((acc, d) => acc + (d.value || 0), 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const slices = data.map((d, idx) => {
    const percent = total > 0 ? (d.value / total) * 100 : 0;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percent;

    return {
      ...d,
      percent: percent.toFixed(1),
      color: PALETTE[idx % PALETTE.length],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeSlice = hoverIndex !== null ? slices[hoverIndex] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
        >
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={hoverIndex === idx ? strokeWidth + 4 : strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text-main)' }}>
            {activeSlice ? `${activeSlice.percent}%` : total}
          </div>
          <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', fontWeight: 600 }}>
            {activeSlice ? activeSlice.label : 'Total Items'}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px 16px',
          width: '100%',
          fontSize: '12px',
        }}
      >
        {slices.map((s, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              opacity: hoverIndex === null || hoverIndex === idx ? 1 : 0.4,
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={() => setHoverIndex(idx)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: s.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                color: 'var(--admin-text-main)',
                flex: 1,
              }}
            >
              {s.label}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--admin-text-muted)' }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

