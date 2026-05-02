# NEXA Loop — Refashion EPR Calculator

Free, no-login calculator for EU fashion brands to estimate their France Refashion eco-contribution fee. Enter quarterly material data and download a declaration summary PDF.

**Live:** [nexaloop.com](https://nexaloop.com)

## What it does

- Step-by-step wizard: brand info → materials → results
- Calculates indicative Refashion EPR fee by material type
- Applies modulation factors (bonuses for sustainability criteria, maluses for non-compliance)
- Generates a downloadable PDF declaration summary
- Email capture for next-quarter reminders

## Stack

Static site — React 18 (CDN), Babel standalone (in-browser JSX), vanilla CSS. No build step. Deploy anywhere that serves static files.

## Deployment

Connected to Vercel. Any push to `main` deploys automatically.

To run locally:

```bash
npx serve .
# or just open index.html via a local server (file:// won't work due to ES module CORS)
```

## Rate accuracy

Base rates in `calculate.jsx` (`REFASHION_BASE_RATES`) are indicative 2025 approximations. Verify against the official annual rate table at [refashion.eu](https://refashion.eu) before filing declarations. Rates update annually.

## Contact

[hello@nexaloop.com](mailto:hello@nexaloop.com)
