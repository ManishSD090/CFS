import React from "react";

export function ProgressChart({ bars, labels }) {
  const maxH = 120;
  const maxVal = Math.max(...bars);
  return (
    <svg viewBox={`0 0 ${bars.length * 40} ${maxH + 35}`} className="w-full overflow-visible">
      {[0, 25, 50, 75, 100].map(v => {
        const y = maxH + 15 - Math.round((v / 100) * maxH);
        return (
          <g key={v}>
            <line x1="0" y1={y} x2={bars.length * 40} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x="-2" y={y + 3} textAnchor="end" fontSize="7" fill="#94a3b8">{v}%</text>
          </g>
        );
      })}
      {bars.map((h, i) => {
        const barH = Math.round((h / 100) * maxH);
        const isHigh = h === maxVal;
        return (
          <g key={i}>
            <rect x={i * 40 + 8} y={maxH + 15 - barH} width="28" height={barH} rx="5"
              fill={isHigh ? '#2563eb' : '#93c5fd'} opacity="0.9" />
            <text x={i * 40 + 22} y={maxH + 28} textAnchor="middle" fontSize="8" fill="#94a3b8">{labels[i] || ''}</text>
            <text x={i * 40 + 22} y={maxH + 10 - barH} textAnchor="middle" fontSize="7" fill={isHigh ? '#2563eb' : '#64748b'}>{h}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function AttendanceChart() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const wBars = [42, 38, 45, 40, 35, 28, 0];
  const sBars = [8, 7, 9, 8, 7, 5, 0];
  const maxH = 90;
  return (
    <svg viewBox={`0 0 ${days.length * 38} ${maxH + 20}`} className="w-full">
      {[0, 25, 50, 75, 100].map(v => (
        <line key={v} x1="0" y1={maxH - (v / 100) * maxH} x2={days.length * 38} y2={maxH - (v / 100) * maxH}
          stroke="#f1f5f9" strokeWidth="1" />
      ))}
      {days.map((d, i) => {
        const wh = Math.round((wBars[i] / 50) * maxH);
        const sh = Math.round((sBars[i] / 12) * maxH);
        return (
          <g key={i}>
            <rect x={i * 38 + 4} y={maxH - wh} width="14" height={wh} rx="3" fill="#2563eb" opacity="0.8" />
            <rect x={i * 38 + 20} y={maxH - sh} width="14" height={sh} rx="3" fill="#22c55e" opacity="0.8" />
            <text x={i * 38 + 18} y={maxH + 12} textAnchor="middle" fontSize="7" fill="#94a3b8">{d}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function ExpenseChart({ trend, months }) {
  const W = 260, H = 90;
  if (!trend || trend.length < 2) return null;
  const pts = trend.map((v, i) => [i * (W / (trend.length - 1)), H - (v / 100) * H]);
  const linePath = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
  const areaPath = linePath + ` L${pts[pts.length - 1][0].toFixed(1)},${H} L0,${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H + 18}`} className="w-full">
      <defs>
        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#expGrad)" />
      <path d={linePath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="3" fill="#2563eb" />)}
      {months.map((m, i) => (
        <text key={i} x={(i * (W / (months.length - 1))).toFixed(1)} y={H + 14} fontSize="7" fill="#94a3b8" textAnchor="middle">{m}</text>
      ))}
    </svg>
  );
}

export function BudgetDonut({ usedPct }) {
  const r = 34, circ = 2 * Math.PI * r;
  const used = (usedPct / 100) * circ;
  const rem = circ - used;
  return (
    <svg width="88" height="88" viewBox="0 0 88 88">
      <circle cx="44" cy="44" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
      <circle cx="44" cy="44" r={r} fill="none" stroke="#2563eb" strokeWidth="12"
        strokeDasharray={`${used.toFixed(1)} ${rem.toFixed(1)}`} transform="rotate(-90 44 44)" />
    </svg>
  );
}

export function TaskDonut({ done, inProg, pend, total }) {
  const circ = 2 * Math.PI * 28;
  const dp = done / total, ip = inProg / total, pp = pend / total;
  const dd = dp * circ, id = ip * circ, pd = pp * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r="28" fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle cx="36" cy="36" r="28" fill="none" stroke="#22c55e" strokeWidth="10"
        strokeDasharray={`${dd.toFixed(1)} ${(circ - dd).toFixed(1)}`} transform="rotate(-90 36 36)" />
      <circle cx="36" cy="36" r="28" fill="none" stroke="#f59e0b" strokeWidth="10"
        strokeDasharray={`${id.toFixed(1)} ${(circ - id).toFixed(1)}`} strokeDashoffset={`-${dd.toFixed(1)}`} transform="rotate(-90 36 36)" />
      <circle cx="36" cy="36" r="28" fill="none" stroke="#ef4444" strokeWidth="10"
        strokeDasharray={`${pd.toFixed(1)} ${(circ - pd).toFixed(1)}`} strokeDashoffset={`-${(dd + id).toFixed(1)}`} transform="rotate(-90 36 36)" />
    </svg>
  );
}

export function WorkforceDonut({ labours, staff }) {
  const total = labours + staff;
  const circ = 2 * Math.PI * 30;
  const labourDash = (labours / total) * circ;
  const staffDash = (staff / total) * circ;
  return (
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="30" fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle cx="40" cy="40" r="30" fill="none" stroke="#2563eb" strokeWidth="10"
        strokeDasharray={`${labourDash.toFixed(1)} ${(circ - labourDash).toFixed(1)}`} transform="rotate(-90 40 40)" />
      <circle cx="40" cy="40" r="30" fill="none" stroke="#22c55e" strokeWidth="10"
        strokeDasharray={`${staffDash.toFixed(1)} ${(circ - staffDash).toFixed(1)}`}
        strokeDashoffset={`-${labourDash.toFixed(1)}`} transform="rotate(-90 40 40)" />
    </svg>
  );
}
