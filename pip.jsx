// pip.jsx — picture-in-picture floating monitor (uses existing site classes)

const PIP_TABS = [
  { id: 'traders',   label: 'Top Traders',     ico: 'Traders' },
  { id: 'positions', label: 'Live Positions',  ico: 'Trend' },
  { id: 'tx',        label: 'Transactions',    ico: 'Bolt' },
  { id: 'monitor',   label: 'Monitor',         ico: 'Eye' },
];

function PipWindow({ open, onClose, onOpenTrader }) {
  const [tab, setTab] = React.useState('traders');
  const [collapsed, setCollapsed] = React.useState(false);
  const [pos, setPos] = React.useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('pt-pip') || 'null');
      if (s && typeof s.x === 'number') return s;
    } catch (e) {}
    const w = 360, h = 480;
    const x = Math.max(8, (window.innerWidth || 1400) - w - 24);
    const y = 96;
    return { x, y, w, h };
  });
  const tick = useTicker(2200);

  React.useEffect(() => {
    localStorage.setItem('pt-pip', JSON.stringify(pos));
  }, [pos]);

  const [positions, setPositions] = React.useState(POSITIONS);
  const [flashId, setFlashId] = React.useState(null);
  React.useEffect(() => {
    if (tick === 0) return;
    const idx = Math.floor(Math.random() * positions.length);
    setPositions(prev => prev.map((p, i) => {
      if (i !== idx) return p;
      const nudge = (Math.random() - 0.45) * 0.025;
      const last = Math.max(0.02, Math.min(0.98, p.last + nudge));
      const pnl = (last - p.avg) * p.shares * (p.side === 'YES' ? 1 : -1);
      return { ...p, last: +last.toFixed(2), pnl: +pnl.toFixed(1) };
    }));
    setFlashId(positions[idx].id);
    setTimeout(() => setFlashId(null), 800);
  }, [tick]);

  const [txs, setTxs] = React.useState(TXS_SEED.slice(0, 6));
  React.useEffect(() => {
    if (tick === 0) return;
    if (tick % 2 !== 0) return;
    const traderId = pickTraderId();
    const id = `pip-tx-${Date.now()}`;
    const newTx = {
      id,
      traderId,
      kind: ['buy','sell','buy','send'][Math.floor(Math.random()*4)],
      market: ['BTC > $200k Q4','Fed rate cut Sept','GPT-6 in 2026','Lakers Win 2026','Tesla Optimus v2','Apple M5 MBP'][Math.floor(Math.random()*6)],
      amount: Math.floor(Math.random() * 1500) + 100,
      shares: +(Math.random() * 30).toFixed(1),
      time: 0, isNew: true,
      hash: makeHash(id + traderId),
    };
    setTxs(prev => [newTx, ...prev.slice(0, 5)]);
  }, [tick]);

  const startDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const startPos = { ...pos };
    const move = (ev) => {
      const w = collapsed ? 240 : pos.w;
      const h = collapsed ? 44 : pos.h;
      const nx = Math.max(8, Math.min(window.innerWidth - w - 8, startPos.x + (ev.clientX - startX)));
      const ny = Math.max(8, Math.min(window.innerHeight - h - 8, startPos.y + (ev.clientY - startY)));
      setPos(p => ({ ...p, x: nx, y: ny }));
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  const startResize = (e) => {
    e.preventDefault(); e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const startPos = { ...pos };
    const move = (ev) => {
      const nw = Math.max(300, Math.min(640, startPos.w + (ev.clientX - startX)));
      const nh = Math.max(280, Math.min(720, startPos.h + (ev.clientY - startY)));
      setPos(p => ({ ...p, w: nw, h: nh }));
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  if (!open) return null;

  // Inline shell styles match site's glass/card system exactly
  const shellStyle = {
    position: 'fixed',
    left: pos.x,
    top: pos.y,
    width: collapsed ? 240 : pos.w,
    height: collapsed ? 44 : pos.h,
    zIndex: 90,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 16,
    background: 'linear-gradient(180deg, color-mix(in oklab, var(--elevated) 94%, transparent), color-mix(in oklab, var(--surface) 94%, transparent))',
    border: '1px solid var(--glass-border-strong)',
    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
    backdropFilter: 'blur(24px) saturate(160%)',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 40px color-mix(in oklab, var(--accent) 14%, transparent)',
    fontFamily: 'var(--font-body)',
    color: 'var(--text)',
  };

  const headerStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: 38, padding: '0 8px 0 14px', cursor: 'move', userSelect: 'none',
    borderBottom: '1px solid var(--glass-border)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.04), transparent)',
    flexShrink: 0,
  };

  const tabsStyle = {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    borderBottom: '1px solid var(--glass-border)',
    background: 'rgba(0,0,0,0.18)',
    flexShrink: 0,
  };

  const tabBtn = (active) => ({
    appearance: 'none',
    background: active ? 'color-mix(in oklab, var(--accent) 10%, transparent)' : 'transparent',
    border: 0,
    color: active ? 'var(--text)' : 'var(--text-3)',
    padding: '9px 4px',
    fontFamily: 'var(--font-body)',
    fontSize: 10.5,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    borderBottom: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
    marginBottom: -1,
    transition: 'color .15s, background .15s, border-color .15s',
  });

  const bodyStyle = { flex: 1, overflowY: 'auto', minHeight: 0 };

  const rowStyle = {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px', borderBottom: '1px solid var(--glass-border)',
    fontSize: 12, transition: 'background .15s',
  };

  const closeBtnStyle = {
    appearance: 'none', width: 26, height: 26, border: 0, background: 'transparent',
    color: 'var(--text-3)', borderRadius: 7, cursor: 'pointer',
    display: 'grid', placeItems: 'center', fontSize: 12,
    transition: 'background .15s, color .15s',
  };

  return (
    <div style={shellStyle}>
      {/* Header */}
      <div style={headerStyle} onMouseDown={startDrag}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600 }}>
          <span className="live-dot"/>
          <strong style={{ fontWeight: 600, fontFamily: 'var(--font-display)', letterSpacing: '-0.005em' }}>
            {collapsed ? 'PolyTracker · LIVE' : 'Live Monitor'}
          </strong>
          {!collapsed && <span className="chip" style={{ height: 18, padding: '0 6px', fontSize: 9.5 }}>{positions.length} open</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }} onMouseDown={(e) => e.stopPropagation()}>
          <button style={closeBtnStyle} title={collapsed ? 'Expand' : 'Collapse'}
                  onClick={() => setCollapsed(c => !c)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--glass-fill-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}>
            {collapsed ? <Icon.Up size={12}/> : <Icon.Down size={12}/>}
          </button>
          <button style={closeBtnStyle} title="Close" onClick={onClose}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'color-mix(in oklab, var(--loss) 18%, transparent)'; e.currentTarget.style.color = 'var(--loss)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}>
            ✕
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Tabs */}
          <div style={tabsStyle}>
            {PIP_TABS.map(pt => {
              const Ic = Icon[pt.ico];
              const active = tab === pt.id;
              return (
                <button key={pt.id} style={tabBtn(active)} onClick={() => setTab(pt.id)} title={pt.label}
                        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'var(--glass-fill)'; } }}
                        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent'; } }}>
                  <Ic size={13}/>
                  <span style={{ fontSize: 10, whiteSpace: 'nowrap' }}>{pt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div style={bodyStyle}>
            {tab === 'traders' && (
              <div>
                {TRADERS.slice(0, 6).map((t, i) => (
                  <div key={t.id} style={rowStyle}
                       onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-fill-hover)'}
                       onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ font: '700 11px var(--font-display)', color: 'var(--text-3)', width: 18, fontVariantNumeric: 'tabular-nums' }}>#{i+1}</div>
                    <div className={`trader-avatar ${t.online ? 'online' : ''}`}
                         style={{ width: 28, height: 28, fontSize: 10,
                                  background: `linear-gradient(135deg, ${t.color}, color-mix(in oklab, ${t.color} 60%, #000))` }}>
                      {t.name.slice(0,2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.25 }}>{t.name}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 1 }}>{fmt.num(t.copiers)} copiers</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className={`mono ${t.roi >= 0 ? 'up' : 'dn'}`} style={{ fontWeight: 700, fontSize: 12 }}>{fmt.pct(t.roi)}</div>
                      <div className={`mono ${t.pnl >= 0 ? 'up' : 'dn'}`} style={{ fontSize: 10.5, opacity: .85 }}>{fmt.usd(t.pnl, { compact: true })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'positions' && (
              <div>
                {positions.map(p => (
                  <div key={p.id} className={flashId === p.id ? (p.pnl >= 0 ? 'flash-up' : 'flash-dn') : ''}
                       style={rowStyle}
                       onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-fill-hover)'}
                       onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <span className={`chip ${p.side === 'YES' ? 'up' : 'dn'}`} style={{ height: 20, padding: '0 7px', fontSize: 10 }}>{p.side}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.market}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 1 }}>{fmt.num(p.shares)} sh · avg {(p.avg*100).toFixed(0)}¢</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{(p.last*100).toFixed(0)}¢</div>
                      <div className={`mono ${p.pnl >= 0 ? 'up' : 'dn'}`} style={{ fontSize: 10.5, fontWeight: 600 }}>{p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(1)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === 'tx' && (
              <div>
                {txs.map((tx, i) => {
                  const trader = lookupTrader(tx);
                  const ic = tx.kind === 'buy' ? <Icon.ArrowDnRt size={12}/> :
                             tx.kind === 'sell' ? <Icon.ArrowUpRt size={12}/> :
                             <Icon.Send size={12}/>;
                  const color = tx.kind === 'buy' ? 'var(--profit)' : tx.kind === 'sell' ? 'var(--loss)' : 'var(--text-2)';
                  const clickable = !!(trader && onOpenTrader);
                  return (
                    <div key={tx.id}
                         className={tx.isNew && i === 0 ? 'fade-up' : ''}
                         style={{ ...rowStyle, cursor: clickable ? 'pointer' : 'default' }}
                         title={trader ? `View ${trader.name}'s profile` : ''}
                         onClick={() => clickable && onOpenTrader(trader.id)}
                         onMouseEnter={(e) => e.currentTarget.style.background = 'var(--glass-fill-hover)'}
                         onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      {trader ? (
                        <div className={`trader-avatar ${trader.online ? 'online' : ''}`}
                             style={{ width: 28, height: 28, fontSize: 9.5, flexShrink: 0,
                                      background: `linear-gradient(135deg, ${trader.color}, color-mix(in oklab, ${trader.color} 60%, #000))` }}>
                          {trader.name.slice(0,2).toUpperCase()}
                        </div>
                      ) : (
                        <div style={{
                          width: 28, height: 28, borderRadius: 8, display: 'grid', placeContent: 'center',
                          background: 'var(--glass-fill)', border: '1px solid var(--glass-border)', color, flexShrink: 0,
                        }}>{ic}</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', lineHeight: 1.25, display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', color }}>{ic}</span>
                          <span>{trader ? trader.name : 'Unknown'}</span>
                        </div>
                        <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'capitalize' }}>
                          {tx.kind} · {tx.market}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="mono" style={{ fontWeight: 700, fontSize: 12 }}>{fmt.usd(tx.amount, { compact: true })}</div>
                        <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-3)', marginTop: 1 }}>{tx.hash ? `${tx.hash.slice(0, 8)}…` : 'just now'}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'monitor' && (
              <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="stat">
                  <div className="l">Portfolio</div>
                  <div className="v">{fmt.usd(275906, { compact: true })}</div>
                  <div className="up mono" style={{ fontSize: 10.5, fontWeight: 600, marginTop: 2 }}>+4.21% · 24h</div>
                </div>
                <div className="stat">
                  <div className="l">Open P&L</div>
                  <div className="v up">+{fmt.usd(401)}</div>
                  <div className="muted mono" style={{ fontSize: 10.5, marginTop: 2 }}>{positions.length} positions</div>
                </div>
                <div className="stat" style={{ gridColumn: '1 / -1' }}>
                  <div className="l">Live activity</div>
                  <div style={{ marginTop: 6 }}>
                    <Sparkline data={makeSeries(40, { start: 100, drift: 0.4, vol: 2.5, seed: tick + 17 })}
                               w={pos.w - 76} h={48}/>
                  </div>
                </div>
                <div style={{
                  gridColumn: '1 / -1',
                  padding: '12px 14px', borderRadius: 10,
                  background: 'var(--glass-fill)', border: '1px solid var(--glass-border)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <div className="l" style={{
                    fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '.08em',
                    color: 'var(--text-3)', fontWeight: 600,
                  }}>Alerts</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--text-2)' }}>
                    <span className="live-dot"/>
                    <span><strong style={{ color: 'var(--text)' }}>DiamondHand</strong> opened <span className="up" style={{ fontWeight: 600 }}>YES</span> · Fed rate cut · <span className="mono">$4,200</span></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--text-2)' }}>
                    <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)', flexShrink: 0 }}/>
                    <span>Position <strong style={{ color: 'var(--text)' }}>BTC &gt; $200k Q4</strong> moved <span className="up" style={{ fontWeight: 600 }}>+8%</span></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--text-3)' }}>
                    <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: 'var(--text-3)', flexShrink: 0 }}/>
                    <span>2 markets resolve in &lt; 24h</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resize handle */}
          <div onMouseDown={startResize} title="Drag to resize"
               style={{
                 position: 'absolute', bottom: 0, right: 0, width: 16, height: 16,
                 cursor: 'nwse-resize', color: 'var(--text-3)',
                 display: 'grid', placeItems: 'end center',
                 padding: '0 2px 2px 0', opacity: .6,
               }}
               onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--text)'; }}
               onMouseLeave={(e) => { e.currentTarget.style.opacity = .6; e.currentTarget.style.color = 'var(--text-3)'; }}>
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M1 9 L9 1 M5 9 L9 5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>
          </div>
        </>
      )}
    </div>
  );
}

function PipTrigger({ onClick }) {
  return (
    <button onClick={onClick} title="Open Live Monitor"
            style={{
              position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              zIndex: 90, display: 'flex', alignItems: 'center', gap: 8,
              height: 36, padding: '0 14px', borderRadius: 999,
              background: 'linear-gradient(180deg, var(--elevated), var(--surface))',
              border: '1px solid var(--glass-border-strong)',
              color: 'var(--text)',
              font: '600 12px var(--font-body)',
              cursor: 'pointer',
              boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 0 24px color-mix(in oklab, var(--accent) 18%, transparent)',
              transition: 'transform .15s, box-shadow .15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(-50%) translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateX(-50%)'; }}>
      <span className="live-dot"/>
      <span>Live Monitor</span>
      <Icon.Up size={12}/>
    </button>
  );
}

window.PipWindow = PipWindow;
window.PipTrigger = PipTrigger;
