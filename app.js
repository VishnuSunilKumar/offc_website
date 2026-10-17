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
  initSandbox();
  initBoardroomDebate();
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
function openModal(id) {
  let targetId = id || 'accessModal';
  if (targetId === 'access') targetId = 'accessModal';
  if (targetId === 'announcement') targetId = 'announcementModal';
  if (targetId === 'memo') targetId = 'memoModal';

  const modal = document.getElementById(targetId) || document.getElementById(id);
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
  if (e.target.classList && e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
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

/* ==========================================================================
   9. INTERACTIVE PRE-MORTEM SANDBOX ENGINE (TRY YOUR OWN DECISION)
   ========================================================================== */
const sandboxPresets = {
  dubai_hub: {
    text: "Commit AED 650,000 to establish a 12,000 sq ft logistics facility in Dubai South to reduce regional fulfillment latency and capture Gulf e-commerce supply contracts.",
    capex: 650000,
    cash: 920000,
    horizon: 6,
    failureTitle: "Dubai South Facility Stalls in Month 4: Customs Licensing & Working Capital Squeeze",
    failureDesc: "By Month 5, the AED 650,000 capex has depleted liquid reserves to AED 270,000. Municipal inspection and customs trade licensing experienced an unhedged 44-day clearance lag, delaying tenant move-in while fixed lease amortizes. Without confirmed pre-orders, cash burn jumps 162% above baseline.",
    cfoScore: "CRITICAL SQUEEZE",
    cfoColor: "#ef4444",
    cfoDetail: "Runway drops to 2.4 months. Cash buffer drops below emergency AED 300,000 threshold.",
    croScore: "HIGH VENDOR RISK",
    croColor: "#f59e0b",
    croDetail: "Single point of failure on primary contractor fit-out timeline (+44 day estimated slippage).",
    opsScore: "PRE-SALES REMEDY",
    opsColor: "#03aa5c",
    opsDetail: "Must pre-secure binding 3PL customer contracts before lease execution.",
    antidotes: [
      {
        risk: "Working capital drops below emergency payroll threshold",
        solution: "Lock emergency AED 120,000 pre-approved credit facility with Dubai Islamic Bank before signing lease.",
        owner: "CFO",
        deadline: "Nov 02, 2026",
        status: "Mandatory"
      },
      {
        risk: "Customs & commercial licensing delay stretches past 30 days",
        solution: "Execute expedited commercial trade permit via Dubai South Freezone one-stop VIP portal.",
        owner: "Operations Lead",
        deadline: "Nov 14, 2026",
        status: "Assigned"
      },
      {
        risk: "Warehouse capacity sits idle post-commissioning",
        solution: "Pre-sign 2 binding Letters of Intent with e-commerce distributors representing 55% rack capacity.",
        owner: "Head of Sales",
        deadline: "Nov 21, 2026",
        status: "Mandatory"
      }
    ]
  },
  machinery: {
    text: "Invest AED 300,000 into high-throughput automated packaging tooling to triple output capacity for GCC retail accounts.",
    capex: 300000,
    cash: 410000,
    horizon: 6,
    failureTitle: "Tooling Delivery Lag in Month 3 Triggers Severe Liquidity Strain",
    failureDesc: "By Month 4, the AED 300,000 disbursement has drained unencumbered cash. European shipping delay pushes commissioning back 65 days while tooling amortization starts. Factory floor sits idle, burning fixed overhead.",
    cfoScore: "MODERATE SQUEEZE",
    cfoColor: "#f59e0b",
    cfoDetail: "Cash buffer drops to AED 110,000. Any emergency supplier variance causes cash crunch.",
    croScore: "CRITICAL SINGLE VENDOR",
    croColor: "#ef4444",
    croDetail: "100% reliance on single Italian manufacturer for proprietary replacement components.",
    opsScore: "READINESS LOCKED",
    opsColor: "#03aa5c",
    opsDetail: "Power reinforcement and factory floor ready within 14 days of arrival.",
    antidotes: [
      {
        risk: "Supplier delivery slips beyond 45 days",
        solution: "Contractually tie 30% of machine purchase payment to verified on-site port arrival & commissioning.",
        owner: "CFO",
        deadline: "Oct 28, 2026",
        status: "Mandatory"
      },
      {
        risk: "Proprietary component failure during initial calibration",
        solution: "Secure secondary tooling maintenance retainer with regional JAFZA mechanical engineering partner.",
        owner: "Operations Manager",
        deadline: "Nov 08, 2026",
        status: "Assigned"
      },
      {
        risk: "Customer demand ramp trails production capacity",
        solution: "Require 3 signed purchase orders with 20% advance milestone deposits from FMCG buyers.",
        owner: "Head of Sales",
        deadline: "Nov 15, 2026",
        status: "Mandatory"
      }
    ]
  },
  sales_scale: {
    text: "Allocate AED 480,000 to hire and ramp 8 enterprise B2B sales reps across UAE and Saudi Arabia to double quarterly pipeline.",
    capex: 480000,
    cash: 750000,
    horizon: 6,
    failureTitle: "Sales Rep Ramp Lag & Long B2B Sales Cycles Create Month 5 Cash Deficit",
    failureDesc: "By Month 5, recruiter fees and base salaries consume AED 480,000 while average enterprise sales cycle averages 140 days. Zero deals close in Q1, causing unhedged operating deficit of AED 195,000.",
    cfoScore: "HIGH BURN RATE",
    cfoColor: "#ef4444",
    cfoDetail: "Fixed overhead expands by AED 80,000/mo without corresponding gross margin recognition.",
    croScore: "EXECUTION RISK",
    croColor: "#f59e0b",
    croDetail: "Hiring ramp takes 90 days instead of planned 30 days due to regional talent shortage.",
    opsScore: "ENABLEMENT DEFICIT",
    opsColor: "#f59e0b",
    opsDetail: "CRM sales enablement collaterals and pricing approvals are unstandardized.",
    antidotes: [
      {
        risk: "Enterprise sales cycle outlasts remaining cash runway",
        solution: "Structure sales compensation with 40% performance commission and 90-day pipeline milestones.",
        owner: "VP Sales",
        deadline: "Nov 05, 2026",
        status: "Mandatory"
      },
      {
        risk: "Hiring delay burns recruitment fees with zero productivity",
        solution: "Hire initial cohort of 3 senior reps first; gate remaining 5 hires upon hitting AED 250k pipeline quota.",
        owner: "CEO",
        deadline: "Nov 12, 2026",
        status: "Mandatory"
      },
      {
        risk: "Working capital drawdown threatens base operations",
        solution: "Ring-fence 4 months of operational payroll reserve in an escrow account.",
        owner: "CFO",
        deadline: "Oct 30, 2026",
        status: "Assigned"
      }
    ]
  },
  erp_cloud: {
    text: "Commit AED 220,000 to migrate legacy on-premise ERP & accounting database to unified cloud architecture.",
    capex: 220000,
    cash: 350000,
    horizon: 6,
    failureTitle: "Data Migration Errors & Unbudgeted Consulting Fees Squeeze IT Budget",
    failureDesc: "By Month 4, data mapping complexity between legacy accounting and the new cloud schema triggers a 3-week billing halt. Implementation partner bills an unbudgeted AED 95,000 in change orders.",
    cfoScore: "BUDGET OVERRUN",
    cfoColor: "#f59e0b",
    cfoDetail: "Change orders escalate project cost by 43% above baseline quotation.",
    croScore: "BUSINESS DOWNTIME",
    croColor: "#ef4444",
    croDetail: "Cutover scheduled during month-end closes risks 14-day receivable collection blackout.",
    opsScore: "STAFF ADOPTION LAG",
    opsColor: "#f59e0b",
    opsDetail: "Accounting team productivity drops 35% during uncalibrated transition.",
    antidotes: [
      {
        risk: "Implementation partner billing overruns and scope creep",
        solution: "Convert consultant contract to fixed-price milestone delivery with strict penalty for delay.",
        owner: "CFO",
        deadline: "Nov 01, 2026",
        status: "Mandatory"
      },
      {
        risk: "Data corruption or customer billing interruption",
        solution: "Mandate 30-day dual-run audit where legacy ERP and cloud ERP run in parallel before final cutover.",
        owner: "CTO / Lead Architect",
        deadline: "Nov 18, 2026",
        status: "Mandatory"
      },
      {
        risk: "Team resistance and administrative bottlenecks",
        solution: "Conduct 2-week pre-launch workflow certification for finance and inventory managers.",
        owner: "Operations Director",
        deadline: "Nov 25, 2026",
        status: "Assigned"
      }
    ]
  },
  custom: {
    text: "",
    capex: 500000,
    cash: 800000,
    horizon: 6,
    failureTitle: "Capital Squeeze in Month 4: Cash Drain Outpaces Revenue Recognition",
    failureDesc: "Under simulated execution, unexpected lead time variance and operational overhead deplete 72% of liquid reserves before positive unit economics are unlocked.",
    cfoScore: "LIQUIDITY WARNING",
    cfoColor: "#f59e0b",
    cfoDetail: "Working capital drawdown leaves company vulnerable to standard commercial shocks.",
    croScore: "UNHEDGED VENDOR DEPENDENCY",
    croColor: "#ef4444",
    croDetail: "Assumptions lack verified supplier service level agreements (SLAs).",
    opsScore: "EXECUTION GAP",
    opsColor: "#03aa5c",
    opsDetail: "Milestone gating must be enforced prior to subsequent capital tranches.",
    antidotes: [
      {
        risk: "Cash buffer drains faster than customer receivables arrive",
        solution: "Establish a guaranteed revolving working capital buffer of at least 25% of committed capex.",
        owner: "CFO",
        deadline: "Nov 04, 2026",
        status: "Mandatory"
      },
      {
        risk: "Milestones slip without contractual accountability",
        solution: "Structure contractor and vendor payments tied to verified delivery checkpoints.",
        owner: "Operations Lead",
        deadline: "Nov 16, 2026",
        status: "Assigned"
      },
      {
        risk: "Customer adoption curve trails planned utilization",
        solution: "Pre-validate 3 commercial commitments with signed letters of intent prior to deployment.",
        owner: "Head of Sales",
        deadline: "Nov 24, 2026",
        status: "Mandatory"
      }
    ]
  }
};

let currentActiveSandboxData = sandboxPresets.dubai_hub;

function initSandbox() {
  const textInput = document.getElementById('sandboxDecisionText');
  const capexInput = document.getElementById('sandboxCapex');
  const cashInput = document.getElementById('sandboxCash');

  if (!textInput || !capexInput || !cashInput) return;

  // Initialize with dubai_hub preset
  loadSandboxPreset('dubai_hub');
}

function loadSandboxPreset(key) {
  const data = sandboxPresets[key];
  if (!data) return;

  currentActiveSandboxData = data;

  // Update chip styles
  document.querySelectorAll('.sandbox-chip').forEach(c => c.classList.remove('active'));
  if (event && event.target && event.target.classList.contains('sandbox-chip')) {
    event.target.classList.add('active');
  }

  // Populate form fields
  const textInput = document.getElementById('sandboxDecisionText');
  const capexInput = document.getElementById('sandboxCapex');
  const cashInput = document.getElementById('sandboxCash');
  const horizonInput = document.getElementById('sandboxHorizon');

  if (textInput) textInput.value = data.text;
  if (capexInput) capexInput.value = data.capex;
  if (cashInput) cashInput.value = data.cash;
  if (horizonInput) horizonInput.value = data.horizon;

  updateSandboxBadges();
  renderSandboxResults(data);
}

function updateSandboxBadges() {
  const capexInput = document.getElementById('sandboxCapex');
  const cashInput = document.getElementById('sandboxCash');
  const capexBadge = document.getElementById('sandboxCapexBadge');
  const cashBadge = document.getElementById('sandboxCashBadge');

  if (capexInput && capexBadge) {
    const val = parseInt(capexInput.value, 10) || 0;
    capexBadge.textContent = `AED ${val.toLocaleString()}`;
  }

  if (cashInput && cashBadge) {
    const val = parseInt(cashInput.value, 10) || 0;
    cashBadge.textContent = `AED ${val.toLocaleString()}`;
  }
}

function runSandboxAudit(e) {
  if (e) e.preventDefault();

  const text = document.getElementById('sandboxDecisionText').value.trim();
  const capex = parseInt(document.getElementById('sandboxCapex').value, 10) || 500000;
  const cash = parseInt(document.getElementById('sandboxCash').value, 10) || 800000;
  const horizon = document.getElementById('sandboxHorizon').value;

  const ticker = document.getElementById('sandboxTicker');
  const results = document.getElementById('sandboxResults');
  const runBtn = document.getElementById('sandboxRunBtn');

  if (!ticker || !results) return;

  // Show progress ticker, disable run button
  ticker.style.display = 'block';
  results.style.opacity = '0.35';
  if (runBtn) {
    runBtn.disabled = true;
    runBtn.style.opacity = '0.6';
  }

  const pBar = document.getElementById('tickerProgressBar');
  const pText = document.getElementById('tickerPercent');
  const pTitle = document.getElementById('tickerStepTitle');

  // Animation sequence through 4 phases
  const steps = [
    { pct: '28%', title: '01 DATA INTAKE: Financial Buffer & Supply Chain Telemetry Verified...', id: 'tickerStep1' },
    { pct: '56%', title: '02 FAST-FORWARD: Simulating Month 6 Post-Disaster Collapse...', id: 'tickerStep2' },
    { pct: '84%', title: '03 STRESS TEST: Multi-Agent Adversarial Synthesis Active...', id: 'tickerStep3' },
    { pct: '100%', title: '04 PROTOCOL: Reverse-Engineered Antidotes Locked & Hash Signed.', id: 'tickerStep4' }
  ];

  let stepIdx = 0;
  const interval = setInterval(() => {
    if (stepIdx < steps.length) {
      const s = steps[stepIdx];
      if (pBar) pBar.style.width = s.pct;
      if (pText) pText.textContent = s.pct;
      if (pTitle) pTitle.textContent = s.title;

      // Mark step item
      document.querySelectorAll('.ticker-step-item').forEach(el => el.classList.remove('active'));
      const activeItem = document.getElementById(s.id);
      if (activeItem) {
        activeItem.classList.add('active');
        activeItem.classList.add('done');
      }

      stepIdx++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        ticker.style.display = 'none';
        results.style.opacity = '1';
        if (runBtn) {
          runBtn.disabled = false;
          runBtn.style.opacity = '1';
        }

        // Generate customized data if user wrote custom proposal
        const computedData = generateDynamicAuditData(text, capex, cash, horizon);
        currentActiveSandboxData = computedData;
        renderSandboxResults(computedData);
      }, 250);
    }
  }, 180);
}

