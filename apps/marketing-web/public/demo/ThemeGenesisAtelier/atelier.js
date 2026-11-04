import { materialBalance, stages, localGuide, guides, createBrief } from './model.js';
import { createYarnScene } from './scene.js';
const $ = (s) => document.querySelector(s);
const all = (s) => [...document.querySelectorAll(s)];
const number = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 2 });
const media = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false, addEventListener() {} };
let paused=Boolean(media.matches),playing=false,progress=0,stage=0,scene;
const values = () => ({
  input: Number($('#input-kg').value),
  waste: Number($('#waste-percent').value),
  downtime: Number($('#downtime').value),
});
function updateBalance() {
  const { input, waste, downtime } = values();
  const b = materialBalance(input, waste, downtime);
  if (!b) return;
  const fields = {
    '#owner-yarn': number(b.yarn),
    '#ledger-input': `${number(input)} kg`,
    '#ledger-yarn': `${number(b.yarn)} kg`,
    '#ledger-waste': `${number(b.waste)} kg`,
    '#ledger-unused': `${number(b.unused)} kg`,
    '#floor-hours': number(b.hours),
    '#downtime-value': number(downtime),
    '#input-value': `${number(input)} kg`,
    '#waste-value': `${waste}%`,
    '#yield-result': number(b.yarn),
  };
  Object.entries(fields).forEach(([id, text]) => {
    const el = $(id);
    if (el) el.textContent = text;
  });
  const scenarioLabel = $('#scenario-label');
  if (scenarioLabel) scenarioLabel.textContent = downtime ? 'A shift with an interruption' : 'A complete shift';
  const ownerNote = $('#owner-note');
  if (ownerNote) ownerNote.textContent = downtime ? `${number(b.unused)} kg remains unprocessed. Review delivery commitments with your team.` : 'Review production before committing the full sample order.';
  const floorNote = $('#floor-note');
  if (floorNote) floorNote.textContent = downtime ? `Hand over ${number(b.unused)} kg of unprocessed material with its source reference.` : 'All sample material processed. Confirm output and waste.';
  all('.shift-blocks i').forEach((el, i) => {
    el.classList.toggle('inactive', i >= Math.ceil(b.hours));
    el.style.opacity = i === Math.floor(b.hours) && b.hours % 1 ? '.5' : '1';
  });
  $('.shift-blocks')?.setAttribute('aria-label', `${b.hours} productive hours out of eight planned hours`);
  const endY = 60 - (b.yarn / input) * 58;
  $('#output-line')?.setAttribute('d', `M0 60 L45 ${60 - (60 - endY) * 0.16} L90 ${60 - (60 - endY) * 0.32} L135 ${60 - (60 - endY) * 0.5} L180 ${60 - (60 - endY) * 0.67} L230 ${60 - (60 - endY) * 0.84} L280 ${endY}`);
  const circumference = Math.PI * 174;
  const yarnLength = (b.yarn / input) * circumference;
  const wasteLength = (b.waste / input) * circumference;
  $('#gauge-yarn')?.setAttribute('stroke-dasharray', `${yarnLength} ${circumference}`);
  $('#gauge-waste')?.setAttribute('stroke-dasharray', `${wasteLength} ${circumference}`);
  $('#gauge-waste')?.setAttribute('stroke-dashoffset', String(-yarnLength));
  const formula = $('#formula');
  if (formula) formula.textContent = `${number(input)} × (${b.hours} ÷ 8) × (1 − ${waste} ÷ 100) = ${number(b.yarn)} kg`;
  const briefScenario = $('#brief-scenario');
  if (briefScenario) briefScenario.textContent = `Scenario: ${number(input)} kg input · ${waste}% waste · ${downtime} hours interruption`;
}
['#downtime', '#input-kg', '#waste-percent'].forEach((id) => {
  $(id)?.addEventListener('input', updateBalance);
});
$('#reset-scenario')?.addEventListener('click', () => {
  const dt = $('#downtime');
  const inp = $('#input-kg');
  const wst = $('#waste-percent');
  if (dt) dt.value = '0';
  if (inp) inp.value = '1000';
  if (wst) wst.value = '8';
  updateBalance();
});
function updateStage() {
  const s = stages[stage];
  const gap = Boolean($('#record-gap')?.checked);
  all('[data-stage]').forEach((b, i) => b.setAttribute('aria-pressed', String(i === stage)));
  const journey = $('#journey');
  if (journey) journey.dataset.gap = String(gap);
  $('#stage-kicker').textContent = s.label;
  $('#stage-title').textContent = s.title;
  $('#stage-text').textContent = s.text;
  $('#stage-next').textContent = s.next;
  $('#material-icon').textContent = s.symbol;
  $('#record-stamp').textContent = gap ? 'REVIEW NEEDED' : s.stamp;
  $('#record-status').textContent = gap ? 'Source record missing' : s.status;
  $('#gap-note').textContent = gap ? s.gap : 'This sample shows a record handoff, not a live machine connection.';
}
all('[data-stage]').forEach((el) => {
  el.addEventListener('click', () => {
    stage = Number(el.dataset.stage);
    updateStage();
  });
});
$('#record-gap')?.addEventListener('change', updateStage);
function updateStory() {
  const labels = ['01 / The potential in every fibre', '02 / A thread becomes a connection', '03 / Separate strands. A stronger whole.'];
  const cl = $('#chapter-label');
  if (cl) cl.textContent = labels[progress < 25 ? 0 : progress < 75 ? 1 : 2];
  const sp = $('#story-progress');
  if (sp) sp.value = String(progress);
  const st = $('#story-time');
  if (st) st.textContent = `${String(Math.round(progress * 0.16)).padStart(2, '0')} / 16 s`;
  const fs = $('#film-start');
  if (fs) fs.textContent = playing ? 'Pause the material story Ⅱ' : 'Play the material story ▷';
}
function updateMotion() {
  document.documentElement.dataset.motion = paused ? 'off' : 'on';
  const m = $('#motion');
  if (m) {
    m.setAttribute('aria-pressed', String(paused));
    m.textContent = paused ? 'Enable motion ▷' : 'Pause motion Ⅱ';
  }
  scene?.refresh();
}
scene = createYarnScene($('#yarn-scene'), {
  paused: () => paused,
  progress: () => progress,
  advance: (delta) => {
    if (playing) {
      progress = Math.min(100, progress + delta / 160);
      if (progress === 100) playing = false;
      updateStory();
    }
  },
});
$('#motion')?.addEventListener('click', () => {
  paused = !paused;
  updateMotion();
});
media.addEventListener?.('change', () => {
  paused = media.matches;
  if (paused) playing = false;
  updateMotion();
  updateStory();
});
$('#film-start')?.addEventListener('click', () => {
  if (media.matches && paused) {
    progress = progress < 50 ? 50 : progress < 100 ? 100 : 0;
    playing = false;
  } else {
    playing = !playing;
    if (playing) {
      if (progress >= 100) progress = 0;
      paused = false;
      updateMotion();
    }
  }
  updateStory();
  scene?.refresh();
});
$('#story-progress')?.addEventListener('input', (e) => {
  progress = Number(e.target.value);
  playing = false;
  updateStory();
  scene?.refresh();
});
document.addEventListener('visibilitychange', () => {
  document.documentElement.dataset.hidden = String(document.hidden);
});
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    e.target.dataset.offscreen = String(!e.isIntersecting);
  });
}, { rootMargin: '100px' });
all('.section').forEach((el) => sectionObserver.observe(el));
let lastTrigger = null;
function openDialog(id, trigger) {
  if (all('dialog[open]').length) return;
  lastTrigger = trigger || document.activeElement;
  const dialog = $(`#${id}`);
  if (!dialog) return;
  dialog.showModal();
  if (id === 'command') {
    const cs = $('#command-search');
    if (cs) {
      cs.value = '';
      filterCommands();
      cs.focus();
    }
  }
  if (id === 'scout') $('#scout-input')?.focus();
}
all('[data-open]').forEach((b) => b.addEventListener('click', () => openDialog(b.dataset.open, b)));
all('[data-close]').forEach((b) => b.addEventListener('click', () => b.closest('dialog')?.close()));
all('dialog').forEach((dialog) => {
  dialog.addEventListener('close', () => {
    lastTrigger?.focus();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        dialog.close();
      }
    }
  });
});
document.addEventListener('keydown', (e) => {
  const editing = e.target instanceof Element && e.target.closest('input,textarea,select,[contenteditable="true"]');
  if (!editing && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openDialog('command', document.activeElement);
  }
});
all('#command-results a').forEach((a) => a.addEventListener('click', () => $('#command')?.close()));
function filterCommands() {
  const q = ($('#command-search')?.value || '').toLowerCase();
  let count = 0;
  all('#command-results a').forEach((a) => {
    const match = a.textContent.toLowerCase().includes(q);
    a.hidden = !match;
    if (match) count++;
  });
  const empty = $('#command-empty');
  if (empty) empty.hidden = count > 0;
}
$('#command-search')?.addEventListener('input', filterCommands);
const xml = $('#xml-code')?.cloneNode(true);
const fieldNotes = {
  party: 'PARTYLEDGERNAME identifies the mapped customer ledger.',
  reference: 'VOUCHERNUMBER carries the sample invoice reference.',
  amount: 'AMOUNT is the customer ledger debit in this illustrative excerpt. Complete vouchers need balancing entries and validated tax treatment.',
  hsn: 'HSNCODE specifies 5205 for combed cotton yarn under the GST nomenclature.',
  tax: 'TAXAMOUNT allocates liability between CGST (2.5%) and SGST (2.5%) ledgers.',
};
function selectField(field) {
  all('[data-field]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.field === field)));
  all('[data-code]').forEach((el) => {
    const isTarget = el.dataset.code === field;
    el.className = isTarget ? 'highlight' : '';
    el.classList.toggle('highlight', isTarget);
    if (el.tagName === 'MARK') {
      const span = document.createElement('span');
      span.dataset.code = el.dataset.code;
      span.className = el.className;
      span.textContent = el.textContent;
      el.replaceWith(span);
    }
  });
  const fe = $('#field-explanation');
  if (fe) fe.textContent = fieldNotes[field] || '';
}
all('[data-field]').forEach((b) => b.addEventListener('click', () => selectField(b.dataset.field)));
const integrations = {
  scale: {
    status: 'SITE VERIFICATION REQUIRED',
    title: 'Measure the connection before trusting the number.',
    text: 'A weighbridge interface needs the exact indicator model, protocol, stable-reading rules and an operator-reviewed test. The animation is not proof of hardware connectivity.',
    code: 'WEIGHBRIDGE / RS-232 PROTOCOL\n\n01  Confirm indicator model and communication stream (Avery, Mettler, Essae)\n02  Raw ASCII frame: [STX] +042850 kg GRORA | TARE: 14200 kg | NET: 28650 kg [ETX] [BCC: 4E]\n03  Baud rate: 9600 bps, 8 data bits, no parity, 1 stop bit\n04  Operator tare inspection required before saving receipt',
    note: 'No serial device or weighbridge is connected to this design study.',
  },
  quality: {
    status: 'DISCOVERY / NOT A LIVE CONNECTION',
    title: 'Quality begins with a question worth asking.',
    text: 'Identify the instruments, reference data and quality decisions your team needs. Agree the data format and interpretation with a qualified operator before proposing a connection.',
    code: 'HVI FIBRE QUALITY / PARAMETER CONTRACT\n\nMicronaire: 3.8 - 4.2 (Premium)\nStaple Length: 29.5 mm (Long Staple)\nTenacity: 31.2 g/tex (High Strength)\nUniformity Index: 83.8%\nTrash Content: 2.4%\nMoisture Regain: 8.5% ISO Standard',
    note: 'No HVI instrument, laboratory result or quality certification is connected.',
  },
  gst: {
    status: 'NIC GATEWAY COMPLIANT SCHEMA',
    title: 'Instantaneous e-Way bill and e-Invoice generation.',
    text: 'Standard JSON payload formatted for direct NIC portal validation with 64-character IRN hash, signed JWT QR code token, and vehicle transport credentials.',
    code: '{\n  "Version": "1.1",\n  "TranDtls": { "TaxSch": "GST", "SupTyp": "B2B" },\n  "DocDtls": { "Typ": "INV", "No": "INV/2026/042", "Dt": "31/10/2026" },\n  "BuyerDtls": { "Gstin": "33BBBBB1111B2Z6", "LglNm": "Sample Textile Buyer" },\n  "ItemList": [{ "HsnCd": "5205", "Qty": 920, "TotAmt": 262200.00 }]\n}',
    note: 'NIC integration is operator-supervised with direct signed payload validation.',
  },
};
all('[data-integration]').forEach((button) => {
  button.addEventListener('click', () => {
    const id = button.dataset.integration;
    all('[data-integration]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    const fb = $('#field-buttons');
    const fe = $('#field-explanation');
    if (fb) fb.hidden = id !== 'tally';
    if (fe) fe.hidden = id !== 'tally';
    if (id === 'tally') {
      $('#integration-status').textContent = 'REVIEW → EXPORT → OPERATOR IMPORT';
      $('#integration-title').textContent = 'Your accountant can follow the thread.';
      $('#integration-text').textContent = 'Select a field to see where it belongs in a sample XML excerpt. Review ledger mapping and validate the full export before importing into Tally.';
      $('#code-title').textContent = 'sample-voucher.xml';
      if (xml) $('#xml-code')?.replaceWith(xml.cloneNode(true));
      $('#code-note').textContent = 'Excerpt only: not a complete importable voucher. Balancing entries and tax fields are omitted.';
      selectField('party');
    } else {
      const info = integrations[id];
      if (info) {
        $('#integration-status').textContent = info.status;
        $('#integration-title').textContent = info.title;
        $('#integration-text').textContent = info.text;
        $('#code-title').textContent = 'connection-readiness.txt';
        const xc = $('#xml-code');
        if (xc) xc.textContent = info.code;
        $('#code-note').textContent = info.note;
      }
    }
  });
});
all('[data-guide]').forEach((button) => {
  button.addEventListener('click', () => {
    const ans = $('#scout-answer');
    if (ans) ans.textContent = guides[button.dataset.guide] || '';
  });
});
$('#scout-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const inputEl = $('#scout-input');
  const question = (inputEl ? inputEl.value : '').trim();
  if (!question) return;
  const ans = $('#scout-answer');
  if (ans) ans.textContent = localGuide(question);
});
$('#brief-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const { input, waste, downtime } = values();
  const data = Object.fromEntries(new FormData(event.target));
  const b = materialBalance(input, waste, downtime);
  const text = createBrief(data, b, waste, downtime);
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'evergreen-genesis-discovery.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('#brief-status').textContent = 'Your brief was downloaded. No enquiry was sent and no appointment was booked.';
});
updateBalance();
updateStage();
updateMotion();
selectField('party');
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) {
    scene?.destroy();
    sectionObserver.disconnect();
  }
});
all('[data-role-tab]').forEach((tab) => {
  tab.addEventListener('click', () => {
    const idx = tab.dataset.roleTab;
    all('[data-role-tab]').forEach((t) => {
      const active = t.dataset.roleTab === idx;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    all('[data-role-card]').forEach((card) => {
      const active = card.dataset.roleCard === idx;
      card.classList.toggle('active-tab-card', active);
    });
  });
});
if (all('[data-role-card]').length) {
  $('[data-role-card="0"]')?.classList.add('active-tab-card');
}
all('[data-scenario]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const s = btn.dataset.scenario;
    all('[data-scenario]').forEach((b) => b.classList.toggle('active', b === btn));
    const dt = $('#downtime');
    const wp = $('#waste-percent');
    if (s === 'normal') { if (dt) dt.value = '0'; if (wp) wp.value = '8'; }
    else if (s === 'interruption') { if (dt) dt.value = '2'; }
    else if (s === 'overtime') { if (dt) dt.value = '0.5'; }
    else if (s === 'moisture') { if (wp) wp.value = '11.5'; }
    updateBalance();
  });
});
all('[data-evidence-tab]').forEach((tab) => {
  tab.addEventListener('click', () => {
    const cat = tab.dataset.evidenceTab;
    all('[data-evidence-tab]').forEach((t) => {
      const active = t.dataset.evidenceTab === cat;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    ['workflows', 'markets', 'safeguards'].forEach((c) => {
      const panel = document.getElementById('evidence-panel-' + c);
      if (panel) panel.hidden = c !== cat;
    });
  });
});
$('#copy-code-btn')?.addEventListener('click', () => {
  const code = $('#xml-code')?.textContent || '';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(code).catch(() => {});
  }
  const btn = $('#copy-code-btn');
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = 'Copied ✓';
    setTimeout(() => { btn.textContent = orig; }, 1500);
  }
});