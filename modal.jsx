// modal.jsx — copy trader modal + trade modal

function CopyTraderModal({ trader, onClose }) {
  const [amount, setAmount] = React.useState(2500);
  const [step, setStep] = React.useState('configure');

  if (!trader) return null;

  const handleConfirm = () => {
    setStep('processing');
    setTimeout(() => setStep('done'), 1400);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <div>
            <div className="row" style={{ gap: 10, marginBottom: 6 }}>
              <TraderAvatar t={trader} size={36}/>
              <div>
                <h2>Copy {trader.name}</h2>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{trader.handle}</div>
              </div>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {step === 'configure' && (
          <>
            <div className="modal-bd">
              <div className="stat-grid" style={{ marginBottom: 16 }}>
                <div className="stat"><div className="l">30D ROI</div><div className={`v ${trader.roi >= 0 ? 'up' : 'dn'}`}>{fmt.pct(trader.roi)}</div></div>
                <div className="stat"><div className="l">Win Rate</div><div className="v">{trader.win}%</div></div>
              </div>

              <div className="input-group">
                <label>Allocation per copied trade</label>
                <div className="input-amt">
                  <input type="number" value={amount} onChange={(e) => setAmount(+e.target.value || 0)}/>
                  <span className="unit">USD</span>
                </div>
              </div>

              <div className="input-group">
                <label>Quick presets</label>
                <div className="row" style={{ gap: 8 }}>
                  {[500, 1000, 2500, 5000, 10000].map(p => (
                    <button key={p} className="btn btn-sm" data-active={amount === p ? 1 : 0}
                            onClick={() => setAmount(p)}
                            style={amount === p ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : null}>
                      ${p.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="input-group">
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Auto-stop on drawdown</span>
                  <span className="mono" style={{ fontWeight: 600 }}>−15%</span>
                </div>
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Mirror SELL orders</span>
                  <Toggle v/>
                </div>
                <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-2)' }}>Notify on each fill</span>
                  <Toggle v/>
                </div>
              </div>

              <div style={{
                padding: 12, borderRadius: 10, fontSize: 11.5, color: 'var(--text-2)',
                background: 'color-mix(in oklab, var(--accent) 8%, transparent)',
                border: '1px solid color-mix(in oklab, var(--accent) 25%, transparent)',
                lineHeight: 1.5,
              }}>
                <Icon.Shield size={14} style={{ marginRight: 6, verticalAlign: -2, color: 'var(--accent)' }}/>
                Copies execute from your hot wallet. You can pause or unwind at any time. 0.5% protocol fee on profitable copies.
              </div>
            </div>
            <div className="modal-ft">
              <button className="btn" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                <Icon.Copy size={14}/> Start Copying · ${amount.toLocaleString()}/trade
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="modal-bd" style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>
              <span className="live-dot" style={{ width: 14, height: 14 }}/>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600 }}>Submitting to chain…</div>
            <p style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 6 }}>Signing copy authorization · this takes ~2 seconds</p>
          </div>
        )}

        {step === 'done' && (
          <>
            <div className="modal-bd" style={{ padding: '32px 24px', textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
                display: 'grid', placeContent: 'center',
                background: 'color-mix(in oklab, var(--profit) 18%, transparent)',
                border: '1px solid color-mix(in oklab, var(--profit) 40%, transparent)',
                color: 'var(--profit)',
              }}>
                <Icon.Star size={26}/>
              </div>
              <h2 style={{ margin: '0 0 6px', fontFamily: 'var(--font-display)', fontSize: 20 }}>You're copying {trader.name}</h2>
              <p style={{ color: 'var(--text-2)', fontSize: 13, margin: 0 }}>
                Future trades will mirror to your wallet at ${amount.toLocaleString()} per position.
              </p>
            </div>
            <div className="modal-ft">
              <button className="btn btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TradeModal({ market, side: initialSide, onClose }) {
  const [side, setSide] = React.useState(initialSide || 'YES');
  const [amount, setAmount] = React.useState(100);
  if (!market) return null;
  const price = side === 'YES' ? market.yes : 100 - market.yes;
  const shares = amount / (price / 100);
  const payout = shares * 1;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-hd">
          <div>
            <span className="chip accent" style={{ marginBottom: 8 }}>{market.cat}</span>
            <h2 style={{ marginTop: 6 }}>{market.q}</h2>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>Resolves {market.ends} · {market.traders} traders · ${market.vol}M volume</div>
          </div>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-bd">
          <div className="input-group">
            <label>Outcome</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button className="bet-btn yes" data-active={side === 'YES'}
                      style={side === 'YES' ? { borderColor: 'var(--profit)', color: 'var(--profit)', background: 'color-mix(in oklab, var(--profit) 10%, transparent)' } : null}
                      onClick={() => setSide('YES')}>
                <span>YES</span><span className="pct">{market.yes}¢</span>
              </button>
              <button className="bet-btn no" data-active={side === 'NO'}
                      style={side === 'NO' ? { borderColor: 'var(--loss)', color: 'var(--loss)', background: 'color-mix(in oklab, var(--loss) 10%, transparent)' } : null}
                      onClick={() => setSide('NO')}>
                <span>NO</span><span className="pct">{100 - market.yes}¢</span>
              </button>
            </div>
          </div>
          <div className="input-group">
            <label>Amount</label>
            <div className="input-amt">
              <input type="number" value={amount} onChange={(e) => setAmount(+e.target.value || 0)}/>
              <span className="unit">USDC</span>
            </div>
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              {[10, 50, 100, 500, 1000].map(p => (
                <button key={p} className="btn btn-sm" onClick={() => setAmount(p)}>${p}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 6, padding: 12, borderRadius: 10, background: 'var(--glass-fill)', border: '1px solid var(--glass-border)' }}>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
              <span className="muted">Avg price</span><span className="mono" style={{ fontWeight: 600 }}>{price.toFixed(0)}¢</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
              <span className="muted">Shares</span><span className="mono" style={{ fontWeight: 600 }}>{shares.toFixed(2)}</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
              <span className="muted">Max payout</span><span className="mono up" style={{ fontWeight: 600 }}>{fmt.usd(payout)}</span>
            </div>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
              <span className="muted">Potential profit</span><span className="mono up" style={{ fontWeight: 600 }}>{fmt.usd(payout - amount)}</span>
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">
            Buy {side} · ${amount}
          </button>
        </div>
      </div>
    </div>
  );
}

window.CopyTraderModal = CopyTraderModal;
window.TradeModal = TradeModal;
