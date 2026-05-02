// NEXA Loop — Results screen with 3 layout variants + PDF preview

const { useState: useStateR, useMemo: useMemoR } = React;

function StatCard({ label, value, sub, accent }) {
  return (
    <div className={`nx-stat ${accent ? "nx-stat-accent" : ""}`}>
      <div className="nx-mono-label">{label}</div>
      <div className="nx-stat-value">{value}</div>
      {sub && <div className="nx-stat-sub">{sub}</div>}
    </div>
  );
}

function HowExplainer({ result, data }) {
  const [open, setOpen] = useStateR(false);
  return (
    <div className="nx-how">
      <button className="nx-how-trigger" onClick={() => setOpen(!open)}>
        <span className="nx-how-icon">i</span>
        How we calculated this
        <span className="nx-how-chev" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </button>
      {open && (
        <div className="nx-how-body">
          <div className="nx-how-step">
            <span className="nx-how-num">1</span>
            <div>
              <strong>Base fee per material.</strong> For each row we multiply
              weight in tonnes (kg ÷ 1,000) by the Refashion 2025 indicative
              rate for that material category.
              <div className="nx-how-eq nx-mono">base = (kg ÷ 1000) × rate€/t</div>
            </div>
          </div>
          <div className="nx-how-step">
            <span className="nx-how-num">2</span>
            <div>
              <strong>Modulation factor.</strong> We sum the bonuses (negative)
              and maluses (positive) you selected, then floor at −20% and cap
              at +30% per Refashion rules.
              <div className="nx-how-eq nx-mono">your factor: {window.fmtPct(result.modulationFactor)}</div>
            </div>
          </div>
          <div className="nx-how-step">
            <span className="nx-how-num">3</span>
            <div>
              <strong>Modulated subtotal.</strong> Each base fee is multiplied
              by (1 + factor). Subtotals are rounded to two decimals before
              summing the total.
              <div className="nx-how-eq nx-mono">subtotal = base × (1 + factor)</div>
            </div>
          </div>
          <div className="nx-how-foot">
            Indicative — verify against the official Refashion 2025 annual rate table at refashion.eu.
          </div>
        </div>
      )}
    </div>
  );
}

function DisclaimerBox() {
  return (
    <div className="nx-disclaimer">
      <div className="nx-disclaimer-icon">!</div>
      <div>
        <div className="nx-disclaimer-title">Indicative estimate only</div>
        <p>
          These figures are based on simplified Refashion 2025 rate approximations
          and may differ from your actual contribution. Before submitting your
          declaration, verify all rates and modulation criteria against the
          official Refashion annual rate table at refashion.eu.
        </p>
        <p className="nx-disclaimer-foot">This tool does not constitute legal or compliance advice.</p>
      </div>
    </div>
  );
}

