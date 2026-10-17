/* ==========================================================================
   OFFC: THE AI DECISION INTELLIGENCE OS
   Interactive Engine & Simulation Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initGliderGame();
  initTelemetryStream();
  initSimulator();
  initScrollEffects();
});

/* ==========================================================================
   1. LIVE CLOCK TOOL
   ========================================================================== */
function initClock() {
  const clockTimeEl = document.getElementById('liveClockTime');
  const clockDateEl = document.getElementById('liveClockDate');

  function update() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + ' GST';
    const dateStr = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (clockTimeEl) clockTimeEl.textContent = timeStr;
    if (clockDateEl) clockDateEl.textContent = dateStr;
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. CONWAY'S GAME OF LIFE (GLIDER / NEURAL HEURISTICS VISUALIZER)
   ========================================================================== */
let gliderInterval = null;
let gliderRunning = true;
const COLS = 32;
const ROWS = 6;
let gridState = createEmptyGrid();

function createEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function initGliderGame() {
  const gridContainer = document.getElementById('gliderGrid');
  const toggleBtn = document.getElementById('gliderToggleBtn');
  const randomBtn = document.getElementById('gliderRandomBtn');
  const clearBtn = document.getElementById('gliderClearBtn');

  if (!gridContainer) return;

  // Build DOM Cells
  gridContainer.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'glider-cell';
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.addEventListener('click', () => {
        gridState[r][c] = gridState[r][c] ? 0 : 1;
        renderGrid();
      });
      gridContainer.appendChild(cell);
    }
  }

  // Seed default glider patterns & pulses
  seedGliders();
  renderGrid();

  // Control Listeners
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      gliderRunning = !gliderRunning;
      toggleBtn.textContent = gliderRunning ? 'Pause' : 'Resume';
    });
  }

  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      randomizeGrid();
      renderGrid();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      gridState = createEmptyGrid();
      renderGrid();
    });
  }

  // Animation Loop
  gliderInterval = setInterval(() => {
    if (gliderRunning) {
      stepGrid();
      renderGrid();
    }
  }, 240);
}

function seedGliders() {
  gridState = createEmptyGrid();
  // Glider 1
  gridState[0][1] = 1;
  gridState[1][2] = 1;
  gridState[2][0] = 1;
  gridState[2][1] = 1;
  gridState[2][2] = 1;

  // Glider 2 (offset)
  gridState[1][12] = 1;
  gridState[2][13] = 1;
  gridState[3][11] = 1;
  gridState[3][12] = 1;
  gridState[3][13] = 1;

  // Blinker / Pulsar
  gridState[2][22] = 1;
  gridState[2][23] = 1;
  gridState[2][24] = 1;
}

function randomizeGrid() {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      gridState[r][c] = Math.random() > 0.75 ? 1 : 0;
    }
  }
}

function stepGrid() {
  const next = createEmptyGrid();
  let aliveCount = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      let neighbors = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = (r + dr + ROWS) % ROWS;
          const nc = (c + dc + COLS) % COLS;
          neighbors += gridState[nr][nc];
        }
      }

      if (gridState[r][c] === 1 && (neighbors === 2 || neighbors === 3)) {
        next[r][c] = 1;
        aliveCount++;
      } else if (gridState[r][c] === 0 && neighbors === 3) {
        next[r][c] = 1;
        aliveCount++;
      }
    }
  }

  // Reseed if dying out
  if (aliveCount < 4) {
    seedGliders();
  } else {
    gridState = next;
  }
}

function renderGrid() {
  const cells = document.querySelectorAll('.glider-cell');
  cells.forEach(cell => {
    const r = parseInt(cell.dataset.r, 10);
    const c = parseInt(cell.dataset.c, 10);
    if (gridState[r][c] === 1) {
      cell.classList.add('alive');
    } else {
      cell.classList.remove('alive');
    }
  });
}

/* ==========================================================================
   3. REAL-TIME BASE64 RISK TELEMETRY STREAM
   ========================================================================== */
