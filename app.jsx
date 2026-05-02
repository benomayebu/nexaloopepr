// NEXA Loop — App shell, Tweaks, routing between steps

const { useState: useStateA, useEffect: useEffectA } = React;

const DEFAULT_DATA = {
  brandName: "",
  contact: "",
  quarter: "Q1",
  year: "2026",
  countries: ["france"],
  materials: [
    { material: "", weightKg: "" },
    { material: "", weightKg: "" },
  ],
  bonuses: [],
  maluses: [],
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "data",
  "resultsLayout": "table",
  "wizardMode": "stepped",
  "density": "spacious",
  "accent": "indigo-only",
  "showAbout": false
}/*EDITMODE-END*/;

function AboutOverlay({ onClose }) {
  return (
    <div className="nx-about-overlay" onClick={onClose}>
      <div className="nx-about" onClick={e => e.stopPropagation()}>
        <button className="nx-about-x" onClick={onClose}>×</button>
        <Logo />
        <h2 className="nx-h2" style={{ marginTop: 24 }}>What we're building.</h2>
        <p className="nx-lead">
          NEXA Loop is a compliance platform for EU-facing fashion brands. We're
          starting with the most painful, repetitive piece of EPR — quarterly
          Refashion calculations — and turning it into eight minutes of work
          instead of a spreadsheet weekend.
        </p>
        <p className="nx-sub">
          The tool is genuinely useful as a starting point. It is not a legally
          binding declaration. A smoke alarm is genuinely useful even though it
          is not a firefighter.
        </p>
        <div className="nx-about-meta">
          <span>Built by NEXA Loop · Beta · 2026</span>
          <span>hello@nexaloop.com</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [tweaks, setTweaks] = window.useTweaks(TWEAK_DEFAULTS);
  const [step, setStep] = useStateA(0); // 0 = landing, 1-3 = wizard
  const [data, setData] = useStateA(DEFAULT_DATA);
  const [aboutOpen, setAboutOpen] = useStateA(false);

  // Tweak-driven body classes
  useEffectA(() => {
    document.body.dataset.density = tweaks.density;
    document.body.dataset.accent = tweaks.accent;
  }, [tweaks.density, tweaks.accent]);

  function startCalc() {
    setStep(1);
    window.track && window.track("wizard_start");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyPreset(preset) {
    setData({
      ...DEFAULT_DATA,
      brandName: preset.name,
      contact: preset.contact,
      quarter: preset.quarter,
      year: preset.year,
      countries: preset.countries,
      materials: preset.materials.map(m => ({ ...m })),
      bonuses: preset.bonuses,
      maluses: preset.maluses,
    });
    // In single-page mode, jump straight to materials; in stepped, brand info first.
    setStep(tweaks.wizardMode === "single" ? 2 : 2);
    window.scrollTo({ top: 0 });
  }

  function restart() {
    setData(DEFAULT_DATA);
    setStep(0);
    window.scrollTo({ top: 0 });
  }

  // Single-page mode: render brand + materials together, then results.
  const single = tweaks.wizardMode === "single";

  return (
    <div className="nx-app">
      <TopBar onAbout={() => setAboutOpen(true)} />

      {step === 0 && (
        <LandingScreen
          onStart={startCalc}
          onPreset={applyPreset}
          heroVariant={tweaks.heroVariant}
          density={tweaks.density}
        />
      )}

      {step >= 1 && step <= 2 && !single && (
        <main className="nx-main">
          {step === 1 && (
            <BrandInfoScreen
              data={data}
              setData={setData}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <MaterialsScreen
              data={data}
              setData={setData}
              onNext={() => { window.track && window.track("calculation_complete"); setStep(3); }}
              onBack={() => setStep(1)}
              density={tweaks.density}
              accent={tweaks.accent}
            />
          )}
        </main>
      )}

      {step >= 1 && step <= 2 && single && (
        <main className="nx-main">
          <SinglePageWizard
            data={data}
            setData={setData}
            onNext={() => { window.track && window.track("calculation_complete"); setStep(3); }}
            onBack={() => setStep(0)}
            density={tweaks.density}
            accent={tweaks.accent}
          />
        </main>
      )}

      {step === 3 && (
        <main className="nx-main">
          <ResultsScreen
            data={data}
            onRestart={restart}
            layoutVariant={tweaks.resultsLayout}
          />
        </main>
      )}

      {aboutOpen && <AboutOverlay onClose={() => setAboutOpen(false)} />}

      {window.__tweaksEnabled && <NexaTweaksPanel tweaks={tweaks} setTweaks={setTweaks} />}
    </div>
  );
}

function SinglePageWizard({ data, setData, onNext, onBack, density, accent }) {
  // Reuse the screens but show them stacked
  return (
    <div className="nx-wizard">
      <div className="nx-wizard-head">
        <div className="nx-mono-label">Calculate your fee · single page</div>
        <h2 className="nx-h1">Tell us about this quarter.</h2>
      </div>
      <BrandInfoInline data={data} setData={setData} />
      <MaterialsScreen
        data={data}
        setData={setData}
        onNext={onNext}
        onBack={onBack}
        density={density}
        accent={accent}
      />
    </div>
  );
}

function BrandInfoInline({ data, setData }) {
  return (
    <div className="nx-card">
      <div className="nx-row-3">
        <div className="nx-field">
          <label className="nx-label">Brand name</label>
          <input
            className="nx-input"
            placeholder="e.g. Lumen Atelier"
            value={data.brandName}
            onChange={e => setData({ ...data, brandName: e.target.value })}
          />
        </div>
        <div className="nx-field">
          <label className="nx-label">Quarter</label>
          <select className="nx-input" value={data.quarter} onChange={e => setData({ ...data, quarter: e.target.value })}>
            {window.QUARTERS.map(q => <option key={q} value={q}>{window.QUARTER_LABEL[q]}</option>)}
          </select>
        </div>
        <div className="nx-field">
          <label className="nx-label">Year</label>
          <select className="nx-input" value={data.year} onChange={e => setData({ ...data, year: e.target.value })}>
            {window.YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

function NexaTweaksPanel({ tweaks, setTweaks }) {
  const T = window.TweaksPanel;
  const Section = window.TweakSection;
  const Radio = window.TweakRadio;
  const Select = window.TweakSelect;
  return (
    <T title="Tweaks">
      <Section title="Hero treatment">
        <Radio
          value={tweaks.heroVariant}
          onChange={v => setTweaks("heroVariant", v)}
          options={[
            { value: "type", label: "Editorial" },
            { value: "data", label: "Data-forward" },
            { value: "illust", label: "Illustrative" },
          ]}
        />
      </Section>
      <Section title="Results layout">
        <Radio
          value={tweaks.resultsLayout}
          onChange={v => setTweaks("resultsLayout", v)}
          options={[
            { value: "table", label: "Table" },
            { value: "dashboard", label: "Dashboard" },
          ]}
        />
      </Section>
      <Section title="Calculator UX">
        <Radio
          value={tweaks.wizardMode}
          onChange={v => setTweaks("wizardMode", v)}
          options={[
            { value: "stepped", label: "Stepped" },
            { value: "single", label: "Single-page" },
          ]}
        />
      </Section>
      <Section title="Density">
        <Radio
          value={tweaks.density}
          onChange={v => setTweaks("density", v)}
          options={[
            { value: "spacious", label: "Spacious" },
            { value: "compact", label: "Compact" },
          ]}
        />
      </Section>
      <Section title="Accent">
        <Radio
          value={tweaks.accent}
          onChange={v => setTweaks("accent", v)}
          options={[
            { value: "indigo-only", label: "Indigo only" },
            { value: "data-accents", label: "+ Green/amber" },
          ]}
        />
      </Section>
    </T>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