function generateDynamicAuditData(text, capex, cash, horizon) {
  const lower = text.toLowerCase();
  const burnPct = Math.round((capex / (cash || 1)) * 100);
  const failureProb = Math.min(94.2, Math.max(52.8, Math.round(burnPct * 0.65 + 32)));

  // If text matches one of our presets, use calibrated preset
  for (const key of ['dubai_hub', 'machinery', 'sales_scale', 'erp_cloud']) {
    if (text.includes(sandboxPresets[key].text.slice(0, 25))) {
      const p = { ...sandboxPresets[key], capex, cash, horizon };
      return p;
    }
  }

  // Otherwise synthesize dynamic result
  let domain = 'Capital Expansion';
  let riskMode = 'Unhedged Operational Friction';
  let croMode = 'Vendor Lead Time Variance';

  if (lower.includes('warehouse') || lower.includes('logistics') || lower.includes('dubai') || lower.includes('fleet')) {
    domain = 'Regional Logistics & Infrastructure';
    riskMode = 'Customs Clearance & Municipality Inspection Lag (+42 days)';
    croMode = 'Primary Contractor Fit-Out Slippage';
  } else if (lower.includes('machine') || lower.includes('factory') || lower.includes('tooling') || lower.includes('equipment')) {
    domain = 'Industrial Tooling & Capex';
    riskMode = 'Component Delivery Bottleneck & Unbudgeted Commissioning Overhead';
    croMode = 'Single-Source Tooling Manufacturer Dependency';
  } else if (lower.includes('hire') || lower.includes('sales') || lower.includes('team') || lower.includes('engineer')) {
    domain = 'Team Scaling & Compensation';
    riskMode = 'Ramp Latency & Extended Enterprise Sales Cycle Outlasting Runway';
    croMode = 'Fixed Payroll Expansion Without Confirmed Gross Margin';
  } else if (lower.includes('software') || lower.includes('erp') || lower.includes('cloud') || lower.includes('ai')) {
    domain = 'Technology & Cloud Architecture';
    riskMode = 'Consulting Scope Creep & Data Integration Blackout';
    croMode = 'Implementation Partner Change Order Inflation (+40%)';
  }

  const remainingCash = Math.max(0, cash - capex);

  return {
    text: text || 'Enterprise Strategic Initiative',
    capex,
    cash,
    horizon,
    failureTitle: `Simulated Failure State in Month ${Math.round(horizon * 0.65)}: ${riskMode}`,
    failureDesc: `By Month ${Math.round(horizon * 0.7)}, committing AED ${capex.toLocaleString()} reduces liquid working buffer to AED ${remainingCash.toLocaleString()}. Without contractual safeguards, operational delays inflate monthly overhead by ${Math.min(180, Math.round(burnPct * 1.4))}%, exposing the balance sheet to acute liquidity distress.`,
    cfoScore: remainingCash < capex * 0.3 ? 'CRITICAL SQUEEZE' : 'MODERATE SQUEEZE',
    cfoColor: remainingCash < capex * 0.3 ? '#ef4444' : '#f59e0b',
    cfoDetail: `Unencumbered buffer drops to AED ${remainingCash.toLocaleString()}. Requires minimum AED ${Math.round(capex * 0.2).toLocaleString()} revolving credit hedge.`,
    croScore: 'HIGH EXPOSURE',
    croColor: '#f59e0b',
    croDetail: `${croMode}: Missing legally binding milestone penalty clauses.`,
    opsScore: 'PREVENTATIVE REMEDY',
    opsColor: '#03aa5c',
    opsDetail: 'Require 3 pre-signed customer or supplier commitments prior to fund release.',
    antidotes: [
      {
        risk: `Cash buffer sinks below payroll threshold during month ${Math.round(horizon * 0.5)}`,
        solution: `Establish AED ${Math.round(capex * 0.25).toLocaleString()} standby bank facility before authorizing agreement.`,
        owner: 'CFO',
        deadline: 'Nov 02, 2026',
        status: 'Mandatory'
      },
      {
        risk: 'Operational milestone delivery delayed by external partners',
        solution: 'Contractually link 35% of capital disbursement to verified delivery and SLA audits.',
        owner: 'COO / Operations Lead',
        deadline: 'Nov 12, 2026',
        status: 'Assigned'
      },
      {
        risk: 'Revenue recognition trails initial capital amortization',
        solution: 'Pre-secure 2 binding purchase orders or customer LOIs with upfront milestone deposits.',
        owner: 'Head of Sales',
        deadline: 'Nov 20, 2026',
        status: 'Mandatory'
      }
    ]
  };
}