function initTelemetryStream() {
  const streamEl = document.getElementById('telemetryStream');
  if (!streamEl) return;

  const messages = [
    `[REVERSE_ENGINEERING_FAILURE_STATE]\n-- Simulated Timestamp: T+180 days\n-- Capital Expended: AED 300,000\n-- Unhedged Bottleneck: Factory Floor Installation (+90d lag)\n-- Cash Burn Escalation: 148% above baseline\n-- Severity: CRITICAL_BLINDSPOT\n[GENERATING_ANTIDOTE_PROTOCOL]`,
    `[MULTI_AGENT_AUDIT_LOG]\n>> CFO_AGENT: Cash reserve drops below AED 45,000 threshold.\n>> RISK_AGENT: Supply line dependency single point of failure.\n>> SALES_AGENT: Pre-sales conversion lag requires mandatory POs.\n>> CEO_SYNTHESIS: Lock 3 conditional agreements before disbursement.`,
    `[DECISION_GROUNDING_MATRIX]\n-- System: Offc Decision Intelligence Kernel 1.0\n-- Tenant: Private SME Isolated Schema\n-- Telemetry Hash: 0x8f3c...b912\n-- Latency to Resolution: 114ms\n-- Status: Antidotes Assigned to 3 Owners.`
  ];

  let msgIndex = 0;
  setInterval(() => {
    msgIndex = (msgIndex + 1) % messages.length;
    const targetText = messages[msgIndex];
    // Encode partially to Base64 to match TypeSafe.ai's B.64 block aesthetic!
    const encoded = btoa(targetText.slice(0, 140)) + '\n\n' + targetText;
    streamEl.textContent = encoded;
  }, 4500);
}

/* ==========================================================================
   4. INTERACTIVE SCENARIO & ANTIDOTES SIMULATOR (PHASE 2)
   ========================================================================== */
const presets = {
  production: {
    title: 'Capex Allocation for Production Line [AED 300,000]',
    baseCapex: 300000,
    baseRev: 80000,
    baseCost: 50000,
    rev: 100,
    cost: 150,
    delay: 3,
    currency: 'AED'
  },
  expansion: {
    title: 'European Engineering Hub Team Expansion [AED 450,000]',
    baseCapex: 450000,
    baseRev: 120000,
    baseCost: 75000,
    rev: 110,
    cost: 120,
    delay: 1,
    currency: 'AED'
  },
  erp: {
    title: 'Enterprise ERP & Cloud Architecture Migration [AED 200,000]',
    baseCapex: 200000,
    baseRev: 60000,
    baseCost: 45000,
    rev: 90,
    cost: 180,
    delay: 4,
    currency: 'AED'
  }
};

let currentPresetKey = 'production';

function initSimulator() {
  const revSlider = document.getElementById('revSlider');
  const costSlider = document.getElementById('costSlider');
  const delaySlider = document.getElementById('delaySlider');

  if (!revSlider || !costSlider || !delaySlider) return;

  revSlider.addEventListener('input', recalculateSimulator);
  costSlider.addEventListener('input', recalculateSimulator);
  delaySlider.addEventListener('input', recalculateSimulator);

  recalculateSimulator();
}

function loadPreset(key) {
  if (!presets[key]) return;
  currentPresetKey = key;
  const p = presets[key];

  // Update preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  // Set sliders
  const revSlider = document.getElementById('revSlider');
  const costSlider = document.getElementById('costSlider');
  const delaySlider = document.getElementById('delaySlider');

  if (revSlider && costSlider && delaySlider) {
    revSlider.value = p.rev;
    costSlider.value = p.cost;
    delaySlider.value = p.delay;
  }

  // Update subtitle
  const titleEl = document.querySelector('.simulator-title-group p');
  if (titleEl) titleEl.textContent = `Active Decision: ${p.title}`;

  recalculateSimulator();
}

