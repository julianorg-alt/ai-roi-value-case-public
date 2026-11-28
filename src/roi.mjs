// Pure calculation module: no DOM access, so the same code runs in the page and under `node --test`.

export const FIELDS = [
  { key: 'users', group: 'usage', slider: [1, 500], min: 0, max: 1e6, step: 1,
    label: { fr: 'Utilisateurs équipés', en: 'Users with access' },
    help: { fr: 'Personnes qui reçoivent une licence ou un accès.', en: 'People who get a seat or access.' } },
  { key: 'adoptionPct', group: 'usage', slider: [0, 100], min: 0, max: 100, step: 1, unit: '%',
    label: { fr: 'Adoption cible', en: 'Target adoption' },
    help: { fr: 'Part des utilisateurs qui font vraiment la tâche avec l’outil. Mesurée, pas supposée.', en: 'Share of users who actually do the task with the tool. Measured, not assumed.' } },
  { key: 'rampStartPct', group: 'usage', slider: [0, 100], min: 0, max: 100, step: 1, unit: '%',
    label: { fr: 'Adoption le premier mois', en: 'Adoption in month one' },
    help: { fr: 'Rares sont les équipes qui s’y mettent toutes dès le premier jour.', en: 'Few teams all start on day one.' } },
  { key: 'rampMonths', group: 'usage', slider: [1, 24], min: 1, max: 60, step: 1,
    label: { fr: 'Mois pour atteindre l’adoption cible', en: 'Months to reach target adoption' },
    help: { fr: '1 : adoption cible dès le premier mois. Sinon, montée régulière entre les deux.', en: '1: target adoption from month one. Otherwise a steady climb in between.' } },
  { key: 'tasksPerUserMonth', group: 'usage', slider: [0, 200], min: 0, max: 1e5, step: 1,
    label: { fr: 'Tâches par utilisateur et par mois', en: 'Tasks per user per month' },
    help: { fr: 'Occurrences de la tâche visée (un rapport, une analyse, une réponse).', en: 'Occurrences of the target task (a report, an analysis, a reply).' } },
  { key: 'minutesBefore', group: 'time', slider: [0, 240], min: 0, max: 1e5, step: 0.1, unit: 'min',
    label: { fr: 'Durée avant (minutes par tâche)', en: 'Time before (minutes per task)' },
    help: { fr: 'Situation de départ, mesurée sur un échantillon.', en: 'Baseline, measured on a sample.' } },
  { key: 'minutesAfter', group: 'time', slider: [0, 240], min: 0, max: 1e5, step: 0.1, unit: 'min',
    label: { fr: 'Durée après (minutes par tâche)', en: 'Time after (minutes per task)' },
    help: { fr: 'Avec l’outil, relecture humaine comprise.', en: 'With the tool, human review included.' } },
  { key: 'reworkSharePct', group: 'time', slider: [0, 100], min: 0, max: 100, step: 1, unit: '%',
    label: { fr: 'Part des sorties à reprendre', en: 'Share of outputs needing rework' },
    help: { fr: 'Sorties jugées insuffisantes à la relecture.', en: 'Outputs found insufficient at review.' } },
  { key: 'reworkMinutes', group: 'time', slider: [0, 120], min: 0, max: 1e5, step: 0.1, unit: 'min',
    label: { fr: 'Durée d’une reprise (minutes)', en: 'Rework time (minutes)' },
    help: { fr: 'Temps pour corriger une sortie insuffisante.', en: 'Time to fix one insufficient output.' } },
  { key: 'hourlyCost', group: 'value', slider: [0, 200], min: 0, max: 1e5, step: 0.01, unit: '€/h',
    label: { fr: 'Coût horaire chargé', en: 'Loaded hourly cost' },
    help: { fr: 'Salaire chargé divisé par les heures travaillées.', en: 'Loaded salary divided by hours worked.' } },
  { key: 'capturePct', group: 'value', slider: [0, 100], min: 0, max: 100, step: 1, unit: '%',
    label: { fr: 'Temps libéré réellement réemployé', en: 'Freed time actually redeployed' },
    help: { fr: 'Le temps gagné ne vaut de l’argent que s’il sert à autre chose. 100 % est rarement vrai.', en: 'Saved time is only worth money if it is used for something else. 100% is rarely true.' } },
  { key: 'seatCostMonth', group: 'cost', slider: [0, 200], min: 0, max: 1e6, step: 0.01, unit: '€',
    label: { fr: 'Licence par utilisateur et par mois', en: 'Seat cost per user per month' },
    help: { fr: 'Payée pour chaque utilisateur équipé, qu’il s’en serve ou non.', en: 'Paid for every user with access, whether they use it or not.' } },
  { key: 'aiCostPerTask', group: 'cost', slider: [0, 5], min: 0, max: 1e5, step: 0.001, unit: '€',
    label: { fr: 'Coût d’API par tâche', en: 'API cost per task' },
    help: { fr: 'Jetons consommés multipliés par le tarif public. 0 si tout passe par la licence.', en: 'Tokens used times the list price. 0 if the seat covers it.' } },
  { key: 'runCostMonth', group: 'cost', slider: [0, 10000], min: 0, max: 1e8, step: 1, unit: '€',
    label: { fr: 'Exploitation par mois', en: 'Run cost per month' },
    help: { fr: 'Hébergement, surveillance, temps de l’équipe qui maintient.', en: 'Hosting, monitoring, time of the team that maintains it.' } },
  { key: 'setupCost', group: 'cost', slider: [0, 200000], min: 0, max: 1e9, step: 1, unit: '€',
    label: { fr: 'Mise en place (une fois)', en: 'Setup (one-off)' },
    help: { fr: 'Intégration, formation, revue sécurité et conformité.', en: 'Integration, training, security and compliance review.' } },
  { key: 'discountPctYear', group: 'cost', slider: [0, 20], min: 0, max: 50, step: 0.5, unit: '%/an',
    label: { fr: 'Taux d’actualisation (par an)', en: 'Discount rate (per year)' },
    help: { fr: 'Ce que coûte l’argent immobilisé. 0 % : un euro dans un an vaut un euro aujourd’hui.', en: 'What money tied up costs. 0%: a euro next year is worth a euro today.' } },
  { key: 'horizonMonths', group: 'cost', slider: [1, 60], min: 1, max: 120, step: 1,
    label: { fr: 'Horizon de calcul (mois)', en: 'Horizon (months)' },
    help: { fr: 'Période sur laquelle on compare valeur et coûts.', en: 'Period over which value and costs are compared.' } },
];