function renderSandboxResults(data) {
  const probEl = document.getElementById('resFailureProb');
  const titleEl = document.getElementById('resFailureTitle');
  const descEl = document.getElementById('resFailureDesc');

  const cfoScore = document.getElementById('resCfoScore');
  const cfoDetail = document.getElementById('resCfoDetail');
  const croScore = document.getElementById('resCroScore');
  const croDetail = document.getElementById('resCroDetail');
  const opsScore = document.getElementById('resOpsScore');
  const opsDetail = document.getElementById('resOpsDetail');

  const list = document.getElementById('sandboxAntidotesList');
  const hashEl = document.getElementById('resAuditHash');
  const countEl = document.getElementById('resAntidoteCount');

  if (titleEl) titleEl.textContent = data.failureTitle;
  if (descEl) descEl.textContent = data.failureDesc;

  if (cfoScore) {
    cfoScore.textContent = data.cfoScore;
    cfoScore.style.color = data.cfoColor;
  }
  if (cfoDetail) cfoDetail.textContent = data.cfoDetail;

  if (croScore) {
    croScore.textContent = data.croScore;
    croScore.style.color = data.croColor;
  }
  if (croDetail) croDetail.textContent = data.croDetail;

  if (opsScore) {
    opsScore.textContent = data.opsScore;
    opsScore.style.color = data.opsColor;
  }
  if (opsDetail) opsDetail.textContent = data.opsDetail;

  // Antidotes cards
  if (list && data.antidotes) {
    list.innerHTML = data.antidotes.map((a, idx) => `
      <div class="antidote-card">
        <div class="antidote-risk-tag">
          <span>⚠ CONDITION 0${idx + 1}:</span> ${a.risk}
        </div>
        <div class="antidote-solution">
          ${a.solution}
        </div>
        <div class="antidote-meta-row">
          <span>Assigned Owner: <strong>${a.owner}</strong></span>
          <span>Deadline: <strong>${a.deadline}</strong></span>
          <span style="color:#03aa5c;">Status: <strong>${a.status}</strong></span>
        </div>
      </div>
    `).join('');
  }

  if (countEl && data.antidotes) {
    countEl.textContent = `${data.antidotes.length} Mandatory Antidotes Locked`;
  }

  // Random hash verification
  if (hashEl) {
    const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    hashEl.textContent = `0x9c${hex}...${Math.floor(Math.random() * 9999)}`;
  }
}

