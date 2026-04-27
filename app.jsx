// app.jsx — root app, routing, tweaks integration

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "chartMode": "area",
  "accent": "#FF6A00",
  "sidebarMode": "expanded",
  "showWalletPanel": true,
  "theme": "dark",
  "pipOpen": true
}/*EDITMODE-END*/;

const ACCENT_PRESETS = {
  "Orange": "#FF6A00",
  "Violet": "#A855F7",
  "Emerald": "#10B981",
  "Cyan": "#06B6D4",
  "Pink": "#EC4899",
};

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState('dashboard');
  const [traderId, setTraderId] = React.useState(null);
  const [copyTrader, setCopyTrader] = React.useState(null);
  const [tradeMarket, setTradeMarket] = React.useState(null);
  const [tradeSide, setTradeSide] = React.useState(null);

  // Apply theme + accent to root
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', t.theme);
    document.documentElement.style.setProperty('--accent', t.accent);
    // derive hover (lighten)
    document.documentElement.style.setProperty('--orange-hover',
      `color-mix(in oklab, ${t.accent} 78%, white)`);
  }, [t.theme, t.accent]);

  const handleOpenTrader = (id) => { setTraderId(id); setRoute('profile'); };
  const handleCopyTrader = (trader) => setCopyTrader(trader);
  const handleTrade = (m, side) => { setTradeMarket(m); setTradeSide(side || 'YES'); };

  const screen = (() => {
    switch (route) {
      case 'dashboard': return <Dashboard chartMode={t.chartMode} showWalletPanel={t.showWalletPanel} onCopyTrader={handleCopyTrader} onOpenTrader={handleOpenTrader}/>;
      case 'traders':   return <TradersScreen onCopyTrader={handleCopyTrader} onOpenTrader={handleOpenTrader}/>;
      case 'profile':   return <TraderProfile traderId={traderId} onBack={() => setRoute('traders')} onCopy={handleCopyTrader}/>;
      case 'markets':   return <MarketsScreen onTrade={handleTrade}/>;
      case 'wallets':   return <WalletsScreen onOpenTrader={handleOpenTrader}/>;
      case 'settings':  return <SettingsScreen/>;
      default: return null;
    }
  })();

  return (
    <div className="app" data-sidebar={t.sidebarMode === 'icons' ? 'icons' : 'expanded'}>
      <Sidebar route={route === 'profile' ? 'traders' : route} setRoute={setRoute}/>
      <div className="main">
        <Topbar route={route}/>
        {screen}
      </div>
      {copyTrader && <CopyTraderModal trader={copyTrader} onClose={() => setCopyTrader(null)}/>}
      {tradeMarket && <TradeModal market={tradeMarket} side={tradeSide} onClose={() => setTradeMarket(null)}/>}

      <PipWindow open={t.pipOpen} onClose={() => setTweak('pipOpen', false)} onOpenTrader={handleOpenTrader}/>
      {!t.pipOpen && <PipTrigger onClick={() => setTweak('pipOpen', true)}/>}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakRadio label="Mode" value={t.theme}
                      options={[{value:'dark',label:'Dark'},{value:'light',label:'Dark'}]}
                      onChange={(v) => setTweak('theme', v)}/>
          <TweakSelect label="Accent color" value={Object.keys(ACCENT_PRESETS).find(k => ACCENT_PRESETS[k] === t.accent) || 'Orange'}
                       options={Object.keys(ACCENT_PRESETS)}
                       onChange={(v) => setTweak('accent', ACCENT_PRESETS[v])}/>
          <TweakColor label="Custom accent" value={t.accent}
                      onChange={(v) => setTweak('accent', v)}/>
        </TweakSection>
        <TweakSection label="Layout">
          <TweakRadio label="Sidebar" value={t.sidebarMode}
                      options={[{value:'expanded',label:'Expanded'},{value:'icons',label:'Icon only'}]}
                      onChange={(v) => setTweak('sidebarMode', v)}/>
          <TweakToggle label="Show wallet panel" value={t.showWalletPanel}
                       onChange={(v) => setTweak('showWalletPanel', v)}/>
          <TweakToggle label="Live monitor (PIP)" value={t.pipOpen}
                       onChange={(v) => setTweak('pipOpen', v)}/>
        </TweakSection>
        <TweakSection label="Charts">
          <TweakRadio label="Chart style" value={t.chartMode}
                      options={[{value:'line',label:'Line'},{value:'area',label:'Area'},{value:'candle',label:'Candle'}]}
                      onChange={(v) => setTweak('chartMode', v)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