function recalculateSimulator() {
  const p = presets[currentPresetKey];
  const revSlider = document.getElementById('revSlider');
  const costSlider = document.getElementById('costSlider');
  const delaySlider = document.getElementById('delaySlider');

  const revVal = parseInt(revSlider.value, 10);
  const costVal = parseInt(costSlider.value, 10);
  const delayVal = parseInt(delaySlider.value, 10);

  // Compute values
  const monthlyRev = Math.round((p.baseRev * revVal) / 100);
  const monthlyCost = Math.round((p.baseCost * costVal) / 100);
  const netMargin = monthlyRev - monthlyCost;

  // Update badge labels
  document.getElementById('revValBadge').textContent = `${revVal}% (${p.currency} ${monthlyRev.toLocaleString()}/mo)`;
  document.getElementById('costValBadge').textContent = `${costVal}% (${p.currency} ${monthlyCost.toLocaleString()}/mo)`;
  document.getElementById('delayValBadge').textContent = `${delayVal} Month${delayVal === 1 ? '' : 's'}`;

  // Telemetry outputs
  const outputPayback = document.getElementById('outputPayback');
  const outputRiskRating = document.getElementById('outputRiskRating');
  const outputRunway = document.getElementById('outputRunway');
  const outputRecommendation = document.getElementById('outputRecommendation');

  // Pre-startup delay cash drain
  const delayDrain = delayVal * Math.round(monthlyCost * 0.4);
  const totalCapexLoad = p.baseCapex + delayDrain;

  if (netMargin <= 0) {
    outputPayback.textContent = 'Payback: Unrecoverable (Negative Cash Margin)';
    outputRiskRating.textContent = 'Risk Level: CRITICAL CAPITAL TRAP';
    outputRiskRating.className = 'output-status-pill danger';
    outputRunway.textContent = `Runway Impact: -${p.currency} ${(totalCapexLoad * 1.5).toLocaleString()} Deficit`;
    outputRecommendation.textContent = 'Advisory: HIERARCHICAL REJECTION by CFO Agent. Costs exceed monthly revenue ceiling.';
  } else {
    const rawPaybackMonths = (totalCapexLoad / netMargin) + delayVal;
    const payback = Math.round(rawPaybackMonths * 10) / 10;
    outputPayback.textContent = `Simple Payback: ${payback.toFixed(1)} Months`;

    if (payback <= 8 && delayVal <= 1) {
      outputRiskRating.textContent = 'Risk Level: Highly Feasible (Safe Zone)';
      outputRiskRating.className = 'output-status-pill safe';
      outputRunway.textContent = `Runway Impact: +${p.currency} ${Math.round(netMargin * 6).toLocaleString()} Surplus (6mo)`;
      outputRecommendation.textContent = 'Advisory: Greenlight. Execute standard contract safeguards and initiate procurement.';
    } else if (payback <= 14) {
      outputRiskRating.textContent = 'Risk Level: Moderate Squeeze (Hedge Required)';
      outputRiskRating.className = 'output-status-pill caution';
      outputRunway.textContent = `Runway Impact: -${p.currency} ${delayDrain.toLocaleString()} Buffer Drawdown`;
      outputRecommendation.textContent = 'Advisory: Trigger Antidote Protocol #1 and #3 before authorizing purchase orders.';
    } else {
      outputRiskRating.textContent = 'Risk Level: Severe Liquidity Strain';
      outputRiskRating.className = 'output-status-pill danger';
      outputRunway.textContent = `Runway Impact: -${p.currency} ${(delayDrain * 2).toLocaleString()} Capital At Risk`;
      outputRecommendation.textContent = 'Advisory: Mandatory restructuring. Require supplier milestones tied strictly to delivery.';
    }
  }

  // Dynamically update Antidote cards
  updateAntidoteCards(revVal, costVal, delayVal, p);
}