function openDecisionMemoModal() {
  const modal = document.getElementById('memoModal');
  if (!modal) return;

  const data = currentActiveSandboxData || sandboxPresets.dubai_hub;

  const premise = document.getElementById('memoPremise');
  const capex = document.getElementById('memoCapex');
  const cash = document.getElementById('memoCash');
  const failure = document.getElementById('memoFailure');
  const list = document.getElementById('memoAntidoteList');
  const hash = document.getElementById('memoHash');
  const date = document.getElementById('memoDate');

  if (premise) premise.textContent = data.text;
  if (capex) capex.textContent = `AED ${Number(data.capex).toLocaleString()}`;
  if (cash) cash.textContent = `AED ${Number(data.cash).toLocaleString()}`;
  if (failure) failure.textContent = data.failureDesc;

  if (list && data.antidotes) {
    list.innerHTML = data.antidotes.map((a, i) => `
      <div style="font-size:0.8rem; border-left:2px solid #000; padding-left:0.6rem; margin-bottom:0.4rem;">
        <strong>[0${i + 1}] ${a.owner}:</strong> ${a.solution}
        <div style="font-size:0.7rem; color:#666;">Deadline: ${a.deadline} • Requirement: ${a.status}</div>
      </div>
    `).join('');
  }

  if (hash) {
    hash.textContent = document.getElementById('resAuditHash')?.textContent || '0x9c41...77e2';
  }
  if (date) {
    date.textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  }

  modal.classList.add('active');
}

