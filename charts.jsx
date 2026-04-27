// charts.jsx — animated SVG chart primitives

function useTicker(intervalMs = 1500) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}

// Sparkline — area + line, accent color, smooths.
function Sparkline({ data, w = 80, h = 28, color = "var(--accent)", fill = true, stroke = 1.5 }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [i * step, h - 3 - ((v - min) / range) * (h - 6)]);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const id = React.useId();
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sp-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#sp-${id})`} />}
      <path d={path} stroke={color} strokeWidth={stroke} fill="none" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

// Big chart — supports line / area / candle. Animated via data prop.
function PerformanceChart({ data, mode = "area", w = 760, h = 280, color = "var(--accent)" }) {
  const padL = 38, padR = 8, padT = 16, padB = 28;
  const cw = w - padL - padR;
  const ch = h - padT - padB;
  const min = Math.min(...data.map(d => d.lo ?? d.v));
  const max = Math.max(...data.map(d => d.hi ?? d.v));
  const range = max - min || 1;
  const step = cw / (data.length - 1);

  const yPad = range * 0.08;
  const yMin = min - yPad;
  const yMax = max + yPad;
  const yRange = yMax - yMin;
  const Y = (v) => padT + ch - ((v - yMin) / yRange) * ch;
  const X = (i) => padL + i * step;

  const ticks = 5;
  const yTicks = Array.from({ length: ticks }, (_, i) => yMin + (i / (ticks - 1)) * yRange);

  const id = React.useId();

  if (mode === "line" || mode === "area") {
    const pts = data.map((d, i) => [X(i), Y(d.v)]);
    const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
    const area = `${path} L${X(data.length - 1)},${padT + ch} L${X(0)},${padT + ch} Z`;
    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`pc-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* gridlines */}
        {yTicks.map((t, i) => (
          <line key={i} x1={padL} x2={w - padR} y1={Y(t)} y2={Y(t)}
                stroke="var(--glass-border)" strokeWidth="1"
                strokeDasharray={i === 0 ? "0" : "2 4"} opacity={i === 0 ? 1 : 0.7}/>
        ))}
        {/* y labels */}
        {yTicks.map((t, i) => (
          <text key={i} x={padL - 6} y={Y(t)} dy="3.5" textAnchor="end"
                fill="var(--text-3)" fontSize="10" style={{ fontVariantNumeric: 'tabular-nums' }}>
            ${t >= 1000 ? (t/1000).toFixed(1) + 'k' : t.toFixed(0)}
          </text>
        ))}
        {/* x labels */}
        {data.map((d, i) => (i % Math.ceil(data.length / 7) === 0) && (
          <text key={i} x={X(i)} y={h - 8} textAnchor="middle"
                fill="var(--text-3)" fontSize="10">{d.t}</text>
        ))}
        {mode === "area" && <path d={area} fill={`url(#pc-${id})`} style={{ transition: 'd .6s' }}/>}
        <path d={path} stroke={color} strokeWidth="2" fill="none"
              strokeLinejoin="round" strokeLinecap="round" style={{ transition: 'd .6s' }}/>
        {/* last point dot */}
        <circle cx={X(data.length-1)} cy={Y(data[data.length-1].v)} r="4" fill={color}
                style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
          <animate attributeName="r" values="4;6;4" dur="1.6s" repeatCount="indefinite"/>
        </circle>
      </svg>
    );
  }

  // candle
  const cw2 = step * 0.6;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block', overflow: 'visible' }}>
      {yTicks.map((t, i) => (
        <line key={i} x1={padL} x2={w - padR} y1={Y(t)} y2={Y(t)}
              stroke="var(--glass-border)" strokeWidth="1"
              strokeDasharray={i === 0 ? "0" : "2 4"} opacity={i === 0 ? 1 : 0.7}/>
      ))}
      {yTicks.map((t, i) => (
        <text key={i} x={padL - 6} y={Y(t)} dy="3.5" textAnchor="end"
              fill="var(--text-3)" fontSize="10">
          ${t >= 1000 ? (t/1000).toFixed(1) + 'k' : t.toFixed(0)}
        </text>
      ))}
      {data.map((d, i) => {
        const up = (d.c ?? d.v) >= (d.o ?? d.v);
        const c = up ? "var(--profit)" : "var(--loss)";
        const x = X(i);
        const yO = Y(d.o ?? d.v);
        const yC = Y(d.c ?? d.v);
        const top = Math.min(yO, yC);
        const hgt = Math.max(2, Math.abs(yC - yO));
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={Y(d.hi ?? d.v)} y2={Y(d.lo ?? d.v)} stroke={c} strokeWidth="1"/>
            <rect x={x - cw2/2} y={top} width={cw2} height={hgt} fill={c} rx="1"/>
          </g>
        );
      })}
      {data.map((d, i) => (i % Math.ceil(data.length / 7) === 0) && (
        <text key={i} x={X(i)} y={h - 8} textAnchor="middle"
              fill="var(--text-3)" fontSize="10">{d.t}</text>
      ))}
    </svg>
  );
}

// Donut chart — animates on mount.
function Donut({ slices, size = 160, thick = 18, centerLabel, centerValue }) {
  const total = slices.reduce((s, sl) => s + sl.v, 0) || 1;
  const r = (size - thick) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
                stroke="var(--glass-border)" strokeWidth={thick}/>
        {slices.map((sl, i) => {
          const len = (sl.v / total) * c;
          const off = c - acc;
          acc += len;
          return (
            <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
                    stroke={sl.color} strokeWidth={thick}
                    strokeDasharray={`${len} ${c - len}`}
                    strokeDashoffset={off}
                    strokeLinecap="butt"
                    style={{ transition: 'stroke-dasharray .6s, stroke-dashoffset .6s' }}/>
          );
        })}
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'grid', placeContent: 'center', textAlign: 'center'
      }}>
        <div style={{ fontSize: 10.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>{centerLabel}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{centerValue}</div>
      </div>
    </div>
  );
}

// Bar group (for win/loss distribution)
function MiniBars({ data, w = 200, h = 40, color = "var(--accent)" }) {
  const max = Math.max(...data) || 1;
  const bw = w / data.length;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {data.map((v, i) => {
        const bh = (v / max) * (h - 4);
        return (
          <rect key={i} x={i * bw + 1} y={h - bh} width={bw - 2} height={bh}
                fill={color} opacity={0.4 + 0.6 * (v / max)} rx="1"
                style={{ transition: 'height .4s, y .4s' }}/>
        );
      })}
    </svg>
  );
}

Object.assign(window, { Sparkline, PerformanceChart, Donut, MiniBars, useTicker });
