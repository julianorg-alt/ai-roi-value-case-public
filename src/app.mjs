import {
  FIELDS, DEFAULTS, RANGE_KEYS, DEFAULT_RANGE, validate, validateRange, compute, rangeResults, sensitivity, verdict,
  encodeState, decodeState, encodeRange, decodeRange, toMarkdown, fmt,
} from './roi.mjs';
import { parseDurations, summarize, compareMeans } from './stats.mjs';

const GROUPS = {
  usage: { fr: 'Qui s’en sert, et combien', en: 'Who uses it, and how much' },
  time: { fr: 'Temps par tâche', en: 'Time per task' },
  value: { fr: 'Ce que vaut le temps gagné', en: 'What the saved time is worth' },
  cost: { fr: 'Ce que ça coûte', en: 'What it costs' },
};

const UI = {
  fr: {
    title: 'Calculateur de retour sur investissement d’un déploiement d’IA',
    lede: 'Pour une seule tâche, mesurée avant et après. Les valeurs de départ sont un exemple : remplacez-les par vos chiffres.',
    inputsTitle: 'Vos hypothèses',
    example: 'exemple', yours: 'vos valeurs',
    netLabel: 'Résultat net sur {h} mois',
    v_immediate: 'Rentable dès le premier mois.',
    v_payback: 'Remboursé en {p} mois.',
    v_late: 'Rentable, mais pas sur {h} mois.',
    v_distant: 'Remboursé dans plus de 50 ans.',
    v_loss: 'Ne se rembourse pas.',
    v_flat: 'Ni gain ni perte chaque mois.',
    s_immediate: 'Rien à rembourser au départ. Une fois l’adoption atteinte, {m} nets chaque mois.',
    s_payback: 'Une fois l’adoption atteinte, {m} nets chaque mois. Sur {h} mois, la valeur dépasse les coûts de {pct}.',
    s_late: 'La mise en place n’est remboursée qu’au mois {p}. Allongez l’horizon ou réduisez la mise en place.',
    s_distant: 'Chaque mois rapporte {m} nets, trop peu face à la mise en place.',
    s_loss: 'Chaque mois coûte {m} de plus qu’il ne rapporte. Regardez à droite ce qui pèse le plus.',
    s_flat: 'Chaque mois rapporte exactement ce qu’il coûte : la mise en place n’est jamais remboursée.',
    rangeLine: 'Cas prudent : {lo}. Cas favorable : {hi}.',
    rb_paid: 'remboursé en {p} mois', rb_now: 'rentable dès le premier mois', rb_never: 'jamais remboursé',
    netRange: 'fourchette : {lo} à {hi}', to: 'à',
    roi: 'Retour sur investissement', payback: 'Mise en place remboursée', breakeven: 'Gain minimal par tâche', hoursKpi: 'Heures gagnées par mois',
    months: 'mois', min: 'min', never: 'jamais', immediate: 'immédiat', na: 'non applicable', over50: 'plus de 50 ans',
    beNote: 'aujourd’hui : {x} min', paybackNote: 'au-delà de l’horizon', hoursNote: 'une fois l’adoption atteinte',
    breakEvenAt: 'remboursé au mois {p}',
    chartDesc: 'Trésorerie cumulée, du mois 0 (mise en place) au mois {h}. La bande va du cas prudent au cas favorable.',
    keptLabel: 'gardé',
    weightTitle: 'Ce qui pèse le plus',
    weightLead: 'Chaque hypothèse bougée de 20 % dans les deux sens, les autres fixes. La plus longue barre est celle à mesurer en premier.',
    legendUp: 'améliore le résultat', legendDown: 'le dégrade', legendShade: 'teinte claire : hypothèse baissée de 20 % ; foncée : montée de 20 %',
    detail: 'Un mois, une fois l’adoption atteinte',
    tasksMonth: 'Tâches traitées', netMinutes: 'Minutes nettes gagnées par tâche', hours: 'Heures gagnées',
    valueMonth: 'Valeur du temps réemployé', costMonth: 'Coûts', netMonth: 'Net',
    rangeTitle: 'Fourchette',
    rangeLead: 'Pour les quatre hypothèses les moins sûres, une valeur prudente et une valeur favorable. Le cas prudent les prend toutes prudentes en même temps, le cas favorable toutes favorables : la bande est large exprès.',
    rangeOn: 'Afficher la fourchette', prudent: 'Prudent', probable: 'Probable', favorable: 'Favorable',
    measureTitle: 'Partir de vos chronométrages',
    measureLead: 'Collez les durées mesurées, en minutes, une par ligne ou séparées par des espaces. La virgule sert aux décimales (12,5).',
    before: 'Avant (minutes)', after: 'Après (minutes)',
    mSummary: '{n} mesures, moyenne {m} min (intervalle à 95 % : {lo} à {hi} min).',
    mOne: '{n} mesure, moyenne {m} min : il en faut deux pour un intervalle.',
    mNone: 'Aucune mesure.',
    mRejected: 'Ignoré, ce n’est pas une durée : {x}.',
    mGain: 'Gain par tâche : {g} min (intervalle à 95 % : {lo} à {hi} min).',
    mGainNoCi: 'Gain par tâche : {g} min.',
    mGainUnsure: 'L’intervalle contient zéro : avec ces mesures, on ne peut pas dire que l’outil fait gagner du temps.',
    mUse: 'Utiliser ces mesures',
    mUsed: 'Durées avant et après remplacées par les moyennes ; la fourchette de la durée après prend les bornes de son intervalle.',
    mFew: 'Moins de dix mesures d’un côté : l’intervalle est large, mesurez davantage si vous pouvez.',
    compareTitle: 'Comparer deux calculs',
    compareLead: 'Gardez ce calcul, changez des hypothèses, et voyez l’écart. Le calcul gardé apparaît en pointillé sur la courbe.',
    keep: 'Garder ce calcul', clearKept: 'Oublier le calcul gardé',
    colKept: 'Gardé', colNow: 'Actuel', colDiff: 'Écart',
    rowNet: 'Résultat net', rowRoi: 'Retour sur investissement', rowPayback: 'Remboursement', rowCost: 'Coûts sur l’horizon',
    keptHorizon: 'Les deux calculs n’ont pas le même horizon : le calcul gardé n’est pas tracé.',
    copyMd: 'Copier pour le dossier de valeur', copyLink: 'Copier le lien de ce calcul', reset: 'Revenir à l’exemple', print: 'Imprimer une page',
    copied: 'Copié.', copyFailed: 'Copie refusée par le navigateur : sélectionnez le texte ci-dessous.',
    fix: 'Corrigez ces champs pour voir le résultat :',
    errNan: 'Entrez un nombre.', errMin: 'Valeur trop petite (minimum {v}).', errMax: 'Valeur trop grande (maximum {v}).',
    printAssumptions: 'Hypothèses',
    sliderSuffix: '(curseur)',
    methodTitle: 'Mesurer avant et après',
    method: [
      'Choisir une seule tâche, fréquente et chronométrable : un rapport, une analyse, une réponse à un client.',
      'Mesurer la situation de départ sur un échantillon réel (dix occurrences au moins), avant de déployer.',
      'Déployer sur un groupe pilote et mesurer la même tâche de la même façon, relecture humaine comprise.',
      'Compter les sorties à reprendre et le temps de reprise : c’est le coût de qualité que l’on oublie le plus.',
      'Mesurer l’adoption réelle (qui s’en sert, combien de fois), et refaire le calcul à 30, 60 et 90 jours.',
    ],
    limitsTitle: 'Ce que ce calcul ne dit pas',
    limits: [
      'Du temps gagné n’est pas de l’argent gagné : le champ « temps réemployé » le rappelle, et 100 % est rarement vrai.',
      'La qualité, le risque et la conformité ne sont pas chiffrés ici ; ils vont dans le dossier de valeur, à côté.',
      'Montants hors taxes, en euros. Les licences sont comptées pour chaque utilisateur équipé, qu’il s’en serve ou non.',
      'Une fois l’adoption atteinte, chaque mois est compté pareil. Sur plusieurs années, mettez un taux d’actualisation.',
      'L’intervalle des chronométrages suppose des mesures indépendantes, prises sur des tâches comparables.',
    ],
    templateTitle: 'Dossier de valeur',
    template: 'Le bouton « Copier pour le dossier de valeur » donne un tableau à coller dans le modèle : situation de départ, indicateurs, mesure avant et après, décision. Un exemple rempli s’appuie sur deux mesures réelles d’un logiciel de contrôle de maquettes BIM.',
    templateLink: 'Le modèle', exampleLink: 'L’exemple rempli',
    footer: 'Licence MIT. Le calcul se fait dans votre navigateur ; rien n’est envoyé.',
  },
  en: {
    title: 'AI deployment ROI calculator',
    lede: 'For one task, measured before and after. The starting values are an example: replace them with your own figures.',
    inputsTitle: 'Your assumptions',
    example: 'example', yours: 'your values',
    netLabel: 'Net result over {h} months',
    v_immediate: 'Pays off from month one.',
    v_payback: 'Paid back in {p} months.',
    v_late: 'Pays off, but not within {h} months.',
    v_distant: 'Paid back in more than 50 years.',
    v_loss: 'Never pays back.',
    v_flat: 'Breaks even each month.',
    s_immediate: 'Nothing to pay back up front. Once adoption is reached, {m} net every month.',
    s_payback: 'Once adoption is reached, {m} net every month. Over {h} months, value exceeds costs by {pct}.',
    s_late: 'Setup is only paid back in month {p}. Extend the horizon or cut the setup.',
    s_distant: 'Each month brings in {m} net, too little against the setup.',
    s_loss: 'Every month costs {m} more than it brings in. See on the right what weighs most.',
    s_flat: 'Every month brings in exactly what it costs: the setup is never paid back.',
    rangeLine: 'Prudent case: {lo}. Favorable case: {hi}.',
    rb_paid: 'paid back in {p} months', rb_now: 'pays off from month one', rb_never: 'never paid back',
    netRange: 'range: {lo} to {hi}', to: 'to',
    roi: 'Return on investment', payback: 'Setup paid back', breakeven: 'Minimum saving per task', hoursKpi: 'Hours saved per month',
    months: 'months', min: 'min', never: 'never', immediate: 'immediate', na: 'not applicable', over50: 'over 50 years',
    beNote: 'today: {x} min', paybackNote: 'beyond the horizon', hoursNote: 'once adoption is reached',
    breakEvenAt: 'paid back in month {p}',
    chartDesc: 'Cumulative cash, from month 0 (setup) to month {h}. The band runs from the prudent to the favorable case.',
    keptLabel: 'kept',
    weightTitle: 'What weighs most',
    weightLead: 'Each assumption moved 20% either way, the others fixed. The longest bar is the one to measure first.',
    legendUp: 'improves the result', legendDown: 'worsens it', legendShade: 'light shade: assumption 20% lower; dark: 20% higher',
    detail: 'A month, once adoption is reached',
    tasksMonth: 'Tasks handled', netMinutes: 'Net minutes saved per task', hours: 'Hours saved',
    valueMonth: 'Value of redeployed time', costMonth: 'Costs', netMonth: 'Net',
    rangeTitle: 'Range',
    rangeLead: 'For the four least certain assumptions, a prudent and a favorable value. The prudent case takes them all prudent at once, the favorable case all favorable: the band is wide on purpose.',
    rangeOn: 'Show the range', prudent: 'Prudent', probable: 'Likely', favorable: 'Favorable',
    measureTitle: 'Start from your timings',
    measureLead: 'Paste the measured durations, in minutes, one per line or separated by spaces. Use a comma or a dot for decimals (12,5 or 12.5).',
    before: 'Before (minutes)', after: 'After (minutes)',
    mSummary: '{n} timings, mean {m} min (95% interval: {lo} to {hi} min).',
    mOne: '{n} timing, mean {m} min: two are needed for an interval.',
    mNone: 'No timings.',
    mRejected: 'Ignored, not a duration: {x}.',
    mGain: 'Saving per task: {g} min (95% interval: {lo} to {hi} min).',
    mGainNoCi: 'Saving per task: {g} min.',
    mGainUnsure: 'The interval contains zero: with these timings, you cannot say the tool saves time.',
    mUse: 'Use these timings',
    mUsed: 'Time before and after replaced by the means; the range of the time after takes the bounds of its interval.',
    mFew: 'Fewer than ten timings on one side: the interval is wide, measure more if you can.',
    compareTitle: 'Compare two calculations',
    compareLead: 'Keep this calculation, change assumptions, and see the difference. The kept one shows as a dotted line on the curve.',
    keep: 'Keep this calculation', clearKept: 'Forget the kept calculation',
    colKept: 'Kept', colNow: 'Now', colDiff: 'Difference',
    rowNet: 'Net result', rowRoi: 'Return on investment', rowPayback: 'Payback', rowCost: 'Costs over the horizon',
    keptHorizon: 'The two calculations do not have the same horizon: the kept one is not drawn.',
    copyMd: 'Copy for the value case', copyLink: 'Copy a link to this calculation', reset: 'Back to the example', print: 'Print one page',
    copied: 'Copied.', copyFailed: 'The browser refused to copy: select the text below.',
    fix: 'Fix these fields to see the result:',
    errNan: 'Enter a number.', errMin: 'Too small (minimum {v}).', errMax: 'Too large (maximum {v}).',
    printAssumptions: 'Assumptions',
    sliderSuffix: '(slider)',
    methodTitle: 'Measure before and after',
    method: [
      'Pick one task that is frequent and can be timed: a report, an analysis, a reply to a customer.',
      'Measure the baseline on a real sample (at least ten occurrences) before deploying.',
      'Deploy to a pilot group and measure the same task the same way, human review included.',
      'Count the outputs that need rework and the time it takes: it is the quality cost most often left out.',
      'Measure actual adoption (who uses it, how often), and redo the calculation at 30, 60 and 90 days.',
    ],
    limitsTitle: 'What this calculation does not say',
    limits: [
      'Time saved is not money saved: the “time redeployed” field is there for that, and 100% is rarely true.',
      'Quality, risk and compliance are not priced here; they go in the value case, next to it.',
      'Amounts exclude VAT, in euros. Seats are counted for every user with access, whether they use it or not.',
      'Once adoption is reached, every month counts the same. Over several years, set a discount rate.',
      'The timing interval assumes independent measurements taken on comparable tasks.',
    ],
    templateTitle: 'Value case',
    template: 'The “Copy for the value case” button gives a table to paste into the template: baseline, indicators, before and after measurement, decision. A filled example rests on two real measurements from a BIM model checking product.',
    templateLink: 'The template', exampleLink: 'The filled example',
    footer: 'MIT licence. The calculation runs in your browser; nothing is sent.',
  },
};

