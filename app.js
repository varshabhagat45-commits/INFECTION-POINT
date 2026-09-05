/* ===================================================================
   FRAMEWORK DATA
=================================================================== */

const STAGES = [
  { id: 1, name: "Story only", desc: "Announcement, no customer validation yet." },
  { id: 2, name: "Leading evidence", desc: "Operating variable moving, best asymmetry." },
  { id: 3, name: "Earnings confirmation", desc: "Revenue accelerates, margins improve." },
  { id: 4, name: "Consensus recognition", desc: "Everyone owns the story already." },
  { id: 5, name: "Extrapolation", desc: "Current margins priced as permanent." },
];

const REQUIREMENTS = [
  { key: "relevant", text: "A structurally relevant business with high terminal value — the industry itself is still worth owning ten years out." },
  { key: "leadingvar", text: "A real change in a leading operating variable — something on the ground has actually moved, not just a management slide." },
  { key: "twoconfirm", text: "At least two independent confirmations that the change is genuine, not one metric read generously." },
  { key: "cashevidence", text: "Cash-flow or balance-sheet evidence that the growth is self-funded, not manufactured through credit terms or dilution." },
  { key: "priceold", text: "A price that still assumes too much of the old, slower earnings path — the market hasn't caught up yet." },
];

const KINDS = [
  { key: "demand", name: "Demand or market share", what: "Volumes grow faster than the industry.", verify: "Retention, repeat orders, pricing and competitor behaviour." },
  { key: "capacity", name: "Capacity utilisation", what: "Production crosses fixed-cost breakeven.", verify: "Stable contribution per unit, customer demand and working capital." },
  { key: "product", name: "New product or format", what: "A small experiment becomes repeatable.", verify: "Unit economics, cohort maturity and payback period." },
  { key: "capitalcycle", name: "Industry capital cycle", what: "Supply growth slows while demand survives.", verify: "Inventories, pricing, competitor shutdowns and new-capacity announcements." },
  { key: "balancesheet", name: "Balance-sheet repair", what: "Debt and interest burden begin falling.", verify: "Operating cash flow, asset sales and refinancing quality." },
  { key: "governance", name: "Governance change", what: "Ownership or capital allocation improves.", verify: "Related-party cleanup, board quality and treatment of minorities." },
  { key: "formalisation", name: "Formalisation or regulation", what: "Share moves from informal to compliant players.", verify: "Whether the rule is enforced, and whether economics survive without subsidy." },
];

const OPERATING_CONFIRMATIONS = [
  { key: "volumes", text: "Volumes grow faster than the industry" },
  { key: "repeat", text: "Repeat orders or customer retention improve" },
  { key: "capacityutil", text: "Capacity utilisation crosses fixed-cost breakeven" },
  { key: "samestore", text: "Same-store sales or mature-unit economics improve" },
  { key: "newproduct", text: "A new product becomes material without heavy discounting" },
  { key: "marketshare", text: "Market share rises without receivables exploding" },
];

const CASH_CONFIRMATIONS = [
  { key: "receivables", text: "Receivable and inventory days remain stable or improve" },
  { key: "ocf", text: "Operating cash flow begins following EBITDA" },
  { key: "advances", text: "Customer advances support the order book" },
  { key: "debtfalling", text: "Debt or interest burden starts falling" },
  { key: "selffunded", text: "Expansion becomes self-funded" },
  { key: "roic", text: "Incremental return on capital exceeds the cost of capital" },
];

const FALSE_POSITIVES = [
  { key: "acquisition", text: "Revenue growth is coming from an acquisition, not organic demand" },
  { key: "otherincome", text: "PAT rose because of other income, tax reversals or accounting changes" },
  { key: "costcollapse", text: "Margins improved only because one raw material temporarily collapsed" },
  { key: "noorderbook", text: "An order book exists with no execution capacity or margin visibility behind it" },
  { key: "oversupplied", text: "Fresh capex is entering an already oversupplied industry" },
  { key: "onecustomer", text: "One customer, one subsidy, or one contract manufactures the entire growth story" },
  { key: "dilution", text: "Warrants, acquisitions or dilution are manufacturing EPS growth, not the business" },
  { key: "peakcyclical", text: "A cyclical stock looks cheap only because the denominator is a peak-earnings year" },
];

