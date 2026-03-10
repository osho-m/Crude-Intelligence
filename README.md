# US-Iran War 2026: Crude Oil Crisis & Claude AI Intelligence

> Deep Learning · RAG · GenAI · NLP · Monte Carlo · LSTM · Geospatial AI

A full-stack data science project analysing how the US-Israel military operation against Iran (Operation Epic Fury, March 2026) triggered one of the most volatile oil price episodes in modern history — and how Anthropic's Claude AI was embedded in Palantir's Maven Smart System to support battlefield targeting decisions.

---

## Project Structure

```
iran-war-oil-crisis/
├── iran_war_oil_claude_ai.ipynb      # Main Jupyter/Kaggle notebook
├── oil_price_timeline.csv            # Brent & WTI price data (Feb-Mar 2026)
├── world_impact.csv                  # Global economic impact scores (12 countries)
├── ml_scenario_forecasts.csv         # 3-scenario ML forecasts (W+1 to W+4)
├── claude_military_timeline.csv      # Claude AI battlefield deployment timeline
├── requirements.txt
└── README.md
```

---

## Features

### Notebook (`iran_war_oil_claude_ai.ipynb`)
- **Oil Price Analysis** — Timeline visualisation of Brent & WTI from $74 to $120/barrel
- **Volatility Analysis** — Daily returns, descriptive statistics
- **LSTM Forecasting** — Deep learning model trained on price sequence data
- **Monte Carlo Simulation** — 1,000-path simulation across 3 geopolitical scenarios
- **World Impact Scoring** — 12 countries ranked by oil dependency and market exposure
- **Claude AI Timeline** — 4-phase breakdown of Claude's battlefield role
- **RAG Q&A** — Live Claude API integration with knowledge base retrieval
- **Interactive Dashboard** — Plotly combined visualisation (saved as HTML)

---

## Datasets

| File | Rows | Description |
|---|---|---|
| `oil_price_timeline.csv` | 12 | Brent & WTI prices with event labels (Feb 20 – Mar 10 2026) |
| `world_impact.csv` | 12 | Country impact scores, type (importer/exporter), market detail |
| `ml_scenario_forecasts.csv` | 5 | W+1 to W+4 price forecasts for 3 scenarios |
| `claude_military_timeline.csv` | 4 | Claude AI deployment phases, dates, tech stack |

---

## Quick Start

```bash
git clone https://github.com/yourusername/iran-war-oil-crisis
cd iran-war-oil-crisis
pip install -r requirements.txt
jupyter notebook iran_war_oil_claude_ai.ipynb
```

### Claude API (for RAG module)
```bash
export ANTHROPIC_API_KEY=your_key_here
```
On Kaggle, add `ANTHROPIC_API_KEY` as a Kaggle Secret and uncomment the secrets block in the notebook.

---

## Key Findings

| Metric | Value |
|---|---|
| Total Brent surge (pre-war to peak) | +61% ($74 to $120) |
| Peak price | $119.80 — March 8, 2026 |
| Hormuz threat single-day drop | -6% |
| Still above pre-war (Mar 10) | +25% |
| Claude targets generated Day 1 | ~1,000 |
| Most impacted country | Japan (score: 92) |
| Ceasefire scenario W+4 | $71/barrel |
| Hormuz closure scenario W+4 | $241/barrel |

---

## Tech Stack

`Python` `TensorFlow/Keras` `LSTM` `Monte Carlo` `Pandas` `Plotly` `Matplotlib` `scikit-learn` `Anthropic Claude API` `RAG` `React` `Recharts`

---

## Data Sources

- BBC News — Oil price reporting, March 2026
- Al Jazeera — Claude AI military use reporting, March 2026
- Reuters — Operation Epic Fury coverage
- Washington Post — Palantir Maven Smart System reporting

---

*March 2026 — Educational/research project*