const $ = sel => document.querySelector(sel);
const SVGNS = 'http://www.w3.org/2000/svg';
const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
let lang = 'fr';
let state = { ...DEFAULTS };
let range = structuredClone(DEFAULT_RANGE);
let rangeOn = true;
let kept = null;
let lastCurve = null;
let anim = 0;

const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
const eur = n => `${fmt(n, lang)} €`;
const eurShort = n => new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 }).format(n);
const pct = n => `${fmt(n, lang)} %`;
// Rounded parts first, so a headline always equals the value minus the cost shown with it.
const net = r => Math.round(r.totalValue) - Math.round(r.totalCost);

function storeKept(value) {
  try {
    if (value === null) localStorage.removeItem('roi-kept');
    else localStorage.setItem('roi-kept', JSON.stringify(value));
  } catch { /* storage may be blocked */ }
}

function restoreKept() {
  try { return JSON.parse(localStorage.getItem('roi-kept') ?? 'null'); } catch { return null; }
}

function readLang() {
  try {
    const saved = localStorage.getItem('roi-lang');
    if (saved === 'fr' || saved === 'en') return saved;
  } catch { /* ignore */ }
  return (navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

function node(tag, props = {}, ...children) {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...children);
  return n;
}

function numberBox(input, unit) {
  const box = node('div', { className: 'num' }, input);
  if (unit) box.append(node('span', { className: 'unit', textContent: unit }));
  return box;
}

function buildForm() {
  const t = UI[lang];
  const form = $('#inputs');
  form.replaceChildren();
  for (const [g, name] of Object.entries(GROUPS)) {
    const fs = node('fieldset', {}, node('legend', { textContent: name[lang] }));
    for (const f of FIELDS.filter(x => x.group === g)) {
      const id = `in-${f.key}`;
      const input = node('input', { id, type: 'number', min: String(f.min), max: String(f.max), step: String(f.step), inputMode: 'decimal' });
      input.dataset.key = f.key;
      input.value = Number.isFinite(state[f.key]) ? String(state[f.key]) : '';
      input.setAttribute('aria-describedby', `${id}-help ${id}-err`);
      const slider = node('input', { id: `rg-${f.key}`, type: 'range', min: String(f.slider[0]), max: String(f.slider[1]), step: String(f.step) });
      slider.dataset.for = f.key;
      slider.setAttribute('aria-label', `${f.label[lang]} ${t.sliderSuffix}`);
      slider.value = Number.isFinite(state[f.key]) ? String(state[f.key]) : String(f.slider[0]);
      fs.append(node('div', { className: 'field' },
        node('label', { htmlFor: id, textContent: f.label[lang] }), numberBox(input, f.unit), slider,
        node('p', { className: 'help', id: `${id}-help`, textContent: f.help[lang] }),
        node('p', { className: 'err', id: `${id}-err` })));
    }
    form.append(fs);
  }
}

function buildRange() {
  const t = UI[lang];
  const body = $('#range-body');
  body.replaceChildren();
  for (const k of RANGE_KEYS) {
    const f = FIELDS.find(x => x.key === k);
    const cell = (side, label) => {
      const input = node('input', { id: `rng-${side}-${k}`, type: 'number', min: String(f.min), max: String(f.max), step: String(f.step), inputMode: 'decimal' });
      input.dataset.key = k;
      input.dataset.side = String(side);
      input.value = Number.isFinite(range[k][side]) ? String(range[k][side]) : '';
      input.setAttribute('aria-label', `${f.label[lang]}, ${label}`);
      const td = node('td', {}, numberBox(input, f.unit));
      td.dataset.label = label;
      return td;
    };
    const mid = node('td', { className: 'mid' });
    mid.dataset.key = k;
    mid.dataset.label = t.probable;
    body.append(node('tr', {}, node('th', { scope: 'row', textContent: f.label[lang] }), cell(0, t.prudent), mid, cell(1, t.favorable)));
  }
}

function readForm() {
  const out = {};
  for (const input of document.querySelectorAll('#inputs input[type="number"]')) {
    out[input.dataset.key] = input.value.trim() === '' ? Number.NaN : Number(input.value);
  }
  return out;
}

function readRange() {
  const out = structuredClone(range);
  for (const input of document.querySelectorAll('#range-body input')) {
    out[input.dataset.key][Number(input.dataset.side)] = input.value.trim() === '' ? Number.NaN : Number(input.value);
  }
  return out;
}

const isDefault = s => FIELDS.every(f => s[f.key] === DEFAULTS[f.key]);

function setKpi(sel, value, tone, note = '') {
  const el = $(sel);
  el.dataset.tone = tone;
  el.querySelector('.v').textContent = value;
  el.querySelector('.n').textContent = note;
}

function paybackWords(r) {
  const t = UI[lang];
  const v = verdict(r).kind;
  if (v === 'immediate') return t.rb_now;
  if (v === 'loss' || v === 'flat' || v === 'distant') return t.rb_never;
  return fill(t.rb_paid, { p: fmt(r.paybackMonths, lang, 1) });
}

function paybackShort(r) {
  const t = UI[lang];
  if (r.paybackMonths === null) return r.netMonth > 0 ? t.over50 : t.never;
  return r.paybackMonths === 0 ? t.immediate : `${fmt(r.paybackMonths, lang, 1)} ${t.months}`;
}

function clearResults(t, bad, badRange, rErrors) {
  const ul = node('ul');
  const link = (target, text) => {
    const a = node('a', { href: `#${target}`, textContent: text });
    a.addEventListener('click', ev => { ev.preventDefault(); $(`#${target}`).focus(); });
    ul.append(node('li', {}, a));
  };
  for (const f of bad) link(`in-${f.key}`, f.label[lang]);
  for (const k of badRange) link(`rng-${rErrors[k][0] ? 0 : 1}-${k}`, `${t.rangeTitle} : ${FIELDS.find(x => x.key === k).label[lang]}`);
  $('#invalid').replaceChildren(node('p', { textContent: t.fix }), ul);
  // Clear every figure so no stale result can be read while an input is wrong.
  for (const sel of ['#t-net', '#t-roi', '#t-payback', '#t-breakeven', '#t-hours']) setKpi(sel, '', 'neutral');
  for (const sel of ['#verdict', '#sub', '#range-line', '#net-range']) $(sel).textContent = '';
  $('#peek-text').textContent = t.fix.replace(/ ?:$/, '.');
  $('#peek-value').textContent = '';
  $('#peek').dataset.tone = 'bad';
  $('#peek').removeAttribute('aria-label');
}

function render() {
  const t = UI[lang];
  state = readForm();
  range = readRange();
  const errors = validate(state);
  const rErrors = rangeOn ? validateRange(range) : {};
  for (const f of FIELDS) {
    const e = errors[f.key];
    $(`#in-${f.key}`).setAttribute('aria-invalid', e ? 'true' : 'false');
    $(`#in-${f.key}-err`).textContent = !e ? '' : e === 'nan' ? t.errNan
      : (e === 'min' ? t.errMin : t.errMax).replace('{v}', fmt(e === 'min' ? f.min : f.max, lang));
    if (!e) $(`#rg-${f.key}`).value = String(state[f.key]);
  }
  for (const input of document.querySelectorAll('#range-body input')) {
    const e = rErrors[input.dataset.key]?.[Number(input.dataset.side)];
    input.setAttribute('aria-invalid', e ? 'true' : 'false');
  }
  for (const td of document.querySelectorAll('#range-body .mid')) {
    const f = FIELDS.find(x => x.key === td.dataset.key);
    td.textContent = Number.isFinite(state[f.key]) ? `${fmt(state[f.key], lang, 2)}${f.unit ? ` ${f.unit}` : ''}` : '';
  }
  const example = isDefault(state);
  $('#mode').textContent = example ? t.example : t.yours;
  $('#mode').dataset.example = String(example);

  const bad = FIELDS.filter(f => errors[f.key]);
  const badRange = RANGE_KEYS.filter(k => rErrors[k]);
  if (bad.length || badRange.length) {
    $('#results').dataset.state = 'invalid';
    clearResults(t, bad, badRange, rErrors);
    return;
  }
  $('#results').dataset.state = 'ok';
  $('#invalid').replaceChildren();

  const r = compute(state);
  const band = rangeOn ? rangeResults(state, range) : null;
  const h = state.horizonMonths;
  const total = net(r);
  const v = verdict(r);
  const p = r.paybackMonths === null ? '' : fmt(r.paybackMonths, lang, 1);
  $('#verdict').textContent = fill(t[`v_${v.kind}`], { p, h });
  $('#sub').textContent = fill(t[`s_${v.kind}`], { p, h, m: eur(Math.abs(r.netMonth)), pct: r.roiPct === null ? '' : pct(r.roiPct) });
  $('#range-line').textContent = band ? fill(t.rangeLine, { lo: paybackWords(band.prudent), hi: paybackWords(band.favorable) }) : '';
  $('#net-label').textContent = fill(t.netLabel, { h });
  setKpi('#t-net', eur(total), total >= 0 ? 'good' : 'bad', `${eur(r.totalValue)} − ${eur(r.totalCost)}`);
  $('#net-range').textContent = band ? fill(t.netRange, { lo: eur(net(band.prudent)), hi: eur(net(band.favorable)) }) : '';
  $('#peek-text').textContent = $('#verdict').textContent;
  $('#peek-value').textContent = eur(total);
  $('#peek').dataset.tone = total >= 0 ? 'good' : 'bad';
  $('#peek').setAttribute('aria-label', `${$('#verdict').textContent} ${fill(t.netLabel, { h })} : ${eur(total)}`);
  const roiRange = band && band.prudent.roiPct !== null && band.favorable.roiPct !== null
    ? `${pct(band.prudent.roiPct)} ${t.to} ${pct(band.favorable.roiPct)}` : '';
  setKpi('#t-roi', r.roiPct === null ? t.na : pct(r.roiPct), r.roiPct === null ? 'neutral' : r.roiPct >= 0 ? 'good' : 'bad', roiRange);
  setKpi('#t-payback', paybackShort(r),
    r.paybackMonths === null ? 'bad' : r.paybackMonths <= h ? 'good' : 'warn',
    r.paybackMonths !== null && r.paybackMonths > h ? t.paybackNote : '');
  setKpi('#t-breakeven', r.breakEvenMinutes === null ? t.na : `${fmt(r.breakEvenMinutes, lang, 1)} ${t.min}`,
    r.breakEvenMinutes === null ? 'neutral' : r.netMinutesPerTask >= r.breakEvenMinutes ? 'good' : 'bad',
    fill(t.beNote, { x: fmt(r.netMinutesPerTask, lang, 1) }));
  setKpi('#t-hours', `${fmt(r.hoursSavedMonth, lang)} h`, r.hoursSavedMonth >= 0 ? 'neutral' : 'bad', t.hoursNote);

  drawChart(r, band);
  drawTornado(sensitivity(state, 20));
  renderCompare(r);

  const rows = [
    [t.tasksMonth, fmt(r.tasksMonth, lang, 1)],
    [t.netMinutes, `${fmt(r.netMinutesPerTask, lang, 1)} ${t.min}`],
    [t.hours, `${fmt(r.hoursSavedMonth, lang, 1)} h`],
    [t.valueMonth, eur(r.valueMonth)],
    [t.costMonth, eur(r.costMonth)],
    [t.netMonth, eur(r.netMonth)],
  ];
  $('#detail tbody').replaceChildren(...rows.map(([k, val]) => node('tr', {}, node('th', { scope: 'row', textContent: k }), node('td', { textContent: val }))));
  $('#print-list').replaceChildren(...FIELDS.map(f => node('div', {},
    node('dt', { textContent: f.label[lang] }),
    node('dd', { textContent: `${fmt(state[f.key], lang, 3)}${f.unit ? ` ${f.unit}` : ''}` }))));
  $('#md').value = toMarkdown(state, r, lang, band ? { range, ...band } : null);
}

function renderCompare(r) {
  const t = UI[lang];
  const box = $('#compare-table');
  $('#clear-kept').hidden = !kept;
  if (!kept) { box.replaceChildren(); return; }
  const k = kept.result;
  const signed = (d, text) => (Math.abs(d) < 0.5 ? text.replace(/^[^0-9]*/, '') : `${d > 0 ? '+' : '−'}${text}`);
  const rows = [
    [t.rowNet, eur(net(k)), eur(net(r)), signed(net(r) - net(k), eur(Math.abs(net(r) - net(k))))],
    [t.rowRoi, k.roiPct === null ? t.na : pct(k.roiPct), r.roiPct === null ? t.na : pct(r.roiPct),
      k.roiPct === null || r.roiPct === null ? '' : signed(r.roiPct - k.roiPct, `${fmt(Math.abs(r.roiPct - k.roiPct), lang)} pt`)],
    [t.rowPayback, paybackShort(k), paybackShort(r), ''],
    [t.rowCost, eur(k.totalCost), eur(r.totalCost), signed(r.totalCost - k.totalCost, eur(Math.abs(r.totalCost - k.totalCost)))],
  ];
  const table = node('table', {},
    node('thead', {}, node('tr', {}, node('th', {}), ...[t.colKept, t.colNow, t.colDiff].map(c => node('th', { scope: 'col', textContent: c })))),
    node('tbody', {}, ...rows.map(([a, ...rest]) => node('tr', {}, node('th', { scope: 'row', textContent: a }), ...rest.map(c => node('td', { textContent: c }))))));
  box.replaceChildren(node('div', { className: 'scroll' }, table));
  if (k.curve.length !== r.curve.length) box.append(node('p', { className: 'note', textContent: t.keptHorizon }));
}

function svg(name, attrs = {}, text) {
  const n = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  if (text !== undefined) n.textContent = text;
  return n;
}

function niceTicks(lo, hi, n = 4) {
  const span = hi - lo || 1;
  const raw = span / n;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(x => x * mag).find(x => span / x <= n) || 10 * mag;
  const ticks = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) ticks.push(Math.abs(v) < 1e-9 ? 0 : v);
  return ticks;
}