const CHECKLIST = [
  { key: "terminal", title: "Terminal value", questions: [
    "Will this industry be materially larger in 10–20 years?",
    "Is technology or regulation improving the runway, or destroying it?",
    "Am I buying a cyclical trough inside a sunrise business, or a cheap sunset business?",
  ]},
  { key: "moat", title: "Moat and right to win", questions: [
    "Why does the customer choose this company?",
    "Can a well-funded competitor copy the product or economics?",
    "Does the advantage sit in retention, distribution, approvals, cost, data, network effects or capital efficiency?",
  ]},
  { key: "leading", title: "Leading evidence", questions: [
    "Which operating variable has actually changed?",
    "Do I have two independent confirmations of it?",
    "Is the improvement visible before margins become obvious?",
  ]},
  { key: "cashquality", title: "Cash quality", questions: [
    "Are receivables and inventory behaving?",
    "Is growth funded internally, or by customers, debt, or repeated dilution?",
    "What did the cash outflow actually buy?",
  ]},
  { key: "expectations", title: "Expectations", questions: [
    "What earnings path is embedded in today's price?",
    "What must happen for a satisfactory return if the multiple does not expand?",
    "What does the downside look like if I'm a year early, or only half right?",
  ]},
  { key: "falsification", title: "Falsification", questions: [
    "Which two or three measurable facts would prove this thesis wrong?",
    "Am I willing to change my mind before management changes the narrative?",
  ]},
];

const CAPEX_STEPS = ["Capex announced", "Commissioning", "Utilisation rising", "Cash flow follows", "Debt falls"];

/* ===================================================================
   STORAGE
=================================================================== */
const STORAGE_KEY = "inflection_ledger_cases_v1";