function sendToBoardFromSandbox() {
  const text = (document.getElementById('sandboxDecisionText')?.value || '').toLowerCase();
  const topicSelect = document.getElementById('boardTopicSelect');

  if (topicSelect) {
    if (text.includes('warehouse') || text.includes('logistics') || text.includes('dubai')) {
      topicSelect.value = 'dubai_hub';
    } else if (text.includes('cloud') || text.includes('erp') || text.includes('software')) {
      topicSelect.value = 'erp_cloud';
    } else {
      topicSelect.value = 'production';
    }
    changeBoardTopic(topicSelect.value);
  }

  // Smooth scroll
  const boardEl = document.getElementById('board');
  if (boardEl) {
    boardEl.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      startBoardDebate();
    }, 600);
  }
}


/* ==========================================================================
   11. AI BOARDROOM ADVERSARIAL DELIBERATION ENGINE
   ========================================================================== */
const boardroomDebates = {
  production: {
    title: "Capex Allocation for Production Line [AED 300,000]",
    consensusScore: 76,
    consensusText: "APPROVAL INDEX: 76% — CONDITIONAL GREENLIGHT (2 ANTIDOTES MANDATED)",
    steps: [
      {
        agent: "ceo",
        avatar: "CEO",
        name: "CEO Agent / Master Orchestrator",
        role: "Domain: Strategic Alignment & Multi-Agent Synthesis",
        speech: "Opening deliberation on the AED 300,000 automated tooling initiative. Expanding production capacity aligns directly with our 18-month enterprise retail goals. However, we do not commit capital blindly. CFO Agent, audit liquidity and downside buffer.",
        badge: "● PROPOSAL TABLED // OPENING MULTI-AGENT AUDIT"
      },
      {
        agent: "cfo",
        avatar: "CFO",
        name: "CFO Agent / Capital & Liquidity",
        role: "Domain: Working Capital Runway, Debt Capacity & Payback Math",
        speech: "Our unencumbered cash balance is currently AED 410,000. Spending AED 300,000 upfront leaves only AED 110,000 buffer. Under a 3-month installation delay scenario, our burn jumps by AED 45,000. I mandate securing an emergency credit line of at least AED 60,000 before PO execution.",
        badge: "⚠ FINANCIAL AUDIT: MANDATORY OVERDRAFT HEDGE REQUIRED"
      },
      {
        agent: "risk",
        avatar: "CRO",
        name: "Chief Risk Officer Agent",
        role: "Domain: Failure Mode Analysis & Adversarial Pre-Mortem",
        speech: "Pre-Mortem fast-forward indicates 73% of regional manufacturing failures stem from single-vendor tooling reliance. If the Italian supplier encounters customs delays, the machine sits idle while depreciation begins. We must contractually enforce delay penalties and identify backup component sources.",
        badge: "⚠ RISK THREAT: SINGLE VENDOR DEPENDENCY IDENTIFIED"
      },
      {
        agent: "sales",
        avatar: "SLS",
        name: "Sales Strategy Agent",
        role: "Domain: Pipeline Conversion, Customer Veracity & Pricing",
        speech: "Sales pipeline currently shows only 2 tier-1 retail accounts in active negotiation, covering 40% of planned machine volume. To protect cash payback, my team must lock 3 signed Letters of Intent with advance milestone deposits before machine dispatch.",
        badge: "✓ PIPELINE VERDICT: PRE-VALIDATE 3 PURCHASE ORDERS"
      },
      {
        agent: "ops",
        avatar: "OPS",
        name: "Operations & Supply Chain Agent",
        role: "Domain: Tooling Commissioning, Factory Floor & Logistics",
        speech: "Factory electrical reinforcement and floor specs require 14 days prior to delivery. JAFZA port clearance currently averages 9 days. Operational readiness is verified as long as backup technicians are on standby for day 1 commissioning.",
        badge: "✓ OPERATIONS AUDIT: FLOOR SPECIFICATIONS VERIFIED"
      },
      {
        agent: "ceo",
        avatar: "CEO",
        name: "CEO Agent / Master Orchestrator",
        role: "Domain: Final Executive Synthesis & Antidote Binding",
        speech: "Synthesis achieved. The board grants CONDITIONAL GREENLIGHT. Antidote #1 (CFO credit line) and Antidote #2 (Sales binding POs) are legally binding conditions precedent. Procurement will not disburse funds until both are signed off.",
        badge: "✓ FINAL SYNTHESIS: CONDITIONAL GREENLIGHT LOCKED"
      }
    ]
  },
  dubai_hub: {
    title: "Dubai South Logistics Hub Expansion [AED 650,000]",
    consensusScore: 82,
    consensusText: "APPROVAL INDEX: 82% — APPROVED WITH MILESTONE GATES",
    steps: [
      {
        agent: "ceo",
        avatar: "CEO",
        name: "CEO Agent / Master Orchestrator",
        role: "Domain: Strategic Alignment & Regional Vision",
        speech: "Deliberating AED 650,000 commitment to lease a 12,000 sq ft logistics facility in Dubai South. This positions us squarely in the Dubai D33 economic corridor and reduces regional delivery latency by 45%. CFO, audit balance sheet impact.",
        badge: "● DUBAI EXPANSION PROPOSAL // INITIATING BOARD AUDIT"
      },
      {
        agent: "cfo",
        avatar: "CFO",
        name: "CFO Agent / Capital & Liquidity",
        role: "Domain: Working Capital Runway & Cash Burn",
        speech: "Cash buffer is AED 920,000. Spending AED 650,000 reduces cash to AED 270,000. If trade license approvals slip 45 days, fixed lease amortizes at AED 48,000/mo without revenue. We must lock an AED 120,000 credit facility before signing the lease.",
        badge: "⚠ CASH BUFFER SQUEEZE: AED 120,000 FACILITY REQUIRED"
      },
      {
        agent: "risk",
        avatar: "CRO",
        name: "Chief Risk Officer Agent",
        role: "Domain: Regulatory & Licensing Risk Analysis",
        speech: "Municipal trade and dangerous goods inspections in Dubai South currently take 30 to 48 days. Contractor fit-out delays represent a secondary bottleneck. We must route licensing through the expedited Freezone VIP one-stop window.",
        badge: "⚠ REGULATORY BOTTLENECK: FAST-TRACK PERMITTING MANDATED"
      },
      {
        agent: "sales",
        avatar: "SLS",
        name: "Sales Strategy Agent",
        role: "Domain: 3PL & E-Commerce Pipeline",
        speech: "Two regional e-commerce marketplaces are eager to outsource fulfillment. We will secure 2 signed agreements guaranteeing minimum monthly storage fees prior to lease commencement.",
        badge: "✓ DEMAND CONFIRMED: 2 CLIENT COMMITMENTS IN PIPELINE"
      },
      {
        agent: "ops",
        avatar: "OPS",
        name: "Operations & Supply Chain Agent",
        role: "Domain: Warehouse Fit-out & WMS Setup",
        speech: "Warehouse rack automation and barcode telemetry can be installed in 22 days. We have pre-negotiated fit-out terms with penalties of AED 1,500/day for contractor delay.",
        badge: "✓ OPERATIONS READY: FIT-OUT PENALTIES CONTRACTED"
      },
      {
        agent: "ceo",
        avatar: "CEO",
        name: "CEO Agent / Master Orchestrator",
        role: "Domain: Final Executive Synthesis",
        speech: "Consensus reached. We greenlight the Dubai South facility. Signing the lease is strictly contingent on the CFO credit line and Sales advance agreements being locked. Zero unhedged capital deployed.",
        badge: "✓ CONSENSUS APPROVED: DUBAI EXPANSION CONDITIONAL GREENLIGHT"
      }
    ]
  },
  erp_cloud: {
    title: "Core Cloud ERP & Accounting Migration [AED 220,000]",
    consensusScore: 88,
    consensusText: "APPROVAL INDEX: 88% — GREENLIGHT FOR PHASED MIGRATION",
    steps: [
      {
        agent: "ceo",
        avatar: "CEO",
        name: "CEO Agent / Master Orchestrator",
        role: "Domain: Enterprise Modernization",
        speech: "Reviewing AED 220,000 ERP cloud migration. Eliminating fragmented spreadsheets and legacy on-premise silos gives us sub-second financial telemetry. CFO, evaluate implementation risk.",
        badge: "● INFRASTRUCTURE PROPOSAL // SYSTEM AUDIT"
      },
      {
        agent: "cfo",
        avatar: "CFO",
        name: "CFO Agent / Financial Architecture",
        role: "Domain: Consulting Billing & Budget Variance",
        speech: "Cloud migration projects average 43% consultant cost overruns. We must insist on a fixed-price deliverable contract with zero open-ended hourly billing, and run parallel books for 30 days.",
        badge: "✓ FINANCIAL SAFEGUARD: FIXED-PRICE CONTRACT ONLY"
      },
      {
        agent: "risk",
        avatar: "CRO",
        name: "Chief Risk Officer Agent",
        role: "Domain: Business Continuity & Downtime",
        speech: "Downtime during month-end or quarter-end closing could disrupt VAT filings and supplier payouts. The cutover must occur over a scheduled weekend with a rollback snapshot in place.",
        badge: "✓ CONTINUITY PROTOCOL: ZERO DOWNTIME CUTOVER WINDOW"
      },
      {
        agent: "sales",
        avatar: "SLS",
        name: "Sales Strategy Agent",
        role: "Domain: CRM & Order Flow Synchronization",
        speech: "Order intake and invoicing must remain live 24/7. As long as customer invoices are queued during the 48-hour migration window, sales operations will not be impacted.",
        badge: "✓ SALES INTEGRITY: INVOICING QUEUE SECURED"
      },
      {
        agent: "ops",
        avatar: "OPS",
        name: "Operations & Supply Chain Agent",
        role: "Domain: Warehouse Inventory Synchronization",
        speech: "Inventory physical audit will be completed on Friday night, followed by automated database reconciliation before Monday 8:00 AM.",
        badge: "✓ INVENTORY AUDIT: WEEKEND RECONCILIATION LOCKED"
      },
      {
        agent: "ceo",
        avatar: "CEO",
        name: "CEO Agent / Master Orchestrator",
        role: "Domain: Final Executive Synthesis",
        speech: "High-conviction greenlight. Migration approved under fixed-price terms and 30-day parallel book validation. Implementation starts Nov 01.",
        badge: "✓ FINAL VERDICT: PHASED CLOUD MIGRATION AUTHORIZED"
      }
    ]
  }
};

