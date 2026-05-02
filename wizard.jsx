// NEXA Loop — Wizard screens (brand info + materials)

const { useState: useStateW, useMemo: useMemoW } = React;

function ProgressBar({ step, totalSteps = 3, labels }) {
  const pct = (step / totalSteps) * 100;
  return (
    <div className="nx-progress">
      <div className="nx-progress-meta">
        <span className="nx-mono-label">Step {step} of {totalSteps}</span>
        <span className="nx-progress-label">{labels[step - 1]}</span>
      </div>
      <div className="nx-progress-track">
        <div className="nx-progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function BrandInfoScreen({ data, setData, onNext, onBack }) {
  const [errors, setErrors] = useStateW({});

  function validate() {
    const e = {};
    if (!data.brandName.trim()) e.brandName = "Please enter your brand name";
    if (!data.countries || data.countries.length === 0) e.countries = "Please select at least one market";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function toggleCountry(c) {
    const has = data.countries.includes(c);
    if (c === "france" && has) return; // can't deselect France
    setData({ ...data, countries: has ? data.countries.filter(x => x !== c) : [...data.countries, c] });
  }

  return (
    <div className="nx-wizard">
      <ProgressBar step={1} labels={["Brand details", "Materials", "Your results"]} />

      <div className="nx-wizard-head">
        <h2 className="nx-h2">Your brand details</h2>
        <p className="nx-sub">Tell us about your organisation and the reporting period.</p>
      </div>

      <div className="nx-card">
        <div className="nx-field">
          <label className="nx-label">Brand name</label>
          <input
            className={`nx-input ${errors.brandName ? "nx-input-error" : ""}`}
            type="text"
            placeholder="e.g. Lumen Atelier"
            value={data.brandName}
            onChange={e => setData({ ...data, brandName: e.target.value })}
          />
          {errors.brandName && <div className="nx-err">{errors.brandName}</div>}
        </div>

        <div className="nx-field">
          <label className="nx-label">Reporting period</label>
          <div className="nx-row-2">
            <select className="nx-input" value={data.quarter} onChange={e => setData({ ...data, quarter: e.target.value })}>
              {window.QUARTERS.map(q => <option key={q} value={q}>{window.QUARTER_LABEL[q]}</option>)}
            </select>
            <select className="nx-input" value={data.year} onChange={e => setData({ ...data, year: e.target.value })}>
              {window.YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="nx-field">
          <label className="nx-label">EU markets you place products on</label>
          <div className="nx-checks">
            {[
              { id: "france", label: "France (Refashion)", note: "Currently supported", on: true },
              { id: "netherlands", label: "Netherlands (OPEN)", note: "Coming soon", on: false },
              { id: "other_eu", label: "Other EU market", note: "Coming soon", on: false },
            ].map(c => (
              <label key={c.id} className={`nx-check ${!c.on ? "nx-check-disabled" : ""}`}>
                <input
                  type="checkbox"
                  checked={data.countries.includes(c.id)}
                  onChange={() => c.on && toggleCountry(c.id)}
                  disabled={!c.on}
                />
                <span className="nx-check-label">{c.label}</span>
                <span className="nx-check-note">{c.note}</span>
              </label>
            ))}
          </div>
          {errors.countries && <div className="nx-err">{errors.countries}</div>}
          <p className="nx-fine">
            This calculator currently supports France Refashion. Netherlands and other markets coming soon.
          </p>
        </div>

        <div className="nx-field">
          <label className="nx-label">Your name <span className="nx-optional">(optional)</span></label>
          <input
            className="nx-input"
            type="text"
            placeholder="e.g. Inês Madeira"
            value={data.contact}
            onChange={e => setData({ ...data, contact: e.target.value })}
          />
        </div>
      </div>

      <div className="nx-nav-row">
        <button className="nx-btn nx-btn-ghost" onClick={onBack}>← Back</button>
        <button className="nx-btn nx-btn-primary" onClick={() => validate() && onNext()}>
          Continue →
        </button>
      </div>
    </div>
  );
}

function MaterialsScreen({ data, setData, onNext, onBack, density, accent }) {
  const [showMod, setShowMod] = useStateW(data.bonuses.length + data.maluses.length > 0);

  const modulation = useMemoW(
    () => window.calculateModulation(data.bonuses, data.maluses),
    [data.bonuses, data.maluses]
  );
  const result = useMemoW(
    () => window.calculateTotal(data.materials, modulation),
    [data.materials, modulation]
  );

  function updateRow(i, patch) {
    const m = [...data.materials];
    m[i] = { ...m[i], ...patch };
    setData({ ...data, materials: m });
  }
  function removeRow(i) {
    setData({ ...data, materials: data.materials.filter((_, j) => j !== i) });
  }
  function addRow() {
    setData({ ...data, materials: [...data.materials, { material: "", weightKg: "" }] });
  }
  function toggleBonus(k) {
    setData({ ...data, bonuses: data.bonuses.includes(k) ? data.bonuses.filter(x => x !== k) : [...data.bonuses, k] });
  }
  function toggleMalus(k) {
    setData({ ...data, maluses: data.maluses.includes(k) ? data.maluses.filter(x => x !== k) : [...data.maluses, k] });
  }

  const canContinue = data.materials.some(r => r.material && Number(r.weightKg) > 0);

  return (
    <div className="nx-wizard">
      <ProgressBar step={2} labels={["Brand details", "Materials", "Your results"]} />

      <div className="nx-wizard-head">
        <h2 className="nx-h2">Your materials — {data.quarter} {data.year}</h2>
        <p className="nx-sub">
          Enter the weight of each material type you placed on the French market this quarter.
          Only include products sold into France.
        </p>
      </div>

      <div className="nx-card">
        <div className="nx-table-head">
          <div className="nx-th nx-th-mat">Material</div>
          <div className="nx-th nx-th-w">Weight (kg)</div>
          <div className="nx-th nx-th-r">Rate</div>
          <div className="nx-th nx-th-x"></div>
        </div>

        {data.materials.map((row, i) => {
          const rate = row.material ? window.REFASHION_BASE_RATES[row.material] : null;
          const weight = Number(row.weightKg) || 0;
          const tooBig = weight > 100000;
          const lineBase = rate && weight ? (weight / 1000) * rate : 0;
          return (
            <div key={i} className="nx-mat-row">
              <select
                className="nx-input nx-input-mat"
                value={row.material}
                onChange={e => updateRow(i, { material: e.target.value })}
              >
                <option value="">Select material…</option>
                {Object.keys(window.REFASHION_BASE_RATES).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <div className="nx-w-wrap">
                <input
                  className="nx-input nx-input-w"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={row.weightKg}
                  onChange={e => updateRow(i, { weightKg: e.target.value })}
                />
                <span className="nx-suffix">kg</span>
              </div>
              <div className="nx-th-r nx-rate-cell">
                {rate ? (
                  <>
                    <span className="nx-mono">€{rate}<span className="nx-rate-tonne">/t</span></span>
                    {weight > 0 && <span className="nx-line-base">≈ {window.fmtEUR(lineBase)}</span>}
                  </>
                ) : (
                  <span className="nx-muted">—</span>
                )}
              </div>
              <button className="nx-x" onClick={() => removeRow(i)} aria-label="Remove row">×</button>
              {tooBig && (
                <div className="nx-warn-line">
                  Double-check: over 100 tonnes for one material. Are your units in kg?
                </div>
              )}
            </div>
          );
        })}

        <button className="nx-btn nx-btn-add" onClick={addRow}>+ Add another material</button>
      </div>

      {/* Eco-modulation expandable */}
      <div className="nx-card nx-mod-card">
        <button className="nx-mod-head" onClick={() => setShowMod(!showMod)}>
          <span className="nx-mod-chev" style={{ transform: showMod ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
          <span className="nx-mod-title">Eco-modulation adjustments</span>
          <span className="nx-mod-meta">
            {data.bonuses.length + data.maluses.length === 0
              ? "Optional · adjust your fee"
              : `${window.fmtPct(modulation)} applied`}
          </span>
        </button>

        {showMod && (
          <div className="nx-mod-body">
            <div className="nx-mod-section">
              <div className="nx-mod-section-title">Durability bonuses</div>
              {window.BONUS_DEFS.slice(0, 2).map(b => (
                <ModCheck key={b.key} def={b} on={data.bonuses.includes(b.key)} onToggle={() => toggleBonus(b.key)} kind="bonus" />
              ))}
            </div>
            <div className="nx-mod-section">
              <div className="nx-mod-section-title">Recyclability</div>
              {window.BONUS_DEFS.slice(2).map(b => (
                <ModCheck key={b.key} def={b} on={data.bonuses.includes(b.key)} onToggle={() => toggleBonus(b.key)} kind="bonus" />
              ))}
            </div>
            <div className="nx-mod-section">
              <div className="nx-mod-section-title nx-mod-malus">Maluses (these increase your fee)</div>
              {window.MALUS_DEFS.map(m => (
                <ModCheck key={m.key} def={m} on={data.maluses.includes(m.key)} onToggle={() => toggleMalus(m.key)} kind="malus" />
              ))}
            </div>
            <p className="nx-fine">
              These criteria are simplified approximations of the Refashion eco-modulation framework.
              Actual modulation factors must be verified with your Refashion registration.
            </p>
          </div>
        )}
      </div>

      {/* Live preview */}
      <div className="nx-livebar">
        <div>
          <div className="nx-mono-label">Estimated {data.quarter} {data.year} fee · indicative</div>
          <div className="nx-livebar-amount">{window.fmtEUR(result.totalFee)}</div>
        </div>
        <div className="nx-livebar-meta">
          <div><span className="nx-mono">{window.fmtKg(result.totalWeight)} kg</span> across {result.lineItems.length} material{result.lineItems.length === 1 ? "" : "s"}</div>
          {modulation !== 0 && (
            <div className={`nx-tag ${modulation < 0 ? "nx-tag-good" : "nx-tag-warn"}`}>
              Modulation: {window.fmtPct(modulation)}
            </div>
          )}
        </div>
      </div>

      <div className="nx-nav-row">
        <button className="nx-btn nx-btn-ghost" onClick={onBack}>← Back</button>
        <button className="nx-btn nx-btn-primary" onClick={onNext} disabled={!canContinue}>
          Calculate my fee →
        </button>
      </div>
    </div>
  );
}

function ModCheck({ def, on, onToggle, kind }) {
  return (
    <label className={`nx-mod-check ${on ? "nx-mod-check-on" : ""}`}>
      <input type="checkbox" checked={on} onChange={onToggle} />
      <span className="nx-mod-check-label">{def.label}</span>
      <span className={`nx-mod-check-val nx-mod-check-${kind}`}>
        {def.value > 0 ? "+" : "−"}{Math.abs(def.value * 100)}%
      </span>
    </label>
  );
}

Object.assign(window, { ProgressBar, BrandInfoScreen, MaterialsScreen, ModCheck });