function loadCases(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function saveCases(cases){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
}

function blankCase(){
  const now = new Date().toISOString();
  return {
    id: "c" + Date.now() + Math.random().toString(16).slice(2,6),
    company: "", ticker: "", sector: "",
    stage: 1,
    requirements: {},      // key -> yes/partial/no
    requirementNotes: {},  // key -> string
    kinds: {},             // key -> bool
    operating: {},         // key -> bool
    cash: {},              // key -> bool
    falsepositives: {},    // key -> bool
    checklist: {},         // "groupkey_index" -> bool
    capexStage: 0,         // 0 = not applicable/unset, 1-5 = step index
    valuation: { price:"", eps:"", ret:"", years:"", exitpe:"" },
    notes: "",
    created: now,
    updated: now,
  };
}

let cases = loadCases();
let currentCaseId = null;

/* ===================================================================
   COMPUTATION
=================================================================== */
function genuinenessScore(c){
  let score = 0;
  REQUIREMENTS.forEach(r=>{
    const v = c.requirements[r.key];
    if (v === "yes") score += 1;
    else if (v === "partial") score += 0.5;
  });
  return score; // out of 5
}

function confirmationCounts(c){
  const op = OPERATING_CONFIRMATIONS.filter(o=>c.operating[o.key]).length;
  const cash = CASH_CONFIRMATIONS.filter(o=>c.cash[o.key]).length;
  return { op, cash, pass: op >= 2 && cash >= 1 };
}

function flagCount(c){
  return FALSE_POSITIVES.filter(f=>c.falsepositives[f.key]).length;
}

function computeValuation(c){
  const price = parseFloat(c.valuation.price);
  const eps = parseFloat(c.valuation.eps);
  const ret = parseFloat(c.valuation.ret);
  const years = parseFloat(c.valuation.years);
  const exitpe = parseFloat(c.valuation.exitpe);
  if (![price,eps,ret,years,exitpe].every(v=>!isNaN(v) && v>0)) return null;

  const futureValueNeeded = price * Math.pow(1 + ret/100, years);
  const requiredEPS = futureValueNeeded / exitpe;
  const impliedCAGR = (Math.pow(requiredEPS/eps, 1/years) - 1) * 100;
  const currentPE = price / eps;

  return { futureValueNeeded, requiredEPS, impliedCAGR, currentPE };
}

/* ===================================================================
   VIEW SWITCHING
=================================================================== */
function showView(name){
  document.getElementById("view-watchlist").hidden = name !== "watchlist";
  document.getElementById("view-sectors").hidden = name !== "sectors";
  document.getElementById("view-case").hidden = name !== "case";
}

/* ===================================================================
   SECTOR BROWSE
=================================================================== */
function renderSectorDropdown(){
  const sel = document.getElementById("sector-select");
  PRESET_SECTORS.forEach(s=>{
    const opt = document.createElement("option");
    opt.value = s.name;
    opt.textContent = s.name;
    sel.appendChild(opt);
  });
}

function findCaseByTicker(ticker){
  if (!ticker) return null;
  return cases.find(c => (c.ticker || "").trim().toLowerCase() === ticker.trim().toLowerCase());
}

function caseFromPreset(preset, sectorName){
  const c = blankCase();
  c.company = preset.company;
  c.ticker = preset.ticker;
  c.sector = sectorName;
  c.stage = preset.stage || 1;
  c.requirements = { ...preset.requirements };
  c.requirementNotes = { ...preset.requirementNotes };
  c.kinds = { ...preset.kinds };
  c.operating = { ...preset.operating };
  c.cash = { ...preset.cash };
  c.falsepositives = { ...preset.falsepositives };
  c.notes = preset.notes || "";
  return c;
}

function renderSectorStocks(sectorName){
  const grid = document.getElementById("sector-stock-grid");
  const caveat = document.getElementById("sector-caveat");
  grid.innerHTML = "";
  if (!sectorName){ caveat.hidden = true; return; }
  caveat.hidden = false;

  const sector = PRESET_SECTORS.find(s=>s.name === sectorName);
  if (!sector) return;

  sector.stocks.forEach(preset=>{
    const existing = findCaseByTicker(preset.ticker);
    const stage = STAGES.find(s=>s.id === preset.stage) || STAGES[0];
    const flagsInPreset = Object.values(preset.falsepositives || {}).filter(Boolean).length;

    const card = document.createElement("div");
    card.className = "sector-stock-card";
    card.innerHTML = `
      <div class="sector-stock-card-head">
        <div>
          <h4>${escapeHtml(preset.company)}</h4>
          <span class="ticker">${escapeHtml(preset.ticker)}</span>
        </div>
        <span class="pill pill-stage-${stage.id}">Stage ${stage.id}</span>
      </div>
      <p class="stock-note">${escapeHtml(preset.notes || "")}</p>
      <div class="stock-flags">
        ${flagsInPreset > 0 ? `<span class="pill pill-flag">${flagsInPreset} flag${flagsInPreset>1?'s':''}</span>` : `<span class="pill pill-flag-clear">clear</span>`}
      </div>
      ${existing ? `<div class="already-tag">✓ Already in your watchlist — click to open</div>` : ""}
    `;
    card.addEventListener("click", ()=>{
      let target = existing;
      if (!target){
        target = caseFromPreset(preset, sectorName);
        cases.push(target);
        saveCases(cases);
      }
      openCase(target.id);
    });
    grid.appendChild(card);
  });
}

document.getElementById("sector-select").addEventListener("change", (e)=>{
  renderSectorStocks(e.target.value);
});

/* ===================================================================
   RENDER: WATCHLIST
=================================================================== */
function renderWatchlist(){
  const body = document.getElementById("watchlist-body");
  const empty = document.getElementById("watchlist-empty");
  body.innerHTML = "";

  if (cases.length === 0){
    empty.hidden = false;
    document.getElementById("watchlist-table-wrap").querySelector("table").hidden = true;
    return;
  }
  empty.hidden = true;
  document.getElementById("watchlist-table-wrap").querySelector("table").hidden = false;

  const sorted = [...cases].sort((a,b)=> new Date(b.updated) - new Date(a.updated));

  sorted.forEach(c=>{
    const tr = document.createElement("tr");
    tr.addEventListener("click", ()=> openCase(c.id));

    const gate = confirmationCounts(c);
    const flags = flagCount(c);
    const stage = STAGES.find(s=>s.id === c.stage) || STAGES[0];

    tr.innerHTML = `
      <td class="wl-company">${escapeHtml(c.company) || "Untitled case"}</td>
      <td class="wl-sector">${escapeHtml(c.sector) || "—"}</td>
      <td><span class="pill pill-stage-${stage.id}">Stage ${stage.id} · ${stage.name}</span></td>
      <td><span class="pill ${gate.pass ? 'pill-gate-pass' : 'pill-gate-fail'}">${gate.op}/6 op · ${gate.cash}/6 cash</span></td>
      <td><span class="pill ${flags>0 ? 'pill-flag' : 'pill-flag-clear'}">${flags>0 ? flags+' flag'+(flags>1?'s':'') : 'clear'}</span></td>
      <td class="wl-updated">${formatDate(c.updated)}</td>
      <td><button class="btn btn-ghost btn-small" data-delete="${c.id}">Delete</button></td>
    `;
    body.appendChild(tr);
  });

  body.querySelectorAll("[data-delete]").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      e.stopPropagation();
      const id = btn.getAttribute("data-delete");
      if (confirm("Delete this case? This can't be undone.")){
        cases = cases.filter(c=>c.id !== id);
        saveCases(cases);
        renderWatchlist();
      }
    });
  });
}