let currentDebateTopic = 'production';
let currentDebateStep = 0;
let debateTimer = null;
let isDebating = false;

function initBoardroomDebate() {
  changeBoardTopic('production');
}

function changeBoardTopic(key) {
  if (!boardroomDebates[key]) return;
  currentDebateTopic = key;
  resetBoardDebate();
}

function resetBoardDebate() {
  stopBoardDebate();
  currentDebateStep = 0;
  displayDebateStep(currentDebateStep);
}

function toggleBoardDebate() {
  if (isDebating) {
    stopBoardDebate();
  } else {
    startBoardDebate();
  }
}

function startBoardDebate() {
  isDebating = true;
  const playBtn = document.getElementById('debatePlayBtn');
  const playIcon = document.getElementById('debatePlayIcon');
  const playText = document.getElementById('debatePlayText');

  if (playIcon) playIcon.textContent = '❚❚';
  if (playText) playText.textContent = 'Pause Deliberation';
  if (playBtn) playBtn.classList.add('active');

  const topicData = boardroomDebates[currentDebateTopic];

  displayDebateStep(currentDebateStep);

  clearInterval(debateTimer);
  debateTimer = setInterval(() => {
    currentDebateStep++;
    if (currentDebateStep >= topicData.steps.length) {
      stopBoardDebate();
      return;
    }
    displayDebateStep(currentDebateStep);
  }, 4200);
}

