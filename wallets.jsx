// wallets.jsx — wallets full screen with positions watchlist + transactions

function WalletsScreen({ onOpenTrader }) {
  const [tab, setTab] = React.useState('positions');
  const tick = useTicker(2400);
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

  const total = WALLETS.reduce((s, w) => s + w.balance, 0);

  return (
    <div className="content">
      <div className="col-main">
        <div className="page-title">
          <div>
            <h1>Wallets &amp; Positions</h1>
            <p>Track on-chain balances and open prediction-market positions across all your wallets</p>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <button className="btn"><Icon.Eye size={14}/> Privacy mode</button>
            <button className="btn btn-primary"><Icon.Plus size={14}/> Connect Wallet</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {WALLETS.map(w => (
            <div key={w.id} className="glass" style={{ padding: 18 }}>
              <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div className={`chain-icon ${w.chain}`} style={{ width: 36, height: 36, fontSize: 14 }}>
                  {w.chain === 'eth' ? 'Ξ' : w.chain === 'poly' ? '◈' : w.chain === 'base' ? 'B' : '◎'}
                </div>
                <span className={`chip ${w.delta >= 0 ? 'up' : 'dn'}`}>{fmt.pct(w.delta)}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>{w.name}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{fmt.usd(w.balance, { compact: true })}</div>
              <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-3)', marginTop: 4 }}>{w.addr} · {w.tokens} tokens</div>
            </div>
          ))}
        </div>

        <div className="glass">
          <div className="card-hd">
            <div className="tabs" style={{ marginBottom: 0, border: 0 }}>
              {[
                { id: 'positions', l: 'Open Positions' },
                { id: 'tx', l: 'Transactions' },
                { id: 'tokens', l: 'Tokens' },
              ].map(t => (
                <button key={t.id} data-active={tab === t.id ? 1 : 0} onClick={() => setTab(t.id)}>{t.l}</button>
              ))}
            </div>
            <span className="chip"><span className="live-dot"/>Updating live</span>
          </div>

          {tab === 'positions' && (
            <table className="tbl">
              <thead>
                <tr><th>Market</th><th>Side</th><th>Shares</th><th>Avg</th><th>Last</th><th>P&L</th><th>Sparkline</th></tr>
              </thead>
              <tbody>
                {positions.map(p => (
                  <tr key={p.id} className={flashId === p.id ? (p.pnl >= 0 ? 'flash-up' : 'flash-dn') : ''}>
                    <td>{p.market}</td>
                    <td><span className={`chip ${p.side === 'YES' ? 'up' : 'dn'}`}>{p.side}</span></td>
                    <td className="mono">{fmt.num(p.shares)}</td>
                    <td className="mono">{(p.avg * 100).toFixed(0)}¢</td>
                    <td className="mono" style={{ fontWeight: 600 }}>{(p.last * 100).toFixed(0)}¢</td>
                    <td className={`mono ${p.pnl >= 0 ? 'up' : 'dn'}`} style={{ fontWeight: 600 }}>{p.pnl >= 0 ? '+' : ''}{p.pnl.toFixed(1)}</td>
                    <td><div className="spark-cell"><Sparkline data={makeSeries(20, { start: p.avg * 100, drift: (p.last - p.avg) * 5, vol: 1.5, seed: p.shares })} color={p.pnl >= 0 ? 'var(--profit)' : 'var(--loss)'}/></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'tx' && (
            <table className="tbl">
              <thead>
                <tr><th>Type</th><th>Trader</th><th>Description</th><th>Amount</th><th>Status</th><th>Time</th><th>Hash</th></tr>
              </thead>
              <tbody>
                {TXS_SEED.map((tx, i) => {
                  const trader = lookupTrader(tx);
                  const clickable = !!(trader && onOpenTrader);
                  return (
                    <tr key={tx.id} className={clickable ? 'row-int' : ''}
                        onClick={() => clickable && onOpenTrader(trader.id)}
                        title={trader ? `View ${trader.name}'s profile` : ''}>
                      <td><span className={`chip ${tx.kind === 'buy' ? 'up' : tx.kind === 'sell' ? 'dn' : ''}`} style={{ textTransform: 'capitalize' }}>{tx.kind}</span></td>
                      <td>
                        {trader ? (
                          <div className="trader-cell">
                            <div className={`trader-avatar ${trader.online ? 'online' : ''}`}
                                 style={{ width: 28, height: 28, fontSize: 10,
                                          background: `linear-gradient(135deg, ${trader.color}, color-mix(in oklab, ${trader.color} 60%, #000))` }}>
                              {trader.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="trader-name">
                              {trader.name}
                              <small className="mono">{trader.handle}</small>
                            </div>
                          </div>
                        ) : <span className="muted">—</span>}
                      </td>
                      <td>{tx.market}</td>
                      <td className="mono" style={{ fontWeight: 600 }}>{fmt.usd(tx.amount, { dp: 0 })}</td>
                      <td><span className="chip up">confirmed</span></td>
                      <td className="muted">{fmt.rel(tx.time + i * 60)}</td>
                      <td className="mono muted" style={{ whiteSpace: 'nowrap' }}>{tx.hash.slice(0, 10)}…</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {tab === 'tokens' && (
            <table className="tbl">
              <thead>
                <tr><th>Token</th><th>Chain</th><th>Balance</th><th>Price</th><th>Value</th><th>24h</th></tr>
              </thead>
              <tbody>
                {[
                  { sym: 'ETH', name: 'Ethereum', chain: 'eth',  bal: 42.84,  price: 3210, d: 2.1 },
                  { sym: 'USDC', name: 'USD Coin', chain: 'eth',  bal: 84200,  price: 1, d: 0.01 },
                  { sym: 'MATIC', name: 'Polygon', chain: 'poly', bal: 12420,  price: 1.18, d: -1.4 },
                  { sym: 'WBTC', name: 'Wrapped BTC', chain: 'eth',  bal: 0.84, price: 108200, d: 3.2 },
                  { sym: 'SOL',  name: 'Solana', chain: 'sol',  bal: 142.3,  price: 184, d: 5.4 },
                  { sym: 'DAI',  name: 'Dai', chain: 'eth', bal: 28100, price: 1, d: -0.02 },
                ].map((tk, i) => (
                  <tr key={i}>
                    <td>
                      <div className="trader-cell">
                        <div className={`chain-icon ${tk.chain}`} style={{ width: 28, height: 28, fontSize: 11 }}>{tk.sym.slice(0,1)}</div>
                        <div className="trader-name">{tk.sym}<small>{tk.name}</small></div>
                      </div>
                    </td>
                    <td className="muted" style={{ textTransform: 'uppercase' }}>{tk.chain}</td>
                    <td className="mono">{fmt.num(tk.bal)}</td>
                    <td className="mono">{fmt.usd(tk.price)}</td>
                    <td className="mono" style={{ fontWeight: 600 }}>{fmt.usd(tk.bal * tk.price, { compact: true })}</td>
                    <td className={`mono ${tk.d >= 0 ? 'up' : 'dn'}`} style={{ fontWeight: 600 }}>{fmt.pct(tk.d)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsScreen({ tweakValues, setTweak }) {
  return (
    <div className="content">
      <div className="col-main">
        <div className="page-title">
          <div><h1>Settings</h1><p>Account, security, and copy-trading preferences</p></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="glass">
            <div className="card-hd"><div><h3>Account</h3></div></div>
            <div className="card-bd" style={{ display: 'grid', gap: 14 }}>
              <SettingRow l="Display name" v="Jess M."/>
              <SettingRow l="Email" v="jess@polytracker.io"/>
              <SettingRow l="Primary wallet" v="0x7c…4e1f" mono/>
              <SettingRow l="Default chain" v="Ethereum"/>
              <SettingRow l="Two-factor auth" right={<span className="chip up">Enabled</span>}/>
            </div>
          </div>
          <div className="glass">
            <div className="card-hd"><div><h3>Copy Trading</h3></div></div>
            <div className="card-bd" style={{ display: 'grid', gap: 14 }}>
              <SettingRow l="Max copy size per trade" v="$2,500"/>
              <SettingRow l="Daily copy budget" v="$10,000"/>
              <SettingRow l="Auto-stop on drawdown" v="−15%"/>
              <SettingRow l="Mirror SELL orders" right={<Toggle v/>}/>
              <SettingRow l="Notify on copy fill" right={<Toggle v/>}/>
            </div>
          </div>
          <div className="glass" style={{ gridColumn: '1 / -1' }}>
            <div className="card-hd"><div><h3>Notifications</h3></div></div>
            <div className="card-bd" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <SettingRow l="Trader enters new position" right={<Toggle v/>}/>
              <SettingRow l="Position resolves" right={<Toggle v/>}/>
              <SettingRow l="Price moves > 10%" right={<Toggle v/>}/>
              <SettingRow l="Wallet receives transfer" right={<Toggle/>}/>
              <SettingRow l="Weekly performance digest" right={<Toggle v/>}/>
              <SettingRow l="Marketing & news" right={<Toggle/>}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ l, v, mono, right }) {
  return (
    <div className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--glass-border)' }}>
      <span style={{ fontSize: 12.5, color: 'var(--text-2)' }}>{l}</span>
      {right ? right : <span className={mono ? 'mono' : ''} style={{ fontSize: 12.5, fontWeight: 600 }}>{v}</span>}
    </div>
  );
}

function Toggle({ v: initial }) {
  const [v, setV] = React.useState(!!initial);
  return <div className="pill-toggle" data-on={v ? 1 : 0} onClick={() => setV(!v)}><i/></div>;
}

window.WalletsScreen = WalletsScreen;
window.SettingsScreen = SettingsScreen;