function formatDate(iso){
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}
function escapeHtml(s){
  const div = document.createElement("div");
  div.textContent = s || "";
  return div.innerHTML;
}

/* ===================================================================
   RENDER: CASE WORKSPACE
=================================================================== */
function getCurrentCase(){
  return cases.find(c=>c.id === currentCaseId);
}

function openCase(id){
  currentCaseId = id;
  showView("case");
  renderCase();
}

function backToWatchlist(){
  currentCaseId = null;
  showView("watchlist");
  renderWatchlist();
}

function touchCase(c){
  c.updated = new Date().toISOString();
  saveCases(cases);
}

function renderCase(){
  const c = getCurrentCase();
  if (!c) { backToWatchlist(); return; }

  document.getElementById("f-company").value = c.company;
  document.getElementById("f-ticker").value = c.ticker;
  document.getElementById("f-sector").value = c.sector;
  document.getElementById("f-notes").value = c.notes;

  renderStageRail(c);
  renderRequirements(c);
  renderKinds(c);
  renderConfirmations(c);
  renderFalsePositives(c);
  renderChecklist(c);
  renderCapexBridge(c);
  renderValuationInputs(c);
  renderVerdict(c);
}

/* --- header fields --- */
["f-company","f-ticker","f-sector"].forEach(id=>{
  document.getElementById(id).addEventListener("input", (e)=>{
    const c = getCurrentCase(); if (!c) return;
    const map = { "f-company":"company", "f-ticker":"ticker", "f-sector":"sector" };
    c[map[id]] = e.target.value;
    touchCase(c);
    if (id === "f-company" || id === "f-sector") { /* watchlist reflects on return */ }
  });
});
document.getElementById("f-notes").addEventListener("input", (e)=>{
  const c = getCurrentCase(); if (!c) return;
  c.notes = e.target.value;
  touchCase(c);
});

/* --- stage rail --- */
function renderStageRail(c){
  const list = document.getElementById("stage-rail-list");
  list.innerHTML = "";
  STAGES.forEach(s=>{
    const li = document.createElement("li");
    li.className = s.id === c.stage ? "active" : "";
    li.innerHTML = `<span class="num">${s.id}</span><span><span class="name">${s.name}</span><span class="desc">${s.desc}</span></span>`;
    li.addEventListener("click", ()=>{
      c.stage = s.id;
      touchCase(c);
      renderStageRail(c);
      renderVerdict(c);
    });
    list.appendChild(li);
  });
}

