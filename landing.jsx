// NEXA Loop — Landing screen with 3 hero treatments

const { useState } = React;

function Logo({ size = "md" }) {
  const dims = size === "sm" ? { box: 22, text: 14 } : { box: 28, text: 16 };
  return (
    <div className="nx-logo" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div
        style={{
          width: dims.box, height: dims.box,
          background: "var(--ink)",
          borderRadius: 6,
          display: "grid", placeItems: "center",
          color: "white", fontWeight: 700, fontSize: dims.text * 0.85,
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.02em",
        }}
      >N</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: dims.text, fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.015em" }}>
        NEXA <span style={{ color: "var(--indigo-700)" }}>Loop</span>
      </div>
    </div>
  );
}

function TopBar({ onAbout }) {
  return (
    <header className="nx-topbar">
      <Logo />
      <div className="nx-topbar-right">
        <span className="nx-pill nx-pill-soft">
          <span className="nx-dot" />
          Free during beta
        </span>
        <button className="nx-link" onClick={onAbout}>About</button>
      </div>
    </header>
  );
}

// ─── Hero Variant A: Editorial typographic ─────────────────────────────────
function HeroTypographic({ onStart, density }) {
  const pad = density === "compact" ? "72px 0 56px" : "120px 0 96px";
  return (
    <section className="nx-hero" style={{ padding: pad }}>
      <div className="nx-eyebrow">EU Fashion Compliance · EPR Calculator</div>
      <h1 className="nx-display">
        Calculate your EU<br />
        EPR fee,<br />
        <span className="nx-display-accent">in eight minutes.</span>
      </h1>
      <p className="nx-lead">
        Stop doing this in spreadsheets. Enter your quarterly materials data and get
        your eco‑contribution fee breakdown instantly — plus a declaration summary
        you can download and use. Starting with France Refashion, more markets coming.
      </p>
      <div className="nx-cta-row">
        <button className="nx-btn nx-btn-primary nx-btn-lg" onClick={onStart}>
          Calculate my EPR fee
          <span className="nx-arrow">→</span>
        </button>
        <div className="nx-cta-meta">~ 8 min · No account · Free</div>
      </div>

      <div className="nx-feature-pills">
        <FeaturePill icon="●" label="Free to use" />
        <FeaturePill icon="◇" label="No account needed" />
        <FeaturePill icon="↓" label="Download your declaration" />
      </div>

      <p className="nx-disclaimer-text">
        Calculation uses indicative Refashion 2025 rate estimates. Always verify final
        figures against the official Refashion annual rate table before submission.
      </p>
    </section>
  );
}