// Neutral sample values, labelled as such in the page. Replace them with your own measurements.
export const DEFAULTS = {
  users: 50,
  adoptionPct: 60,
  tasksPerUserMonth: 20,
  minutesBefore: 45,
  minutesAfter: 20,
  reworkSharePct: 15,
  reworkMinutes: 15,
  hourlyCost: 55,
  capturePct: 50,
  seatCostMonth: 30,
  aiCostPerTask: 0,
  runCostMonth: 500,
  setupCost: 15000,
  horizonMonths: 12,
  rampStartPct: 20,
  rampMonths: 4,
  discountPctYear: 0,
};

const KEYS = FIELDS.map(f => f.key);

export function validate(inputs) {
  const errors = {};
  for (const f of FIELDS) {
    const v = inputs?.[f.key];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      errors[f.key] = 'nan';
    } else if (v < f.min) {
      errors[f.key] = 'min';
    } else if (v > f.max) {
      errors[f.key] = 'max';
    }
  }
  return errors;
}

// Payback is searched this far ahead, so a late payback is still reported.
const SEARCH_MONTHS = 600;

function adoptionAt(i, m) {
  if (i.rampMonths <= 1 || m >= i.rampMonths) return i.adoptionPct;
  return i.rampStartPct + (i.adoptionPct - i.rampStartPct) * (m - 1) / (i.rampMonths - 1);
}