/* --- section A: requirements --- */
function renderRequirements(c){
  const wrap = document.getElementById("requirements-list");
  wrap.innerHTML = "";
  REQUIREMENTS.forEach(r=>{
    const row = document.createElement("div");
    row.className = "requirement-row";
    const current = c.requirements[r.key] || "";
    row.innerHTML = `
      <div class="requirement-text">
        ${r.text}
        <span class="req-note"><input type="text" placeholder="Evidence / note" data-note="${r.key}" value="${escapeHtml(c.requirementNotes[r.key] || '')}"></span>
      </div>
      <div class="seg-control" data-seg="${r.key}">
        <button data-val="yes" class="${current==='yes'?'active':''}">Yes</button>
        <button data-val="partial" class="${current==='partial'?'active':''}">Partial</button>
        <button data-val="no" class="${current==='no'?'active':''}">No</button>
      </div>
    `;
    wrap.appendChild(row);
  });

  wrap.querySelectorAll(".seg-control").forEach(seg=>{
    const key = seg.getAttribute("data-seg");
    seg.querySelectorAll("button").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        c.requirements[key] = btn.getAttribute("data-val");
        touchCase(c);
        seg.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        renderVerdict(c);
      });
    });
  });

  wrap.querySelectorAll("[data-note]").forEach(inp=>{
    inp.addEventListener("input", ()=>{
      c.requirementNotes[inp.getAttribute("data-note")] = inp.value;
      touchCase(c);
    });
  });
}

/* --- section B: kinds --- */
function renderKinds(c){
  const wrap = document.getElementById("kinds-list");
  wrap.innerHTML = "";
  KINDS.forEach(k=>{
    const card = document.createElement("div");
    card.className = "kind-card" + (c.kinds[k.key] ? " selected" : "");
    card.innerHTML = `
      <h5>${k.name}</h5>
      <p class="kind-what"><b>Changes first:</b> ${k.what}</p>
      <p class="kind-verify"><b>Verify:</b> ${k.verify}</p>
    `;
    card.addEventListener("click", ()=>{
      c.kinds[k.key] = !c.kinds[k.key];
      touchCase(c);
      card.classList.toggle("selected");
    });
    wrap.appendChild(card);
  });
}

/* --- sections C/D: confirmations --- */
function renderConfirmations(c){
  const opWrap = document.getElementById("operating-list");
  const cashWrap = document.getElementById("cash-list");
  opWrap.innerHTML = "";
  cashWrap.innerHTML = "";

  OPERATING_CONFIRMATIONS.forEach(o=>{
    opWrap.appendChild(makeCheckItem(o.text, !!c.operating[o.key], (val)=>{
      c.operating[o.key] = val; touchCase(c); renderGateReadout(c); renderVerdict(c);
    }));
  });
  CASH_CONFIRMATIONS.forEach(o=>{
    cashWrap.appendChild(makeCheckItem(o.text, !!c.cash[o.key], (val)=>{
      c.cash[o.key] = val; touchCase(c); renderGateReadout(c); renderVerdict(c);
    }));
  });

  renderGateReadout(c);
}

function renderGateReadout(c){
  const el = document.getElementById("gate-readout");
  const g = confirmationCounts(c);
  el.textContent = g.pass
    ? `Gate cleared — ${g.op}/6 operating and ${g.cash}/6 cash confirmations. Enough to treat this as genuine Stage 2+ evidence.`
    : `Gate not yet cleared — ${g.op}/6 operating and ${g.cash}/6 cash confirmations. Needs ≥2 operating and ≥1 cash confirmation.`;
}

/* --- section E (false positives) --- */
function renderFalsePositives(c){
  const wrap = document.getElementById("falsepositive-list");
  wrap.innerHTML = "";
  FALSE_POSITIVES.forEach(f=>{
    wrap.appendChild(makeCheckItem(f.text, !!c.falsepositives[f.key], (val)=>{
      c.falsepositives[f.key] = val; touchCase(c); renderVerdict(c);
    }));
  });
}