function drawChart(r, band) {
  const t = UI[lang];
  const target = r.curve.slice();
  const from = lastCurve && lastCurve.length === target.length && !reduceMotion() ? lastCurve : null;
  lastCurve = target;
  cancelAnimationFrame(anim);
  const extra = { lo: band?.prudent.curve, hi: band?.favorable.curve, kept: kept?.result.curve };
  if (!from || typeof requestAnimationFrame !== 'function') {
    paintChart(target, r, extra);
  } else {
    paintChart(from, r, extra);
    const start = performance.now();
    const step = now => {
      const k = Math.min(1, (now - start) / 260);
      const e = 1 - (1 - k) ** 3;
      paintChart(target.map((y, i) => from[i] + (y - from[i]) * e), r, extra);
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }
  $('#chart-desc').textContent = fill(t.chartDesc, { h: target.length - 1 });
}

function paintChart(curve, r, extra) {
  const t = UI[lang];
  // Size the drawing to its box so labels stay at their real size on a phone.
  const box = $('#chart').clientWidth;
  const W = Math.round(Math.max(300, Math.min(900, box || 720)));
  const H = W < 520 ? 230 : 330;
  // The right gutter holds the end values, so they never meet the curve or the month labels.
  const L = 56, R = W < 520 ? 58 : 76, T = 18, B = 34;
  const n = curve.length - 1;
  const fits = c => Array.isArray(c) && c.length === curve.length;
  const all = [0, ...curve, ...(fits(extra.lo) ? extra.lo : []), ...(fits(extra.hi) ? extra.hi : []), ...(fits(extra.kept) ? extra.kept : [])];
  let lo = Math.min(...all), hi = Math.max(...all);
  if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.08;
  lo -= pad; hi += pad;
  const x = i => L + (i / Math.max(1, n)) * (W - L - R);
  const y = v => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const line = c => c.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-labelledby': 'chart-desc' });
  const axis = svg('g', { class: 'axis' });
  for (const v of niceTicks(lo, hi)) {
    if (v !== 0) axis.append(svg('line', { class: 'grid', x1: L, x2: W - R, y1: y(v), y2: y(v) }));
    axis.append(svg('text', { x: L - 10, y: y(v) + 4, 'text-anchor': 'end' }, eurShort(v)));
  }
  const every = n <= 12 ? 3 : n <= 24 ? 6 : 12;
  for (let i = 0; i < n; i += every) {
    if (x(n) - x(i) < 80) continue; // leave room for the last label, which carries the unit
    axis.append(svg('text', { x: x(i), y: H - 10, 'text-anchor': i === 0 ? 'start' : 'middle' }, `${i}`));
  }
  axis.append(svg('text', { x: x(n), y: H - 10, 'text-anchor': 'end' }, `${n} ${t.months}`));
  root.append(axis);

  if (fits(extra.lo) && fits(extra.hi)) {
    const top = extra.hi.map((v, i) => Math.max(v, extra.lo[i]));
    const bottom = extra.lo.map((v, i) => Math.min(v, extra.hi[i]));
    root.append(svg('polygon', { class: 'band', points: [...line(top), ...line(bottom).reverse()].join(' ') }));
  }
  const pts = line(curve);
  const area = `M${x(0)},${y(0)} L${pts.join(' L')} L${x(n)},${y(0)} Z`;
  const id = Math.random().toString(36).slice(2, 8);
  const defs = svg('defs');
  const above = svg('clipPath', { id: `ab-${id}` }); above.append(svg('rect', { x: 0, y: 0, width: W, height: y(0) }));
  const below = svg('clipPath', { id: `be-${id}` }); below.append(svg('rect', { x: 0, y: y(0), width: W, height: H }));
  defs.append(above, below);
  root.append(defs,
    svg('path', { d: area, class: 'area-gain', 'clip-path': `url(#ab-${id})` }),
    svg('path', { d: area, class: 'area-loss', 'clip-path': `url(#be-${id})` }),
    svg('line', { class: 'zero', x1: L, x2: W - R, y1: y(0), y2: y(0) }));
  if (fits(extra.kept)) root.append(svg('polyline', { class: 'kept', points: line(extra.kept).join(' ') }));
  root.append(svg('polyline', { class: 'curve', points: pts.join(' ') }));

  if (r.paybackMonths !== null && r.paybackMonths > 0 && r.paybackMonths <= n) {
    const bx = x(r.paybackMonths);
    const label = fill(t.breakEvenAt, { p: fmt(r.paybackMonths, lang, 1) });
    // Before payback the curve is below zero, after it above: the label sits in the empty quadrant.
    const right = bx < (W - R) * 0.6;
    root.append(svg('line', { class: 'be-line', x1: bx, x2: bx, y1: T, y2: H - B }),
      svg('circle', { class: 'be-dot', cx: bx, cy: y(0), r: 7 }),
      svg('text', { class: 'be-label', x: right ? bx + 12 : bx - 12, y: right ? y(0) + 22 : y(0) - 12, 'text-anchor': right ? 'start' : 'end' }, label));
  }
  const end = curve[n];
  const tone = end >= 0 ? 'var(--gain)' : 'var(--loss)';
  const endY = y(end) + 4;
  root.append(svg('circle', { class: 'end-dot', cx: x(n), cy: y(end), r: 6, style: `fill:${tone}` }),
    svg('text', { class: 'end-label', x: x(n) + 10, y: endY, 'text-anchor': 'start', style: `fill:${tone}` }, eurShort(end)));
  if (fits(extra.kept)) {
    let ky = y(extra.kept[n]) + 4;
    if (Math.abs(ky - endY) < 16) ky = endY + (ky >= endY ? 16 : -16);
    root.append(svg('text', { class: 'kept-label', x: x(n) + 10, y: ky, 'text-anchor': 'start' }, t.keptLabel));
  }

  const fig = $('#chart');
  fig.querySelector('svg')?.remove();
  fig.prepend(root);
}

function drawTornado(rows) {
  const list = $('#tornado');
  const top = rows.slice(0, 7);
  const span = Math.max(1, ...top.flatMap(r => [Math.abs(r.low - r.base), Math.abs(r.high - r.base)]));
  list.replaceChildren(...top.map(r => {
    const f = FIELDS.find(x => x.key === r.key);
    const track = node('div', { className: 'track' });
    track.setAttribute('role', 'img');
    track.setAttribute('aria-label', `${f.label[lang]} : −20 % ${eur(r.low - r.base)}, +20 % ${eur(r.high - r.base)}`);
    for (const [val, minus] of [[r.low, true], [r.high, false]]) {
      const d = val - r.base;
      if (!d) continue;
      const seg = node('span', { className: `seg ${d > 0 ? 'up' : 'down'}${minus ? ' minus' : ''}` });
      const w = (Math.abs(d) / span) * 50;
      seg.style.width = `${w}%`;
      seg.style.left = d > 0 ? '50%' : `${50 - w}%`;
      track.append(seg);
    }
    return node('div', { className: 'row' }, node('span', { className: 'name', textContent: f.label[lang] }), track);
  }));
}

function renderMeasures() {
  const t = UI[lang];
  const b = parseDurations($('#m-before').value);
  const a = parseDurations($('#m-after').value);
  const describe = (p, el) => {
    const s = summarize(p.values);
    const parts = [];
    if (!s.n) parts.push(t.mNone);
    else if (!s.ci) parts.push(fill(t.mOne, { n: s.n, m: fmt(s.mean, lang, 1) }));
    else parts.push(fill(t.mSummary, { n: s.n, m: fmt(s.mean, lang, 1), lo: fmt(s.ci[0], lang, 1), hi: fmt(s.ci[1], lang, 1) }));
    if (p.rejected.length) parts.push(fill(t.mRejected, { x: p.rejected.slice(0, 5).join(', ') }));
    el.textContent = parts.join(' ');
    return s;
  };
  const sb = describe(b, $('#m-before-sum'));
  const sa = describe(a, $('#m-after-sum'));
  const c = compareMeans(b.values, a.values);
  const msgs = [];
  if (c.gain !== null) {
    msgs.push(c.ci ? fill(t.mGain, { g: fmt(c.gain, lang, 1), lo: fmt(c.ci[0], lang, 1), hi: fmt(c.ci[1], lang, 1) }) : fill(t.mGainNoCi, { g: fmt(c.gain, lang, 1) }));
    if (c.ci && c.ci[0] <= 0 && c.ci[1] >= 0) msgs.push(t.mGainUnsure);
    if (sb.n < 10 || sa.n < 10) msgs.push(t.mFew);
  }
  $('#m-gain').textContent = msgs.join(' ');
  $('#m-use').disabled = !(sb.n && sa.n);
  return { sb, sa };
}

function useMeasures() {
  const t = UI[lang];
  const { sb, sa } = renderMeasures();
  if (!sb.n || !sa.n) return;
  const round = v => Math.round(v * 10) / 10;
  $('#in-minutesBefore').value = String(round(sb.mean));
  $('#in-minutesAfter').value = String(round(sa.mean));
  if (sa.ci) {
    // A longer time after is the prudent side.
    $('#rng-0-minutesAfter').value = String(round(Math.max(0, sa.ci[1])));
    $('#rng-1-minutesAfter').value = String(round(Math.max(0, sa.ci[0])));
  }
  $('#m-status').textContent = t.mUsed;
  render();
}

function applyText() {
  const t = UI[lang];
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll('[data-t]')) el.textContent = t[el.dataset.t];
  for (const [sel, key] of [['#method', 'method'], ['#limits', 'limits']]) {
    $(sel).replaceChildren(...t[key].map(s => node('li', { textContent: s })));
  }
  $('#tpl-link').href = `template/value-case.${lang}.md`;
  $('#ex-link').href = `examples/bim-model-checking.${lang}.md`;
  $('#lang-fr').setAttribute('aria-pressed', String(lang === 'fr'));
  $('#lang-en').setAttribute('aria-pressed', String(lang === 'en'));
  $('#range-on').checked = rangeOn;
  $('#range-table').hidden = !rangeOn;
}