// ─── Hero Variant B: Data-forward (live numbers preview) ───────────────────
function HeroDataForward({ onStart }) {
  return (
    <section className="nx-hero nx-hero-data">
      <div className="nx-hero-data-grid">
        <div>
          <div className="nx-eyebrow">EU Fashion Compliance</div>
          <h1 className="nx-display nx-display-tight">
            Your EPR fee,<br/>in minutes.
          </h1>
          <p className="nx-lead">
            Enter quarterly materials. Get an indicative eco-contribution
            with modulation factors applied. Download a declaration-ready PDF.
          </p>
          <button className="nx-btn nx-btn-primary nx-btn-lg" onClick={onStart}>
            Calculate my EPR fee <span className="nx-arrow">→</span>
          </button>
          <p className="nx-disclaimer-text" style={{ marginTop: 24 }}>
            France Refashion 2025 rates (indicative) · Netherlands coming soon.
          </p>
        </div>

        <div className="nx-hero-card">
          <div className="nx-hero-card-head">
            <div>
              <div className="nx-mono-label">Sample · Lumen Atelier · Q1 2026 · France</div>
              <div className="nx-hero-card-amount">€137.42</div>
            </div>
            <div className="nx-tag nx-tag-mod">−13% mod.</div>
          </div>
          <div className="nx-hero-card-rows">
            {[
              ["Cotton", "1,240 kg", "€94.24"],
              ["Linen / Hemp", "380 kg", "€23.14"],
              ["Recycled polyester", "220 kg", "€13.40"],
            ].map(([m, w, f]) => (
              <div key={m} className="nx-hero-card-row">
                <span>{m}</span>
                <span className="nx-mono">{w}</span>
                <span className="nx-mono nx-num">{f}</span>
              </div>
            ))}
          </div>
          <div className="nx-hero-card-foot">
            <span>Estimated total</span>
            <span className="nx-mono nx-num"><strong>€137.42</strong></span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Hero Variant C: Illustrative (geometric, fashion-data motif) ──────────
function HeroIllustrative({ onStart }) {
  return (
    <section className="nx-hero nx-hero-illust">
      <div className="nx-hero-illust-art" aria-hidden="true">
        <svg viewBox="0 0 600 600" width="100%" height="100%">
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(55,48,163,0.08)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="600" height="600" fill="url(#grid)"/>
          {/* Stacked bars representing material weights */}
          <g transform="translate(80,420)">
            {[
              [0, 220, "#3730A3"],
              [60, 160, "#6366F1"],
              [120, 100, "#A5B4FC"],
              [180, 280, "#1E1B4B"],
              [240, 140, "#3730A3"],
              [300, 90, "#6366F1"],
              [360, 200, "#A5B4FC"],
            ].map(([x, h, c], i) => (
              <rect key={i} x={x} y={-h} width="44" height={h} fill={c} rx="2"/>
            ))}
          </g>
          {/* Loop curve */}
          <path d="M 80 200 Q 200 80, 320 180 T 540 200" stroke="#3730A3" strokeWidth="2" fill="none" strokeDasharray="4 4"/>
          <circle cx="80" cy="200" r="6" fill="#3730A3"/>
          <circle cx="540" cy="200" r="6" fill="#3730A3"/>
          {/* Tag */}
          <g transform="translate(360,90)">
            <rect width="160" height="40" rx="6" fill="white" stroke="#E2E8F0"/>
            <text x="14" y="17" fontSize="9" fill="#64748B" fontFamily="ui-monospace, monospace" letterSpacing="0.08em">REFASHION 2026</text>
            <text x="14" y="32" fontSize="13" fill="#1E1B4B" fontFamily="serif" fontWeight="600">€137.42</text>
          </g>
        </svg>
      </div>
      <div className="nx-hero-illust-text">
        <div className="nx-eyebrow">EU Fashion Compliance</div>
        <h1 className="nx-display">
          The loop<br/>
          <span className="nx-display-accent">closes here.</span>
        </h1>
        <p className="nx-lead">
          Quarterly EPR calculations across EU markets, without the spreadsheet panic.
          Eight minutes from materials in to declaration out.
        </p>
        <button className="nx-btn nx-btn-primary nx-btn-lg" onClick={onStart}>
          Calculate my EPR fee <span className="nx-arrow">→</span>
        </button>
      </div>
    </section>
  );
}

function FeaturePill({ icon, label }) {
  return (
    <div className="nx-feature-pill">
      <span className="nx-feature-pill-icon">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function PresetStrip({ onPreset }) {
  return (
    <div className="nx-preset-strip">
      <div className="nx-preset-strip-label">Try a sample brand →</div>
      <div className="nx-preset-strip-row">
        {window.BRAND_PRESETS.map(p => (
          <button key={p.id} className="nx-preset-card" onClick={() => onPreset(p)}>
            <div className="nx-preset-name">{p.name}</div>
            <div className="nx-preset-blurb">{p.blurb}</div>
            <div className="nx-preset-cta">Open with this data →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="nx-footer">
      <div className="nx-footer-inner">
        <div>
          <Logo size="sm" />
          <p className="nx-footer-blurb">
            Built for EU-facing fashion brands navigating EPR compliance across markets.
          </p>
        </div>
        <div className="nx-footer-meta">
          <div>This tool provides indicative estimates only. Always verify with official EPR scheme rates for each market.</div>
          <div className="nx-footer-tiny">© 2026 NEXA Loop. All rights reserved. · hello@nexaloop.com</div>
        </div>
      </div>
    </footer>
  );
}

function LandingScreen({ onStart, onPreset, heroVariant, density }) {
  return (
    <>
      {heroVariant === "data" && <HeroDataForward onStart={onStart} />}
      {heroVariant === "illust" && <HeroIllustrative onStart={onStart} />}
      {(!heroVariant || heroVariant === "type") && <HeroTypographic onStart={onStart} density={density} />}

      <div className="nx-social-strip">
        Built specifically for EU-facing fashion brands navigating EPR compliance.
      </div>

      <PresetStrip onPreset={onPreset} />

      <Footer />
    </>
  );
}

Object.assign(window, { Logo, TopBar, LandingScreen, Footer });