function makeCheckItem(text, checked, onChange){
  const label = document.createElement("label");
  label.className = "check-item";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = checked;
  input.addEventListener("change", ()=> onChange(input.checked));
  const span = document.createElement("span");
  span.textContent = text;
  label.appendChild(input);
  label.appendChild(span);
  return label;
}

/* --- section F: checklist --- */
function renderChecklist(c){
  const wrap = document.getElementById("checklist-groups");
  wrap.innerHTML = "";
  CHECKLIST.forEach(group=>{
    const div = document.createElement("div");
    div.className = "checklist-group";
    const h5 = document.createElement("h5");
    h5.textContent = group.title;
    div.appendChild(h5);
    group.questions.forEach((q, idx)=>{
      const ck = group.key + "_" + idx;
      div.appendChild(makeCheckItem(q, !!c.checklist[ck], (val)=>{
        c.checklist[ck] = val; touchCase(c);
      }));
    });
    wrap.appendChild(div);
  });
}

/* --- section G: capex bridge --- */
function renderCapexBridge(c){
  const wrap = document.getElementById("capex-bridge");
  wrap.innerHTML = "";
  CAPEX_STEPS.forEach((name, idx)=>{
    const stepNum = idx + 1;
    const div = document.createElement("div");
    div.className = "capex-step"
      + (stepNum === c.capexStage ? " active" : "")
      + (c.capexStage && stepNum < c.capexStage ? " passed" : "");
    div.innerHTML = `<div class="step-num">${stepNum}</div><div class="step-name">${name}</div>`;
    div.addEventListener("click", ()=>{
      c.capexStage = (c.capexStage === stepNum) ? 0 : stepNum;
      touchCase(c);
      renderCapexBridge(c);
    });
    wrap.appendChild(div);
  });
}

/* --- section H: valuation --- */
function renderValuationInputs(c){
  document.getElementById("v-price").value = c.valuation.price;
  document.getElementById("v-eps").value = c.valuation.eps;
  document.getElementById("v-return").value = c.valuation.ret;
  document.getElementById("v-years").value = c.valuation.years;
  document.getElementById("v-exitpe").value = c.valuation.exitpe;
  renderValuationOutput(c);
}
[["v-price","price"],["v-eps","eps"],["v-return","ret"],["v-years","years"],["v-exitpe","exitpe"]].forEach(([id,key])=>{
  document.getElementById(id).addEventListener("input", (e)=>{
    const c = getCurrentCase(); if (!c) return;
    c.valuation[key] = e.target.value;
    touchCase(c);
    renderValuationOutput(c);
    renderVerdict(c);
  });
});

function renderValuationOutput(c){
  const out = document.getElementById("valuation-output");
  const v = computeValuation(c);
  if (!v){
    out.innerHTML = `<p class="valuation-placeholder">Fill in the five fields to see the EPS path this price already needs.</p>`;
    return;
  }
  out.innerHTML = `
    <div class="valuation-headline">${v.impliedCAGR.toFixed(1)}% EPS CAGR</div>
    <div class="valuation-sub">is what today's price needs over ${escapeHtml(c.valuation.years)} years at a ${escapeHtml(c.valuation.exitpe)}× exit multiple, to deliver a ${escapeHtml(c.valuation.ret)}% annual return.</div>
    <div class="valuation-line"><span>Current P/E</span><span>${v.currentPE.toFixed(1)}×</span></div>
    <div class="valuation-line"><span>Required Year-${escapeHtml(c.valuation.years)} EPS</span><span>₹${v.requiredEPS.toFixed(2)}</span></div>
    <div class="valuation-line"><span>Implied EPS CAGR</span><span>${v.impliedCAGR.toFixed(1)}% / yr</span></div>
  `;
}

