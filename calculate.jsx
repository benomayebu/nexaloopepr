// NEXA Loop — Refashion EPR calculation engine
// Indicative rates, must be verified against official 2025 Refashion table.

const REFASHION_BASE_RATES = {
  "Cotton (natural vegetable)": 80,
  "Linen / Hemp (natural vegetable)": 70,
  "Wool (natural animal)": 90,
  "Cashmere / Alpaca (natural animal)": 90,
  "Silk (natural animal)": 85,
  "Polyester (synthetic)": 110,
  "Nylon / Polyamide (synthetic)": 110,
  "Acrylic (synthetic)": 115,
  "Viscose / Modal / Lyocell (semi-synthetic)": 85,
  "Leather (animal)": 95,
  "Down / Feathers (natural animal)": 88,
  "Recycled cotton": 55,
  "Recycled polyester": 70,
  "Blended / Mixed fabrics": 100,
  "Other": 100,
};

const MATERIAL_CATEGORIES = {
  "Cotton (natural vegetable)": "natural",
  "Linen / Hemp (natural vegetable)": "natural",
  "Wool (natural animal)": "natural",
  "Cashmere / Alpaca (natural animal)": "natural",
  "Silk (natural animal)": "natural",
  "Polyester (synthetic)": "synthetic",
  "Nylon / Polyamide (synthetic)": "synthetic",
  "Acrylic (synthetic)": "synthetic",
  "Viscose / Modal / Lyocell (semi-synthetic)": "semi-synthetic",
  "Leather (animal)": "animal",
  "Down / Feathers (natural animal)": "natural",
  "Recycled cotton": "recycled",
  "Recycled polyester": "recycled",
  "Blended / Mixed fabrics": "blended",
  "Other": "other",
};

const BONUS_DEFS = [
  { key: "2year_durability", label: "Designed to last at least 2 years", value: -0.05 },
  { key: "repairability_score", label: "Carries a repairability score", value: -0.05 },
  { key: "mono_material", label: "Mono-material (single fibre type)", value: -0.10 },
  { key: "certified_material", label: "GOTS, GRS, or equivalent certification", value: -0.08 },
];

const MALUS_DEFS = [
  { key: "hazardous_substances", label: "Contains REACH-flagged hazardous substances", value: 0.15 },
  { key: "no_takeback", label: "No take-back / end-of-life programme", value: 0.05 },
];

function calculateModulation(checkedBonuses, checkedMaluses) {
  const bonusMap = Object.fromEntries(BONUS_DEFS.map(b => [b.key, b.value]));
  const malusMap = Object.fromEntries(MALUS_DEFS.map(m => [m.key, m.value]));
  const totalBonus = checkedBonuses.reduce((s, k) => s + (bonusMap[k] || 0), 0);
  const totalMalus = checkedMaluses.reduce((s, k) => s + (malusMap[k] || 0), 0);
  return Math.max(-0.20, Math.min(0.30, totalBonus + totalMalus));
}

function calculateRowFee(material, weightKg, modulationFactor) {
  const ratePerTonne = REFASHION_BASE_RATES[material] || 100;
  const weightTonnes = weightKg / 1000;
  const baseFee = weightTonnes * ratePerTonne;
  const modulatedFee = baseFee * (1 + modulationFactor);
  return Math.round(modulatedFee * 100) / 100;
}

function calculateTotal(rows, modulationFactor) {
  const lineItems = rows
    .filter(r => r.material && r.weightKg > 0)
    .map(r => ({
      material: r.material,
      weightKg: r.weightKg,
      ratePerTonne: REFASHION_BASE_RATES[r.material] || 100,
      modulationFactor,
      baseFee: Math.round((r.weightKg / 1000) * (REFASHION_BASE_RATES[r.material] || 100) * 100) / 100,
      subtotal: calculateRowFee(r.material, r.weightKg, modulationFactor),
    }));
  const totalWeight = lineItems.reduce((s, r) => s + r.weightKg, 0);
  const totalBase = lineItems.reduce((s, r) => s + r.baseFee, 0);
  const totalFee = lineItems.reduce((s, r) => s + r.subtotal, 0);
  return { lineItems, totalWeight, totalBase, totalFee, modulationFactor };
}

// Sample brand presets — for seeding the form
const BRAND_PRESETS = [
  {
    id: "lumen",
    name: "Lumen Atelier",
    contact: "Inês Madeira",
    quarter: "Q1",
    year: "2026",
    countries: ["france"],
    materials: [
      { material: "Cotton (natural vegetable)", weightKg: 1240 },
      { material: "Linen / Hemp (natural vegetable)", weightKg: 380 },
      { material: "Recycled polyester", weightKg: 220 },
    ],
    bonuses: ["2year_durability", "certified_material"],
    maluses: [],
    blurb: "Small French linen brand · ~€2.4M revenue",
  },
  {
    id: "northcote",
    name: "Northcote & Sons",
    contact: "James Whitfield",
    quarter: "Q4",
    year: "2025",
    countries: ["france"],
    materials: [
      { material: "Wool (natural animal)", weightKg: 460 },
      { material: "Cashmere / Alpaca (natural animal)", weightKg: 95 },
      { material: "Cotton (natural vegetable)", weightKg: 280 },
      { material: "Polyester (synthetic)", weightKg: 140 },
    ],
    bonuses: ["2year_durability", "repairability_score"],
    maluses: [],
    blurb: "British heritage knitwear · placing into FR market",
  },
  {
    id: "kio",
    name: "Kio Studio",
    contact: "Maya Tran",
    quarter: "Q2",
    year: "2026",
    countries: ["france"],
    materials: [
      { material: "Polyester (synthetic)", weightKg: 1840 },
      { material: "Nylon / Polyamide (synthetic)", weightKg: 620 },
      { material: "Acrylic (synthetic)", weightKg: 280 },
      { material: "Blended / Mixed fabrics", weightKg: 410 },
    ],
    bonuses: [],
    maluses: ["no_takeback"],
    blurb: "Synthetic-heavy activewear · higher modulation cost",
  },
];

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
const QUARTER_LABEL = { Q1: "Q1 (Jan–Mar)", Q2: "Q2 (Apr–Jun)", Q3: "Q3 (Jul–Sep)", Q4: "Q4 (Oct–Dec)" };
const YEARS = ["2024", "2025", "2026"];

function nextQuarter(q, y) {
  const idx = QUARTERS.indexOf(q);
  if (idx === 3) return { quarter: "Q1", year: String(Number(y) + 1) };
  return { quarter: QUARTERS[idx + 1], year: y };
}

function fmtEUR(n) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
}
function fmtKg(n) {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(n || 0);
}
function fmtPct(n) {
  if (!n) return "—";
  const sign = n > 0 ? "+" : "−";
  return `${sign}${Math.abs(Math.round(n * 100))}%`;
}

Object.assign(window, {
  REFASHION_BASE_RATES,
  MATERIAL_CATEGORIES,
  BONUS_DEFS,
  MALUS_DEFS,
  calculateModulation,
  calculateRowFee,
  calculateTotal,
  BRAND_PRESETS,
  QUARTERS,
  QUARTER_LABEL,
  YEARS,
  nextQuarter,
  fmtEUR,
  fmtKg,
  fmtPct,
});
