# Filled example: lighter data in a BIM model checking product

This example rests on two real measurements from an online BIM model checking product, which checks IFC models (buildings and infrastructure) against requirements. Both gains come from changes to the software written with a coding agent (Claude Code). No AI call happens during the task, so the calculation has no API cost. The example shows the method: a measurement before, a measurement after, and assumptions written down as assumptions.

## 1. Decision requested

Sample wording: keep the optimisation in the standard offer and extend it to every customer organisation, decided by the product owner before the end of the quarter.

## 2. Target task and scope

- Task: refreshing a Power BI dashboard connected to a large model.
- Who: users who follow a project’s compliance in Power BI.
- Out of scope: the check itself and the 3D viewer.

## 3. Baseline and measurement after

| Item | Before | After | How it is measured | Status |
|---|---|---|---|---|
| Power BI refresh, 1.2 GB IFC model | about 10 min | under 2 min | measurement bench | measured |
| Refresh bandwidth | reference | 75% less | same bench | measured |
| Size of a customer folder of 13 models | 1,692 MB | 484 MB (71% less), no data lost | optimisation with automatic output verification | measured |

## 4. Indicators

| Indicator | Type | Baseline | Target | Source |
|---|---|---|---|---|
| Refresh time on the largest model | outcome | about 10 min | under 2 min | bench |
| Failed or abandoned refreshes | quality | to be measured | | gateway logs |
| Organisations with the optimisation on | leading | a few selected organisations | all | configuration |

## 5. Calculation

Only the before and after times are measured. The other parameters are illustrative assumptions, to be replaced with real volumes.

| Parameter | Value | Status |
|---|---|---|
| Users | 10 | assumption |
| Adoption | 100% (server side, no user action) | assumption |
| Ramp-up | none: target adoption from month one | assumption (server-side change) |
| Discount rate | 0% | one-year horizon |
| Refreshes per user per month | 20 | assumption |
| Time before | 10 min | measured (approximate) |
| Time after | 2 min | measured (upper bound) |
| Loaded hourly cost | €55/h | assumption |
| Waiting time redeployed | 25% | assumption |
| Seat, API, run cost | €0 | no per-task cost |
| Setup | not priced | development cost was not tracked |

Calculator result with these values: 200 refreshes a month, 8 minutes saved per refresh, 26.7 hours a month, that is €367 a month of redeployed time and €4,400 over twelve months. ROI cannot be computed without the setup cost; the calculator gives the monthly value, which tells how many months of development the gain can pay back.

## 6. What is not priced

- The 71% cut in storage and transfer, not converted into euros.
- Working comfort: waiting 2 minutes instead of 10.

## 7. Reviews

At 30 days, measure the real number of refreshes and the share that fail, then redo the calculation with real volumes in place of the assumptions.

## 8. Sources

- Internal measurements by the product’s vendor (Power BI refresh bench on a 1.2 GB IFC model; optimisation of a 13-model customer folder), taken in 2026 by the author. The bench details are not published.
- Parameters marked “assumption”: chosen for the example, not measured.