/* ===================================================================
   VERDICT PANEL
=================================================================== */
function renderVerdict(c){
  const stage = STAGES.find(s=>s.id===c.stage) || STAGES[0];
  document.getElementById("verdict-stage").textContent = `Stage ${stage.id} — ${stage.name}`;

  const score = genuinenessScore(c);
  const gate = confirmationCounts(c);
  const flags = flagCount(c);
  const val = computeValuation(c);

  const gEl = document.getElementById("verdict-genuineness");
  gEl.innerHTML = `<span>Conditions met</span><span class="value">${score.toFixed(1)} / 5</span>`;

  const gateEl = document.getElementById("verdict-gate");
  gateEl.innerHTML = `<span>Confirmation gate</span><span class="value">${gate.op}/6 op · ${gate.cash}/6 cash — ${gate.pass ? "cleared" : "not cleared"}</span>`;

  const flagEl = document.getElementById("verdict-flags");
  flagEl.innerHTML = `<span>False-positive flags</span><span class="value">${flags === 0 ? "none raised" : flags + " raised"}</span>`;

  const valEl = document.getElementById("verdict-valuation");
  valEl.innerHTML = val
    ? `<span>Price needs</span><span class="value">${val.impliedCAGR.toFixed(1)}% EPS CAGR</span>`
    : `<span>Price needs</span><span class="value">—</span>`;

  document.getElementById("verdict-text").innerHTML = buildVerdictText(c, stage, score, gate, flags, val);
}

function buildVerdictText(c, stage, score, gate, flags, val){
  const paras = [];

  if (flags > 0){
    paras.push(`<p>${flags} false-positive flag${flags>1?'s are':' is'} raised. Treat this inflection as guilty until the flagged item is independently checked — don't let a clean-looking checklist elsewhere override it.</p>`);
  }

  if (score >= 4.5 && gate.pass && flags === 0){
    paras.push(`<p>All five conditions are effectively met and the confirmation gate is cleared with no red flags. If the price hasn't fully caught up, this is the framework's highest-asymmetry zone — usually Stage 2, occasionally early Stage 3.</p>`);
  } else if (score < 2.5){
    paras.push(`<p>Fewer than half the conditions are met. This currently reads as a story or a cyclical bounce rather than a confirmed inflection — treat Stage 1 caution as the default until more evidence lands.</p>`);
  } else if (!gate.pass){
    paras.push(`<p>Not enough independent confirmation yet — the framework wants at least two operating signals and one cash or balance-sheet signal before trusting the thesis.</p>`);
  } else {
    paras.push(`<p>Evidence is building but incomplete. Keep tightening the checklist in section E before sizing this up.</p>`);
  }

  if (stage.id >= 4){
    paras.push(`<p>At Stage ${stage.id}, the asymmetry is already weaker — the crowd has largely priced this in, and the terminal multiple is doing more of the work than the operating story.</p>`);
  }

  if (val){
    if (val.impliedCAGR > 30){
      paras.push(`<p>The price already assumes a demanding ${val.impliedCAGR.toFixed(0)}% EPS CAGR. Make sure the evidence above is strong enough to justify that, not just directionally positive.</p>`);
    } else if (val.impliedCAGR < 8){
      paras.push(`<p>The price only needs a modest ${val.impliedCAGR.toFixed(0)}% EPS CAGR to work — the market may not have found this one yet, provided the evidence above holds up.</p>`);
    }
  }

  return paras.join("");
}

/* ===================================================================
   WIRE UP TOP-LEVEL NAV
=================================================================== */
function newCase(){
  const c = blankCase();
  cases.push(c);
  saveCases(cases);
  openCase(c.id);
  document.getElementById("f-company").focus();
}

document.getElementById("btn-new-case").addEventListener("click", newCase);
document.getElementById("btn-empty-new-case").addEventListener("click", newCase);
document.getElementById("btn-show-watchlist").addEventListener("click", backToWatchlist);
document.getElementById("btn-back-to-watchlist").addEventListener("click", backToWatchlist);
document.getElementById("btn-show-sectors").addEventListener("click", ()=>{
  showView("sectors");
});
document.getElementById("btn-delete-case").addEventListener("click", ()=>{
  const c = getCurrentCase();
  if (!c) return;
  if (confirm("Delete this case? This can't be undone.")){
    cases = cases.filter(x=>x.id !== c.id);
    saveCases(cases);
    backToWatchlist();
  }
});

/* ===================================================================
   INIT
=================================================================== */
renderSectorDropdown();
showView("watchlist");
renderWatchlist();
