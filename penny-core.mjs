// penny-core.mjs | Prototype 0.1.0 | synthetic fixtures only
// Money = integer agorot as strings. Rates/shares = integer basis points.
// Annual constant-balance estimate, not a prediction of billed fees.
// No network, model calls, document parsing, authentication or external actions.
export const RELEASE = Object.freeze({
  id: "penny-core-0.1.0", schema: 1, policy: "fee-screen-0.1",
  qualification: "unqualified", supportedAction: "fee_change_only"
});
export const ASPECTS = Object.freeze([
  "tax", "liquidity", "insurance", "rights", "risk",
  "ownership", "household_dependencies", "other_material_effects"
]);
const fail = code => { throw new Error(code); };
const check = (ok, code) => { if (!ok) fail(code); };
const amount = x => {
  check(typeof x === "string" && /^(0|[1-9][0-9]{0,17})$/.test(x), "INVALID_MONEY");
  return BigInt(x);
};
const bps = x => {
  check(Number.isInteger(x) && x >= 0 && x <= 10000, "INVALID_RATE");
  return BigInt(x);
};
const date = x => {
  check(typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x), "INVALID_DATE");
  const d = new Date(x + "T00:00:00Z");
  check(Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === x, "INVALID_DATE");
  return x;
};
const unique = xs => new Set(xs).size === xs.length;
export function roundHalfUp(n, d) {
  check(typeof n === "bigint" && typeof d === "bigint" && n >= 0n && d > 0n, "INVALID_RATIO");
  return (n * 2n + d) / (2n * d);
}
export function fee(balance, rate) { return roundHalfUp(amount(balance) * bps(rate), 10000n); }
function allocate(total, owners) {
  const rows = owners.map(o => {
    const n = total * BigInt(o.shareBps);
    return {id:o.personId, value:n / 10000n, remainder:n % 10000n};
  });
  let left = total - rows.reduce((s,r) => s+r.value, 0n);
  rows.sort((a,b) => a.remainder === b.remainder
    ? (a.id < b.id ? -1 : 1) : (a.remainder > b.remainder ? -1 : 1));
  for (const row of rows) if (left > 0n) { row.value++; left--; }
  return new Map(rows.map(r => [r.id,r.value]));
}
export function evaluate(input, context) {
  // context is supplied by a trusted host, never accepted as browser authority.
  const x = JSON.parse(JSON.stringify(input));
  check(x.schema === RELEASE.schema && x.synthetic === true, "SYNTHETIC_ONLY");
  check(typeof x.householdId === "string", "INVALID_HOUSEHOLD");
  check(Array.isArray(x.people) && x.people.length === 2 &&
    x.people.every(p => typeof p === "string" && p.length > 0) && unique(x.people), "INVALID_PEOPLE");
  check(context?.householdId === x.householdId &&
    x.people.every(p => context.readPersonIds?.includes(p)), "ACCESS_DENIED");
  // Deny the entire household calculation: never leak a partial aggregate.
  const start = date(x.asOf), end = date(x.validThrough);
  check(Number(end.slice(0,4)) === Number(start.slice(0,4)) + 1 &&
    end.slice(4) === start.slice(4), "ANNUAL_HORIZON_REQUIRED");
  check(Array.isArray(x.sources) && unique(x.sources.map(s => s.id)), "INVALID_SOURCES");
  const used = new Set(), blockers = [];
  const source = (id, people, through = start) => {
    const s = x.sources.find(s => s.id === id);
    check(s && s.status === "verified_fixture" && s.householdId === x.householdId &&
      people.every(p => s.personIds?.includes(p)) && typeof s.locator === "string" &&
      s.locator.length > 0, "INVALID_EVIDENCE");
    check(date(s.effectiveFrom) <= start && date(s.validThrough) >= through, "EXPIRED_EVIDENCE");
    used.add(id);
  };
  if (x.action !== RELEASE.supportedAction) blockers.push("UNSUPPORTED_ACTION");
  check(Array.isArray(x.accounts) && x.accounts.length > 0 &&
    x.accounts.every(a => typeof a.id === "string" && a.id.length > 0) &&
    unique(x.accounts.map(a => a.id)), "DUPLICATE_OR_INVALID_ACCOUNT");
  check(x.coverage && typeof x.coverage.complete === "boolean", "INVALID_COVERAGE");
  source(x.coverage.sourceId, x.people);
  if (!x.coverage.complete) blockers.push("INCOMPLETE_HOUSEHOLD");
  check(Array.isArray(x.assessments) && unique(x.assessments.map(a => a.aspect)) &&
    x.assessments.every(a => ASPECTS.includes(a.aspect)), "INVALID_ASSESSMENTS");
  for (const aspect of ASPECTS) {
    const a = x.assessments.find(a => a.aspect === aspect);
    if (!a || a.state === "unknown") { blockers.push("UNRESOLVED_" + aspect.toUpperCase()); continue; }
    check(["no_effect","adverse_effect"].includes(a.state) &&
      typeof a.rationale === "string" && a.rationale.length > 0, "INVALID_ASSESSMENT");
    source(a.sourceId, x.people, end);
    if (a.state === "adverse_effect") blockers.push("ADVERSE_" + aspect.toUpperCase());
  }
  const agreement = x.agreement;
  if (agreement) {
    amount(agreement.thresholdCents);
    bps(agreement.discountBps); bps(agreement.fallbackBps);
    check(typeof agreement.id === "string" && typeof agreement.version === "string", "INVALID_AGREEMENT");
    source(agreement.sourceId, x.people, end);
    check(agreement.currency === "ILS" && agreement.eligibilityRule === "sum_eligible_balances" &&
      agreement.priceRule === "single_rate_all_balance", "UNSUPPORTED_AGREEMENT");
  }
  for (const a of x.accounts) {
    check(a.currency === "ILS" && date(a.asOf) === start, "INCOMPATIBLE_OBSERVATION");
    check(Array.isArray(a.owners) && a.owners.length > 0 &&
      unique(a.owners.map(o => o.personId)) &&
      a.owners.every(o => x.people.includes(o.personId) &&
        Number.isInteger(o.shareBps) && o.shareBps > 0 && o.shareBps <= 10000) &&
      a.owners.reduce((s,o) => s+o.shareBps,0) === 10000, "INVALID_OWNERSHIP");
    source(a.sourceId, a.owners.map(o => o.personId));
    amount(a.balanceCents); amount(a.annualDepositsCents);
    check(typeof a.eligibleAfter === "boolean" && typeof a.groupPricedAfter === "boolean", "INVALID_MEMBERSHIP");
    if (a.eligibleAfter || a.groupPricedAfter) check(!!agreement, "AGREEMENT_REQUIRED");
    bps(a.currentBalanceBps); bps(a.currentDepositBps); bps(a.afterDepositBps);
    bps(a.afterBalanceBps);
    source(a.termsSourceId, a.owners.map(o => o.personId), end);
  }
  check(x.costsByPerson && Object.keys(x.costsByPerson).length === x.people.length &&
    x.people.every(p => Object.hasOwn(x.costsByPerson,p)), "INVALID_COST_OWNERS");
  for (const p of x.people) {
    const c = x.costsByPerson[p];
    amount(c.cents); source(c.sourceId, [p], end);
  }
  if (blockers.length) return {
    release:RELEASE.id, status:"blocked", blockers, estimate:null,
    evidenceIds:[...used].sort(), nextAction:"השלמת בדיקה לפני הצגת כדאיות", executable:false
  };
  const eligible = x.accounts.filter(a => a.eligibleAfter)
    .reduce((s,a) => s + amount(a.balanceCents), 0n);
  const qualified = !!agreement && eligible >= amount(agreement.thresholdCents);
  const personal = new Map(x.people.map(p => [p,{before:0n,after:0n}]));
  const rows = [];
  for (const a of x.accounts) {
    const rate = a.groupPricedAfter
      ? (qualified ? agreement.discountBps : agreement.fallbackBps) : a.afterBalanceBps;
    // Round each component before adding; savings subtract the resulting charges.
    const before = fee(a.balanceCents,a.currentBalanceBps) +
      fee(a.annualDepositsCents,a.currentDepositBps);
    const after = fee(a.balanceCents,rate) + fee(a.annualDepositsCents,a.afterDepositBps);
    const beforeSplit = allocate(before,a.owners), afterSplit = allocate(after,a.owners);
    for (const o of a.owners) {
      personal.get(o.personId).before += beforeSplit.get(o.personId);
      personal.get(o.personId).after += afterSplit.get(o.personId);
    }
    rows.push({accountId:a.id,beforeCents:String(before),afterCents:String(after),
      appliedAfterBps:rate, savingCents:String(before-after)});
  }
  const perPerson = x.people.map(p => {
    const r = personal.get(p), cost = amount(x.costsByPerson[p].cents);
    return {personId:p,beforeCents:String(r.before),afterCents:String(r.after),
      costCents:String(cost),netSavingCents:String(r.before-r.after-cost)};
  });
  const net = perPerson.reduce((s,p) => s + BigInt(p.netSavingCents), 0n);
  const harm = perPerson.some(p => BigInt(p.netSavingCents) < 0n);
  const status = harm ? "review_personal_loss" : net > 0n ? "candidate" : "keep";
  return {
    release:RELEASE.id, policy:RELEASE.policy, status, blockers:[], executable:false,
    scope:"synthetic_annual_fee_estimate", period:{from:start,through:end},
    estimate:{householdNetSavingCents:String(net),perPerson,accounts:rows},
    agreement:agreement ? {id:agreement.id,version:agreement.version,qualified,
      qualifyingBalanceCents:String(eligible)} : null,
    evidenceIds:[...used].sort(),
    assumptions:["Constant balances and annual deposit estimate","No investment return forecast",
      "Owner allocation uses stated shares and largest remainders; not an ownership change",
      "Screening assertions supplied by fixtures, not professionally verified"],
    nextAction: status === "review_personal_loss" ? "בדיקת הפגיעה בכל אחד לפני החלטה משותפת" :
      status === "candidate" ? "אימות התנאים לפני קבלת החלטה" : "השארת המצב במסגרת הבדיקה"
  };
}