function BreakdownTable({ result, accent }) {
  return (
    <div className="nx-table-wrap">
      <table className="nx-table">
        <thead>
          <tr>
            <th>Material</th>
            <th className="nx-num">Weight (kg)</th>
            <th className="nx-num">Rate (€/tonne)</th>
            <th className="nx-num">Modulation</th>
            <th className="nx-num">Subtotal (€)</th>
          </tr>
        </thead>
        <tbody>
          {result.lineItems.map((li, i) => (
            <tr key={i}>
              <td>
                <span className={`nx-mat-dot nx-mat-${window.MATERIAL_CATEGORIES[li.material] || "other"}`} />
                {li.material}
              </td>
              <td className="nx-num nx-mono">{window.fmtKg(li.weightKg)}</td>
              <td className="nx-num nx-mono">€{li.ratePerTonne}</td>
              <td className={`nx-num nx-mono ${li.modulationFactor < 0 ? "nx-good" : li.modulationFactor > 0 ? "nx-warn" : ""}`}>
                {window.fmtPct(li.modulationFactor)}
              </td>
              <td className="nx-num nx-mono"><strong>{window.fmtEUR(li.subtotal)}</strong></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>TOTAL</strong></td>
            <td className="nx-num nx-mono"><strong>{window.fmtKg(result.totalWeight)} kg</strong></td>
            <td></td>
            <td></td>
            <td className="nx-num nx-mono"><strong>{window.fmtEUR(result.totalFee)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── Dashboard variant: cards + visual bar chart breakdown ─────────────────
function DashboardBreakdown({ result }) {
  const max = Math.max(...result.lineItems.map(l => l.subtotal), 1);
  return (
    <div className="nx-dash">
      <div className="nx-dash-head">
        <h3 className="nx-h3">Contribution by material</h3>
        <span className="nx-mono-label">Subtotal · €</span>
      </div>
      <div className="nx-dash-rows">
        {result.lineItems.map((li, i) => (
          <div key={i} className="nx-dash-row">
            <div className="nx-dash-mat">
              <span className={`nx-mat-dot nx-mat-${window.MATERIAL_CATEGORIES[li.material] || "other"}`} />
              {li.material}
            </div>
            <div className="nx-dash-meta nx-mono">
              {window.fmtKg(li.weightKg)} kg · €{li.ratePerTonne}/t
              {li.modulationFactor !== 0 && <span className={li.modulationFactor < 0 ? "nx-good" : "nx-warn"}> · {window.fmtPct(li.modulationFactor)}</span>}
            </div>
            <div className="nx-dash-bar-wrap">
              <div className="nx-dash-bar" style={{ width: `${(li.subtotal / max) * 100}%` }} />
            </div>
            <div className="nx-dash-amount nx-mono"><strong>{window.fmtEUR(li.subtotal)}</strong></div>
          </div>
        ))}
      </div>
      <div className="nx-dash-total">
        <span>Total — {result.lineItems.length} material{result.lineItems.length === 1 ? "" : "s"} across {window.fmtKg(result.totalWeight)} kg</span>
        <span className="nx-mono"><strong>{window.fmtEUR(result.totalFee)}</strong></span>
      </div>
    </div>
  );
}

function PDFPreviewPanel({ result, data, onPrint }) {
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const appliedBonuses = window.BONUS_DEFS.filter(b => data.bonuses.includes(b.key));
  const appliedMaluses = window.MALUS_DEFS.filter(m => data.maluses.includes(m.key));

  return (
    <div className="nx-pdf-shell">
      <div className="nx-pdf-shell-head">
        <div>
          <div className="nx-mono-label">Document preview</div>
          <h3 className="nx-h3">Refashion EPR Declaration Summary</h3>
        </div>
        <button className="nx-btn nx-btn-primary" onClick={onPrint}>
          Download PDF declaration →
        </button>
      </div>
      <div className="nx-pdf-doc">
        <div className="nx-pdf-bar">
          <span className="nx-pdf-bar-title">NEXA Loop — Refashion EPR Declaration Summary</span>
          <span className="nx-pdf-bar-tag">indicative</span>
        </div>
        <div className="nx-pdf-body">
          <div className="nx-pdf-meta">
            <div><span>Brand</span><strong>{data.brandName}</strong></div>
            <div><span>Reporting Period</span><strong>{data.quarter} {data.year}</strong></div>
            <div><span>Country</span><strong>France (Refashion)</strong></div>
            <div><span>Calculated</span><strong>{dateStr}</strong></div>
          </div>
          <h4 className="nx-pdf-h4">Material breakdown</h4>
          <table className="nx-pdf-table">
            <thead>
              <tr>
                <th>Material</th>
                <th className="nx-num">Weight (kg)</th>
                <th className="nx-num">Rate (€/t)</th>
                <th className="nx-num">Adj. factor</th>
                <th className="nx-num">Subtotal (€)</th>
              </tr>
            </thead>
            <tbody>
              {result.lineItems.map((li, i) => (
                <tr key={i}>
                  <td>{li.material}</td>
                  <td className="nx-num">{window.fmtKg(li.weightKg)}</td>
                  <td className="nx-num">€{li.ratePerTonne}</td>
                  <td className="nx-num">{window.fmtPct(li.modulationFactor)}</td>
                  <td className="nx-num">{window.fmtEUR(li.subtotal)}</td>
                </tr>
              ))}
              <tr className="nx-pdf-total">
                <td><strong>TOTAL</strong></td>
                <td className="nx-num"><strong>{window.fmtKg(result.totalWeight)} kg</strong></td>
                <td></td>
                <td></td>
                <td className="nx-num"><strong>{window.fmtEUR(result.totalFee)}</strong></td>
              </tr>
            </tbody>
          </table>

          <h4 className="nx-pdf-h4">Modulation summary</h4>
          <div className="nx-pdf-mod">
            <div>
              <div className="nx-mono-label">Applied criteria</div>
              {appliedBonuses.length + appliedMaluses.length === 0 ? (
                <div className="nx-muted">None</div>
              ) : (
                <ul className="nx-pdf-list">
                  {appliedBonuses.map(b => <li key={b.key}>{b.label} <span className="nx-good">−{Math.abs(b.value * 100)}%</span></li>)}
                  {appliedMaluses.map(m => <li key={m.key}>{m.label} <span className="nx-warn">+{m.value * 100}%</span></li>)}
                </ul>
              )}
            </div>
            <div className="nx-pdf-mod-net">
              <div className="nx-mono-label">Net modulation factor</div>
              <div className="nx-pdf-mod-val">{window.fmtPct(result.modulationFactor)}</div>
            </div>
          </div>

          <div className="nx-pdf-notice">
            <strong>Important.</strong> These figures are indicative estimates based on simplified
            Refashion 2025 rate approximations. Verify all figures against the official Refashion
            annual rate table at refashion.eu before filing your declaration. This document does
            not constitute a legal compliance filing.
          </div>

          <div className="nx-pdf-foot">
            <span>Generated by NEXA Loop EPR Calculator · nexaloop.com · {dateStr}</span>
            <span>For questions: hello@nexaloop.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailCapture({ data, onSubmitted }) {
  const [email, setEmail] = useStateR("");
  const [err, setErr] = useStateR("");
  const [done, setDone] = useStateR(false);
  const next = window.nextQuarter(data.quarter, data.year);
  function submit(e) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Please enter a valid email");
      return;
    }
    setErr("");
    setDone(true);
    onSubmitted && onSubmitted(email);
  }
  if (done) {
    return (
      <div className="nx-email-card nx-email-done">
        <div className="nx-check-circle">✓</div>
        <div>
          <div className="nx-email-done-title">You're confirmed.</div>
          <p>We'll reach out before {next.quarter} {next.year} is due. No spam, no marketing.</p>
        </div>
      </div>
    );
  }
  return (
    <form className="nx-email-card" onSubmit={submit}>
      <h3 className="nx-h3">Get {next.quarter} {next.year} done automatically</h3>
      <p className="nx-sub">
        We'll pre-fill your brand data and materials from this quarter and send you
        a reminder when {next.quarter} {next.year} is due.
      </p>
      <div className="nx-email-row">
        <input
          className={`nx-input ${err ? "nx-input-error" : ""}`}
          type="email"
          placeholder="your@brand.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button className="nx-btn nx-btn-primary" type="submit">Yes, remind me →</button>
      </div>
      {err && <div className="nx-err">{err}</div>}
      <div className="nx-fine">No spam. No marketing. Just your quarterly reminder.</div>
    </form>
  );
}

function ResultsScreen({ data, onRestart, layoutVariant }) {
  const modulation = useMemoR(
    () => window.calculateModulation(data.bonuses, data.maluses),
    [data.bonuses, data.maluses]
  );
  const result = useMemoR(
    () => window.calculateTotal(data.materials, modulation),
    [data.materials, modulation]
  );
  const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  function openPrint() {
    // Stash result + meta to sessionStorage so the print page can render it
    const payload = {
      brandName: data.brandName,
      contact: data.contact,
      quarter: data.quarter,
      year: data.year,
      result,
      bonuses: data.bonuses,
      maluses: data.maluses,
      date: dateStr,
    };
    try { sessionStorage.setItem("nx_print_payload", JSON.stringify(payload)); } catch (e) {}
    window.open("print.html", "_blank");
  }

  return (
    <div className="nx-wizard nx-wizard-wide">
      <ProgressBar step={3} labels={["Brand details", "Materials", "Your results ✓"]} />

      <div className="nx-results-head">
        <div>
          <div className="nx-mono-label">Refashion EPR Estimate · {data.quarter} {data.year}</div>
          <h2 className="nx-h1">{data.brandName}</h2>
          <div className="nx-results-meta">
            Calculated on {dateStr}
            {data.contact && <> · by {data.contact}</>}
          </div>
        </div>
        <HowExplainer result={result} data={data} />
      </div>

      <div className="nx-stat-row">
        <StatCard label="Total weight" value={`${window.fmtKg(result.totalWeight)} kg`} sub={`${result.lineItems.length} material types`} />
        <StatCard label="Estimated fee" value={window.fmtEUR(result.totalFee)} sub="indicative" accent />
        <StatCard label="Net modulation" value={window.fmtPct(result.modulationFactor)} sub={result.modulationFactor < 0 ? "savings applied" : result.modulationFactor > 0 ? "uplift applied" : "no adjustments"} />
      </div>

      {layoutVariant === "dashboard" && <DashboardBreakdown result={result} />}
      {layoutVariant === "table" && <BreakdownTable result={result} />}
      {(!layoutVariant || layoutVariant === "cards") && (
        <>
          <BreakdownTable result={result} />
        </>
      )}

      <DisclaimerBox />

      <PDFPreviewPanel result={result} data={data} onPrint={openPrint} />

      <div className="nx-results-actions">
        <button className="nx-btn nx-btn-primary" onClick={openPrint}>
          Download PDF declaration →
        </button>
        <button className="nx-btn nx-btn-ghost" onClick={onRestart}>
          Start new calculation
        </button>
      </div>

      <EmailCapture data={data} />

      <Footer />
    </div>
  );
}

Object.assign(window, { ResultsScreen, BreakdownTable, DashboardBreakdown, EmailCapture, HowExplainer, DisclaimerBox, StatCard });
