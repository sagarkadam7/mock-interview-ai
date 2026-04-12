import React from "react";

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

export function Sparkline({
  data,
  width = 320,
  height = 70,
  stroke = "var(--indigo2)",
  fill = "rgba(99,102,241,0.12)",
}) {
  const values = (data || []).filter((v) => typeof v === "number" && !Number.isNaN(v));
  if (values.length < 2) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 12 }}>
        Not enough data
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const pad = 6;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const pts = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * innerW;
    const t = (v - min) / range;
    const y = pad + innerH - t * innerH;
    return { x, y };
  });

  const poly = pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  const area = [
    `M ${pts[0].x.toFixed(2)} ${height - pad}`,
    ...pts.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`),
    `L ${pts[pts.length - 1].x.toFixed(2)} ${height - pad}`,
    "Z",
  ].join(" ");

  const last = pts[pts.length - 1];

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Score trend sparkline">
      <path d={area} fill={fill} />
      <polyline points={poly} fill="none" stroke={stroke} strokeWidth="2.25" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last.x} cy={last.y} r="4.2" fill={stroke} />
    </svg>
  );
}

export function RadarChart({
  metrics,
  size = 280,
  levels = 4,
  stroke = "var(--accent2)",
  fill = "rgba(34,197,238,0.10)",
}) {
  const axes = (metrics || []).filter(Boolean);
  const count = axes.length;
  if (!count) return null;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;

  const angleFor = (i) => -Math.PI / 2 + (i * (2 * Math.PI)) / count;
  const pointFor = (i, t) => {
    const a = angleFor(i);
    const r = radius * clamp01(t);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const ringPolys = Array.from({ length: levels }, (_, k) => {
    const t = (k + 1) / levels;
    const pts = axes.map((_, i) => {
      const a = angleFor(i);
      const r = radius * t;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
    return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
  });

  const valuePolyPts = axes.map((m, i) => {
    const p = pointFor(i, m.normalized ?? 0);
    return { x: p.x, y: p.y };
  });
  const valuePoly = valuePolyPts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Radar chart">
      {ringPolys.map((poly, idx) => (
        <polygon key={idx} points={poly} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
      ))}

      {axes.map((m, i) => {
        const p = pointFor(i, 1);
        return <line key={m.label} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
      })}

      <polygon points={valuePoly} fill={fill} stroke={stroke} strokeWidth="2.1" />

      {valuePolyPts.map((p, i) => (
        <circle key={axes[i].label} cx={p.x} cy={p.y} r="3.2" fill={stroke} />
      ))}

      {axes.map((m, i) => {
        const a = angleFor(i);
        const labelR = radius + 18;
        const x = cx + labelR * Math.cos(a);
        const y = cy + labelR * Math.sin(a);
        const anchor = Math.abs(Math.cos(a)) < 0.2 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
        return (
          <text
            key={m.label}
            x={x}
            y={y}
            fill="var(--text2)"
            fontSize="11"
            fontWeight="600"
            textAnchor={anchor}
            dominantBaseline="middle"
          >
            {m.label}
          </text>
        );
      })}
    </svg>
  );
}