async function copy(text) {
  const t = UI[lang];
  const status = $('#copy-status');
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = t.copied;
  } catch {
    status.textContent = t.copyFailed;
    $('#md').hidden = false;
    $('#md').select();
  }
}

function rebuild() {
  lastCurve = null;
  applyText();
  buildForm();
  buildRange();
  render();
  renderMeasures();
}

function setLang(next) {
  if (next === lang) return;
  state = readForm();
  range = readRange();
  lang = next;
  try { localStorage.setItem('roi-lang', lang); } catch { /* ignore */ }
  $('#m-status').textContent = '';
  rebuild();
}

function init() {
  lang = readLang();
  state = { ...DEFAULTS, ...decodeState(location.hash) };
  if (Object.keys(validate(state)).length) state = { ...DEFAULTS };
  range = { ...structuredClone(DEFAULT_RANGE), ...decodeRange(location.hash) };
  if (Object.keys(validateRange(range)).length) range = structuredClone(DEFAULT_RANGE);
  const saved = restoreKept();
  if (saved?.inputs && !Object.keys(validate(saved.inputs)).length) kept = { inputs: saved.inputs, result: compute(saved.inputs) };
  rebuild();

  $('#inputs').addEventListener('input', ev => {
    const src = ev.target;
    if (src.type === 'range') $(`#in-${src.dataset.for}`).value = src.value;
    render();
  });
  $('#inputs').addEventListener('submit', ev => ev.preventDefault());
  $('#range-body').addEventListener('input', render);
  $('#range-on').addEventListener('change', ev => {
    rangeOn = ev.target.checked;
    $('#range-table').hidden = !rangeOn;
    render();
  });
  $('#lang-fr').addEventListener('click', () => setLang('fr'));
  $('#lang-en').addEventListener('click', () => setLang('en'));
  $('#reset').addEventListener('click', () => {
    state = { ...DEFAULTS };
    range = structuredClone(DEFAULT_RANGE);
    rebuild();
  });
  $('#m-before').addEventListener('input', renderMeasures);
  $('#m-after').addEventListener('input', renderMeasures);
  $('#m-use').addEventListener('click', useMeasures);
  $('#keep').addEventListener('click', () => {
    const inputs = readForm();
    if (Object.keys(validate(inputs)).length) return;
    kept = { inputs, result: compute(inputs) };
    storeKept({ inputs });
    render();
  });
  $('#clear-kept').addEventListener('click', () => {
    kept = null;
    storeKept(null);
    render();
  });
  $('#copy-md').addEventListener('click', () => copy($('#md').value));
  $('#copy-link').addEventListener('click', () => {
    const parts = [encodeState(readForm()), rangeOn ? encodeRange(readRange()) : ''].filter(Boolean);
    copy(`${location.href.split('#')[0]}#${parts.join('&')}`);
  });
  // Printing is blocked inside embedded viewers; the button only shows where it can work.
  let embedded = true;
  try { embedded = window.self !== window.top; } catch { /* cross-origin frame: embedded */ }
  $('#print').hidden = embedded || typeof window.print !== 'function';
  $('#print').addEventListener('click', () => window.print());
  $('#peek').addEventListener('click', () => $('#results').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' }));
  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(([e]) => $('#peek').classList.toggle('on', !e.isIntersecting)).observe($('.hero'));
  }
  let resizeTimer = 0;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { lastCurve = null; render(); }, 120);
  });
}

init();