function month(i, adoptionPct) {
  const tasksMonth = i.users * i.tasksPerUserMonth * (adoptionPct / 100);
  const netMinutesPerTask = i.minutesBefore - i.minutesAfter - (i.reworkSharePct / 100) * i.reworkMinutes;
  const hoursSavedMonth = tasksMonth * netMinutesPerTask / 60;
  const valueMonth = hoursSavedMonth * i.hourlyCost * (i.capturePct / 100);
  const costMonth = i.users * i.seatCostMonth + tasksMonth * i.aiCostPerTask + i.runCostMonth;
  return { tasksMonth, netMinutesPerTask, hoursSavedMonth, valueMonth, costMonth };
}

// Cash flows are counted at the end of each month and discounted to month 0; the setup is paid at month 0.
export function compute(inputs) {
  const errors = validate(inputs);
  const bad = Object.keys(errors);
  if (bad.length) throw new RangeError(`invalid inputs: ${bad.join(', ')}`);

  const i = inputs;
  const H = i.horizonMonths;
  const steady = month(i, i.adoptionPct);
  const netMonth = steady.valueMonth - steady.costMonth;
  const discount = m => (1 + i.discountPctYear / 100) ** (m / 12);

  let totalValue = 0;
  let totalCost = i.setupCost;
  let valuePerNetMinute = 0;
  let cash = -i.setupCost;
  let paybackMonths = null;
  const curve = [cash];
  const adoptionByMonth = [];
  const last = Math.max(H, SEARCH_MONTHS);
  for (let m = 1; m <= last; m++) {
    const a = adoptionAt(i, m);
    const f = month(i, a);
    const d = discount(m);
    const before = cash;
    cash += (f.valueMonth - f.costMonth) / d;
    if (m <= H) {
      totalValue += f.valueMonth / d;
      totalCost += f.costMonth / d;
      valuePerNetMinute += f.tasksMonth / 60 * i.hourlyCost * (i.capturePct / 100) / d;
      curve.push(cash);
      adoptionByMonth.push(a);
    }
    if (paybackMonths === null) {
      if (m === 1 && before >= 0 && cash > before) paybackMonths = 0;
      else if (before < 0 && cash >= 0) paybackMonths = m - 1 + (-before) / (cash - before);
    }
    if (m >= H && paybackMonths !== null) break;
  }

  const roiPct = totalCost > 0 ? (totalValue - totalCost) / totalCost * 100 : null;
  // Value is proportional to the net minutes per task, costs do not depend on them.
  const breakEvenMinutes = valuePerNetMinute > 0 ? totalCost / valuePerNetMinute : null;

  return { ...steady, netMonth, totalValue, totalCost, curve, adoptionByMonth, paybackMonths, roiPct, breakEvenMinutes };
}

export function scenario(inputs, overrides) {
  return compute({ ...inputs, ...overrides });
}

// The four assumptions people are least sure of: each gets a prudent and a favorable value.
export const RANGE_KEYS = ['adoptionPct', 'minutesAfter', 'reworkSharePct', 'capturePct'];
// Example values, like DEFAULTS: [prudent, favorable].
export const DEFAULT_RANGE = { adoptionPct: [40, 75], minutesAfter: [25, 15], reworkSharePct: [25, 8], capturePct: [30, 70] };

export function validateRange(range) {
  const errors = {};
  for (const k of RANGE_KEYS) {
    const f = FIELDS.find(x => x.key === k);
    const pair = range?.[k];
    const check = v => (typeof v !== 'number' || !Number.isFinite(v) ? 'nan' : v < f.min ? 'min' : v > f.max ? 'max' : null);
    const e = Array.isArray(pair) ? pair.map(check) : ['nan', 'nan'];
    if (e[0] || e[1]) errors[k] = e;
  }
  return errors;
}

// All prudent values together, then all favorable values together: the band is wide on purpose.
export function rangeResults(inputs, range) {
  const pick = side => Object.fromEntries(RANGE_KEYS.map(k => [k, range[k][side]]));
  return { prudent: scenario(inputs, pick(0)), favorable: scenario(inputs, pick(1)) };
}

export function encodeRange(range) {
  const p = new URLSearchParams();
  for (const k of RANGE_KEYS) if (range?.[k]) { p.set(`lo_${k}`, String(range[k][0])); p.set(`hi_${k}`, String(range[k][1])); }
  return p.toString();
}

