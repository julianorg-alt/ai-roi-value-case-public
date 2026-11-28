# Value case: [deployment name]

Keep each section to half a page at most. A claim with no measurement or source stays marked “assumption”.

## 1. Decision requested

One sentence: what is asked (extend, prolong the pilot, stop), of whom, by when.

## 2. Target task and scope

- Task: a single one, frequent and timeable (example: drafting the reply to a tier-1 complaint).
- Who does it today, how many people, how many times a month.
- Out of scope: what the deployment does not touch.

## 3. Baseline

| Item | Value | How it is measured | Date | Source |
|---|---|---|---|---|
| Average time per task | | timed on a sample of [n] tasks | | |
| Monthly volume | | export from the business tool | | |
| Error or rework rate | | review of a sample | | |
| Loaded hourly cost | | finance | | |

## 4. Indicators

| Indicator | Type | Baseline | Target | Source | Frequency |
|---|---|---|---|---|---|
| Adoption (active users / users with access) | leading | | | tool logs | weekly |
| Time per task, review included | outcome | | | timing | monthly |
| Share of outputs needing rework | quality | | | sample review | monthly |
| API or seat cost per task | cost | | | invoice, console | monthly |
| User satisfaction | leading | | | short survey | monthly |

A leading indicator tells early whether the deployment is taking hold; an outcome indicator tells whether it pays.

## 5. Before and after measurement

1. Same task, same measurement method, same kind of sample before and after.
2. Baseline taken before the deployment, not reconstructed afterwards.
3. Human review is counted in the time after.
4. Outputs that need rework are counted with their rework time.
5. Method differences noted here: [none / which].

## 6. Calculation

Paste the Markdown copied from the calculator (`index.html`, “Copy for the value case” button), with the prudent and favorable range, then state for each parameter whether it is measured or assumed. If the times come from timings, attach the raw measurements and the interval of the saving per task given by the page.

## 7. What is not priced

- Quality: errors avoided or introduced.
- Risk and compliance: data processed, hosting, logging, security review.
- Effects on people: workload, training, acceptance.

## 8. Risks and stop conditions

| Risk | Signal | Stop or review threshold | Owner |
|---|---|---|---|
| Adoption too low | active users | below [x]% at 60 days | |
| Quality too low | share of outputs needing rework | above [x]% | |
| Cost drifting | cost per task | above [x] € | |

## 9. Reviews

| Checkpoint | Date | Adoption | Time per task | Rework | Monthly net | Decision |
|---|---|---|---|---|---|---|
| 30 days | | | | | | |
| 60 days | | | | | | |
| 90 days | | | | | | |

## 10. Sources

Every figure in the case points here: document, date, person or tool that produced it.