function updateAntidoteCards(revVal, costVal, delayVal, p) {
  const list = document.getElementById('antidoteList');
  if (!list) return;

  const antidotes = [];

  if (costVal >= 130 || delayVal >= 2) {
    antidotes.push({
      risk: `Cash becomes tight during month ${delayVal + 1}-${delayVal + 3}`,
      solution: `Establish minimum ${p.currency} 60,000 cash reserve & pre-approved bank credit line.`,
      owner: 'CFO',
      deadline: 'Oct 28, 2026',
      status: 'Mandatory'
    });
  }

  if (revVal <= 100) {
    antidotes.push({
      risk: 'Demand uncertain / pre-sales orders unconfirmed',
      solution: 'Validate 3 binding customer purchase orders before machine dispatch from factory.',
      owner: 'Head of Sales',
      deadline: 'Nov 04, 2026',
      status: 'In Progress'
    });
  }

  if (delayVal >= 1) {
    antidotes.push({
      risk: `Installation delayed by import supplier (+${delayVal}mo lag)`,
      solution: 'Secure secondary backup supplier for critical tooling components with contract penalty clauses.',
      owner: 'Operations Manager',
      deadline: 'Nov 12, 2026',
      status: 'Assigned'
    });
  }

  // Always keep at least 2
  if (antidotes.length === 1) {
    antidotes.push({
      risk: 'Post-launch operational efficiency slippage',
      solution: 'Schedule 30-day Post-Mortem review in Offc Decision Journal to verify metrics.',
      owner: 'CEO',
      deadline: 'Dec 01, 2026',
      status: 'Scheduled'
    });
  }

  list.innerHTML = antidotes.map(a => `
    <div class="antidote-card">
      <div class="antidote-risk-tag">
        <span>⚠ RISK:</span> ${a.risk}
      </div>
      <div class="antidote-solution">
        ${a.solution}
      </div>
      <div class="antidote-meta-row">
        <span>Owner: <strong>${a.owner}</strong></span>
        <span>Deadline: <strong>${a.deadline}</strong></span>
        <span>Status: <strong>${a.status}</strong></span>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   5. AI BOARD OF DIRECTORS TAB SWITCHER
   ========================================================================== */
const agentData = {
  ceo: {
    avatar: 'CEO',
    name: 'CEO Agent / Master Orchestrator',
    role: 'Domain: Strategic Alignment & Multi-Agent Synthesis',
    reasoning: [
      `"Evaluating the AED 300,000 production line proposal. While expanding production capacity aligns with our 18-month enterprise revenue target, the CFO Agent flagged a 42% risk of a working capital crunch if customs slips past 90 days."`,
      `"My synthesis: We approve the capital allocation conditionally. Antidotes #1 and #2 must be formally signed off by finance and sales before contracts are signed with the European manufacturer."`
    ],
    badge: '✓ CONSENSUS STATUS: CONDITIONAL GREENLIGHT (2 ANTIDOTES PENDING)'
  },
  cfo: {
    avatar: 'CFO',
    name: 'CFO Agent / Capital & Liquidity',
    role: 'Domain: Working Capital Runway, Debt Capacity & Payback Math',
    reasoning: [
      `"Our present cash buffer stands at AED 410,000. Committing AED 300,000 in a lump-sum leaves only AED 110,000 for regular payroll and unexpected supplier price escalations."`,
      `"Under a 3-month installation delay scenario, burn jumps by AED 45,000. My protocol demands establishing an emergency overdraft facility of at least AED 60,000 before disbursement."`
    ],
    badge: '⚠ FINANCIAL AUDIT: HEDGING RESERVE REQUIRED BEFORE DISBURSEMENT'
  },
  risk: {
    avatar: 'CRO',
    name: 'Chief Risk Officer Agent',
    role: 'Domain: Failure Mode Analysis & Adversarial Pre-Mortem',
    reasoning: [
      `"Pre-Mortem Simulation indicates that 73% of SME manufacturing failures in this region stem from single-source supplier reliance rather than product quality."`,
      `"If the Italian tooling manufacturer encounters customs delays, the line sits idle while maintenance depreciation begins. A secondary tooling agreement is non-negotiable."`
    ],
    badge: '⚠ RISK THREAT: SINGLE VENDOR DEPENDENCY IDENTIFIED'
  },
  sales: {
    avatar: 'SLS',
    name: 'Sales Strategy Agent',
    role: 'Domain: Pipeline Conversion, Customer Veracity & Pricing',
    reasoning: [
      `"The forecast relies on 100% capacity utilization (AED 80,000/mo). However, our CRM shows only 2 tier-1 accounts in active negotiation, representing 40% of planned output."`,
      `"To protect gross margins, sales must pre-secure 3 signed Letters of Intent (LOIs) with advance deposits prior to installation commencement."`
    ],
    badge: '✓ PIPELINE VERDICT: PRE-VALIDATE 3 PURCHASE ORDERS'
  },
  ops: {
    avatar: 'OPS',
    name: 'Operations & Supply Chain Agent',
    role: 'Domain: Tooling Commissioning, Factory Floor & Logistics',
    reasoning: [
      `"Facility power and floor reinforcement requirements will consume 14 business days prior to machine arrival. Port clearance currently averages 9 days."`,
      `"I have mapped out the commissioning workflow. As long as backup technicians are on standby, operational readiness can be locked within 18 days of delivery."`
    ],
    badge: '✓ OPERATIONS AUDIT: FLOOR SPECIFICATIONS VERIFIED'
  }
};

function switchAgent(key) {
  const data = agentData[key];
  if (!data) return;

  // Switch tab buttons
  document.querySelectorAll('.board-tab-btn').forEach(btn => btn.classList.remove('active'));
  event.currentTarget.classList.add('active');

  // Update DOM
  document.getElementById('agentAvatar').textContent = data.avatar;
  document.getElementById('agentName').textContent = data.name;
  document.getElementById('agentRole').textContent = data.role;
  document.getElementById('agentReasoning').innerHTML = data.reasoning.map(p => `<p>${p}</p>`).join('');
  document.getElementById('agentBadge').innerHTML = `<span>${data.badge}</span>`;
}

/* ==========================================================================
   6. FAQ ACCORDION
   ========================================================================== */
function toggleFaq(btn) {
  const item = btn.parentElement;
  const isActive = item.classList.contains('active');

  // Close other open items
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

  if (!isActive) {
    item.classList.add('active');
  }
}

/* ==========================================================================
   7. MODAL CONTROLS & FORM SUBMISSION
   ========================================================================== */
function openModal(type) {
  const modal = document.getElementById('accessModal');
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

function handleFormSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('accessForm');
  const success = document.getElementById('formSuccessMessage');

  if (form && success) {
    form.style.display = 'none';
    success.style.display = 'block';
  }
}

/* Close modal on backdrop click */
window.addEventListener('click', (e) => {
  const modal = document.getElementById('accessModal');
  if (e.target === modal) {
    closeModal('accessModal');
  }
});

/* ==========================================================================
   8. SCROLL & HEADER DYNAMICS
   ========================================================================== */
function initScrollEffects() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}