export function decodeRange(hash) {
  const p = new URLSearchParams(String(hash).replace(/^#/, ''));
  const out = {};
  for (const k of RANGE_KEYS) {
    if (!p.has(`lo_${k}`) || !p.has(`hi_${k}`)) continue;
    const pair = [p.get(`lo_${k}`), p.get(`hi_${k}`)].map(x => (x.trim() === '' ? Number.NaN : Number(x)));
    if (pair.every(Number.isFinite)) out[k] = pair;
  }
  return out;
}

export function encodeState(inputs) {
  const p = new URLSearchParams();
  for (const k of KEYS) if (k in inputs) p.set(k, String(inputs[k]));
  return p.toString();
}

export function decodeState(hash) {
  const p = new URLSearchParams(String(hash).replace(/^#/, ''));
  const out = {};
  for (const k of KEYS) {
    if (!p.has(k)) continue;
    const raw = p.get(k);
    const v = raw.trim() === '' ? Number.NaN : Number(raw);
    if (Number.isFinite(v)) out[k] = v;
  }
  return out;
}

const T = {
  fr: {
    title: 'Dossier de valeur : calcul', assumptions: 'Hypothèses', results: 'Résultats',
    field: 'Paramètre', value: 'Valeur',
    tasksMonth: 'Tâches traitées par mois', netMinutesPerTask: 'Minutes nettes gagnées par tâche',
    hoursSavedMonth: 'Heures gagnées par mois', valueMonth: 'Valeur par mois', costMonth: 'Coût par mois',
    netMonth: 'Résultat net par mois', totalValue: 'Valeur sur l’horizon', totalCost: 'Coût sur l’horizon',
    roiPct: 'Retour sur investissement', paybackMonths: 'Retour de la mise en place (mois)',
    breakEvenMinutes: 'Gain net minimal par tâche pour être rentable (min)',
    none: 'non atteint', na: 'non applicable', immediate: 'immédiat',
    rangeTitle: 'Fourchette', prudent: 'prudent', probable: 'probable', favorable: 'favorable',
    note: 'Calcul fait avec ai-roi-value-case. Les hypothèses sont à remplacer par des mesures.',
  },
  en: {
    title: 'Value case: calculation', assumptions: 'Assumptions', results: 'Results',
    field: 'Parameter', value: 'Value',
    tasksMonth: 'Tasks handled per month', netMinutesPerTask: 'Net minutes saved per task',
    hoursSavedMonth: 'Hours saved per month', valueMonth: 'Value per month', costMonth: 'Cost per month',
    netMonth: 'Net result per month', totalValue: 'Value over the horizon', totalCost: 'Cost over the horizon',
    roiPct: 'Return on investment', paybackMonths: 'Setup payback (months)',
    breakEvenMinutes: 'Minimum net saving per task to break even (min)',
    none: 'not reached', na: 'not applicable', immediate: 'immediate',
    rangeTitle: 'Range', prudent: 'prudent', probable: 'likely', favorable: 'favorable',
    note: 'Calculated with ai-roi-value-case. Replace assumptions with measurements.',
  },
};

export const TEXT = T;

export function fmt(n, lang, digits = 0) {
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n);
}

export function toMarkdown(inputs, r, lang = 'fr', extra = null) {
  const t = T[lang] ?? T.fr;
  const eur = n => `${fmt(n, lang)} €`;
  const lines = [`## ${t.title}`, '', `### ${t.assumptions}`, '', `| ${t.field} | ${t.value} |`, '|---|---|'];
  for (const f of FIELDS) lines.push(`| ${f.label[lang]} | ${fmt(inputs[f.key], lang, 3)}${f.unit ? ' ' + f.unit : ''} |`);
  lines.push('', `### ${t.results}`, '', `| ${t.field} | ${t.value} |`, '|---|---|');
  lines.push(`| ${t.tasksMonth} | ${fmt(r.tasksMonth, lang, 1)} |`);
  lines.push(`| ${t.netMinutesPerTask} | ${fmt(r.netMinutesPerTask, lang, 1)} |`);
  lines.push(`| ${t.hoursSavedMonth} | ${fmt(r.hoursSavedMonth, lang, 1)} |`);
  lines.push(`| ${t.valueMonth} | ${eur(r.valueMonth)} |`);
  lines.push(`| ${t.costMonth} | ${eur(r.costMonth)} |`);
  lines.push(`| ${t.netMonth} | ${eur(r.netMonth)} |`);
  lines.push(`| ${t.totalValue} | ${eur(r.totalValue)} |`);
  lines.push(`| ${t.totalCost} | ${eur(r.totalCost)} |`);
  lines.push(`| ${t.roiPct} | ${r.roiPct === null ? t.na : fmt(r.roiPct, lang) + ' %'} |`);
  lines.push(`| ${t.paybackMonths} | ${r.paybackMonths === null ? t.none : r.paybackMonths === 0 ? t.immediate : fmt(r.paybackMonths, lang, 1)} |`);
  lines.push(`| ${t.breakEvenMinutes} | ${r.breakEvenMinutes === null ? t.na : fmt(r.breakEvenMinutes, lang, 1)} |`);
  if (extra?.range) {
    const pb = x => (x.paybackMonths === null ? t.none : x.paybackMonths === 0 ? t.immediate : fmt(x.paybackMonths, lang, 1));
    lines.push('', `### ${t.rangeTitle}`, '', `| ${t.field} | ${t.prudent} | ${t.probable} | ${t.favorable} |`, '|---|---|---|---|');
    for (const k of RANGE_KEYS) {
      const f = FIELDS.find(x => x.key === k);
      const u = f.unit ? ` ${f.unit}` : '';
      lines.push(`| ${f.label[lang]} | ${fmt(extra.range[k][0], lang, 3)}${u} | ${fmt(inputs[k], lang, 3)}${u} | ${fmt(extra.range[k][1], lang, 3)}${u} |`);
    }
    lines.push(`| ${t.totalValue} − ${t.totalCost} | ${eur(extra.prudent.totalValue - extra.prudent.totalCost)} | ${eur(r.totalValue - r.totalCost)} | ${eur(extra.favorable.totalValue - extra.favorable.totalCost)} |`);
    lines.push(`| ${t.paybackMonths} | ${pb(extra.prudent)} | ${pb(r)} | ${pb(extra.favorable)} |`);
  }
  lines.push('', `_${t.note}_`, '');
  return lines.join('\n');
}

// Cumulative net result month by month: month 0 is the setup outlay.
export function cumulative(inputs) {
  return compute(inputs).curve;
}

const SENSITIVE = ['users', 'adoptionPct', 'rampStartPct', 'rampMonths', 'discountPctYear', 'tasksPerUserMonth', 'minutesBefore', 'minutesAfter', 'reworkSharePct',
  'reworkMinutes', 'hourlyCost', 'capturePct', 'seatCostMonth', 'aiCostPerTask', 'runCostMonth', 'setupCost'];

// Net result over the horizon when one assumption moves by plus or minus pct percent, the others fixed.
export function sensitivity(inputs, pct = 20) {
  const net = i => { const r = compute(i); return r.totalValue - r.totalCost; };
  const base = net(inputs);
  const out = [];
  for (const key of SENSITIVE) {
    const f = FIELDS.find(x => x.key === key);
    const v = inputs[key];
    if (!v) continue;
    const at = x => net({ ...inputs, [key]: Math.min(f.max, Math.max(f.min, x)) });
    const low = at(v * (1 - pct / 100));
    const high = at(v * (1 + pct / 100));
    if (low === base && high === base) continue;
    out.push({ key, low, high, base });
  }
  return out.sort((a, b) => Math.abs(b.high - b.low) - Math.abs(a.high - a.low));
}

// Plain-language reading of a result, for the headline.
export function verdict(r) {
  if (r.netMonth === 0 && r.paybackMonths === null) return { kind: 'flat' };
  if (r.paybackMonths === null) return { kind: r.netMonth > 0 ? 'distant' : 'loss' };
  if (r.paybackMonths === 0) return { kind: 'immediate' };
  if (r.paybackMonths <= r.curve.length - 1) return { kind: 'payback' };
  return { kind: 'late' };
}