function stopBoardDebate() {
  isDebating = false;
  clearInterval(debateTimer);
  const playIcon = document.getElementById('debatePlayIcon');
  const playText = document.getElementById('debatePlayText');
  const playBtn = document.getElementById('debatePlayBtn');

  if (playIcon) playIcon.textContent = '▶';
  if (playText) playText.textContent = 'Resume Deliberation';
  if (playBtn) playBtn.classList.remove('active');

  const speakerBadge = document.getElementById('liveSpeakerBadge');
  if (speakerBadge) speakerBadge.style.display = 'none';

  document.querySelectorAll('.board-tab-btn').forEach(b => b.classList.remove('speaking'));
}

function nextBoardSpeaker() {
  const topicData = boardroomDebates[currentDebateTopic];
  currentDebateStep = (currentDebateStep + 1) % topicData.steps.length;
  displayDebateStep(currentDebateStep);
}

function displayDebateStep(idx) {
  const topicData = boardroomDebates[currentDebateTopic];
  if (!topicData || !topicData.steps[idx]) return;

  const step = topicData.steps[idx];

  // Update tabs
  document.querySelectorAll('.board-tab-btn').forEach(b => {
    b.classList.remove('active');
    b.classList.remove('speaking');
  });

  const tabId = `tab-${step.agent}`;
  const activeTab = document.getElementById(tabId);
  if (activeTab) {
    activeTab.classList.add('active');
    if (isDebating) activeTab.classList.add('speaking');
  }

  // Update speaker header
  const avatar = document.getElementById('agentAvatar');
  const name = document.getElementById('agentName');
  const role = document.getElementById('agentRole');
  const reasoning = document.getElementById('agentReasoning');
  const badge = document.getElementById('agentBadge');
  const liveBadge = document.getElementById('liveSpeakerBadge');

  if (avatar) avatar.textContent = step.avatar;
  if (name) name.textContent = step.name;
  if (role) role.textContent = step.role;
  if (reasoning) reasoning.innerHTML = `<p>${step.speech}</p>`;
  if (badge) badge.innerHTML = `<span>${step.badge}</span>`;
  if (liveBadge) liveBadge.style.display = isDebating ? 'inline-flex' : 'none';

  // Smoothly update consensus score
  const progressRatio = (idx + 1) / topicData.steps.length;
  const currentConsensus = Math.round(45 + (topicData.consensusScore - 45) * progressRatio);
  const meterFill = document.getElementById('consensusMeterFill');
  const scoreTag = document.getElementById('consensusScoreTag');

  if (meterFill) meterFill.style.width = `${currentConsensus}%`;
  if (scoreTag) {
    if (idx === topicData.steps.length - 1) {
      scoreTag.textContent = topicData.consensusText;
      scoreTag.style.color = '#b6f535';
    } else {
      scoreTag.textContent = `APPROVAL INDEX: ${currentConsensus}% — ADVERSARIAL DELIBERATION IN PROGRESS (SPEAKER ${idx + 1}/${topicData.steps.length})`;
      scoreTag.style.color = '#f59e0b';
    }
  }
}
