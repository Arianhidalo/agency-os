// Module structure: StorageService, DataStore, UI (router + views), Charts, Utils

const utils = {
  uuid: () => crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(16).slice(2),
  today: () => new Date().toISOString().slice(0,10),
  monthKey: dateStr => dateStr.slice(0,7),
  formatMoney: v => '$' + (Number(v)||0).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0}),
  parseDate: s => isNaN(new Date(s)) ? null : new Date(s),
  showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show';
    setTimeout(() => t.className = 'toast', 2200);
  }
};

class StorageService {
  constructor() {
    this.useLocal = false;
    this.db = null;
  }
  async init() {
    try {
      await this.initIndexedDB();
    } catch (e) {
      console.warn('IndexedDB failed, fallback to localStorage', e);
      this.useLocal = true;
    }
  }
  initIndexedDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject('no idb');
      const open = indexedDB.open('agencyOS', 1);
      open.onupgradeneeded = () => {
        open.result.createObjectStore('state');
      };
      open.onerror = () => reject(open.error);
      open.onsuccess = () => { this.db = open.result; resolve(); };
    });
  }
  async saveState(state) {
    if (this.useLocal) {
      localStorage.setItem('agencyState', JSON.stringify(state));
      return;
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('state', 'readwrite');
      tx.objectStore('state').put(state, 'main');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  }
  async loadState() {
    if (this.useLocal) {
      const raw = localStorage.getItem('agencyState');
      return raw ? JSON.parse(raw) : null;
    }
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('state', 'readonly');
      const req = tx.objectStore('state').get('main');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }
}

class DataStore {
  constructor(storage) {
    this.storage = storage;
    this.state = { companies: [], outreach: [], transactions: [], logs: [] };
  }
  async init() {
    const saved = await this.storage.loadState();
    if (saved) this.state = saved; else this.resetDemo();
  }
  persist() { this.storage.saveState(this.state); }

  resetDemo() {
    const c1 = { companyId: utils.uuid(), companyName: 'Blackline Ventures', niche:'SaaS', location:'NY, NY', website:'https://blackline.example', primaryEmail:'ceo@blackline.co', phone:'212-555-0101', ownerName:'Evelyn Stone', status:'Meeting Set', dealValue:65000, notes:'Warm intro via board.', tags:['enterprise','priority'], nextAction:'Send proposal', createdAt: Date.now(), updatedAt: Date.now() };
    const c2 = { companyId: utils.uuid(), companyName: 'Northstar Media', niche:'Media', location:'SF, CA', website:'https://northstar.example', primaryEmail:'ops@northstar.media', phone:'415-555-2333', ownerName:'Kai Turner', status:'Lead', dealValue:18000, notes:'Cold outbound list', tags:['media'], nextAction:'Call CFO', createdAt: Date.now(), updatedAt: Date.now() };
    const c3 = { companyId: utils.uuid(), companyName: 'Harbor Logistics', niche:'Logistics', location:'Austin, TX', website:'', primaryEmail:'hello@harborlog.com', phone:'512-555-1000', ownerName:'Mara Quinn', status:'Proposal', dealValue:42000, notes:'RFP stage', tags:['logistics','rfp'], nextAction:'Follow-up on RFP', createdAt: Date.now(), updatedAt: Date.now() };
    const outreach = [
      { outreachId: utils.uuid(), companyId: c1.companyId, channel:'Email', templateName:'Warm Intro', subject:'Intro deck', sentAt:new Date().toISOString(), outcome:'Meeting', nextFollowUpAt:new Date(Date.now()+86400000).toISOString(), followUpCount:2, notes:'Meeting booked' },
      { outreachId: utils.uuid(), companyId: c2.companyId, channel:'LinkedIn', templateName:'Cold', subject:'Ops revamp', sentAt:new Date().toISOString(), outcome:'No reply', nextFollowUpAt:new Date(Date.now()+2*86400000).toISOString(), followUpCount:1, notes:'Left note' }
    ];
    const transactions = [
      { txId: utils.uuid(), date: utils.today(), type:'Income', amount: 18000, category:'Revenue-Client', companyId:c1.companyId, description:'Phase 1 payment', paymentMethod:'Wire', recurring:false },
      { txId: utils.uuid(), date: utils.today(), type:'Expense', amount: 1200, category:'Software', companyId:null, description:'Tools', paymentMethod:'Card', recurring:true, interval:'Monthly' }
    ];
    const logs = [
      { logId: utils.uuid(), date: utils.today(), topPriorities:['Close Blackline','Refine outreach'], wins:['Booked meeting'], blockers:['Waiting on data'], metrics:{callsMade:12, emailsSent:30, meetings:2, revenueToday:18000, expensesToday:1200}, notes:'Good momentum' }
    ];
    this.state = { companies:[c1,c2,c3], outreach, transactions, logs };
    this.persist();
  }

  upsert(collection, item, key='id') {
    const arr = this.state[collection];
    const idx = arr.findIndex(i => i[key] === item[key]);
    if (idx>=0) arr[idx] = item; else arr.push(item);
    this.persist();
  }
  delete(collection, key, value) {
    this.state[collection] = this.state[collection].filter(i => i[key] !== value);
    this.persist();
  }
}

class UI {
  constructor(store) {
    this.store = store;
    this.currentView = 'dashboard';
    this.canvasCache = {};
    this.bindNav();
    this.renderAll();
  }
  bindNav() {
    document.querySelectorAll('.nav-link').forEach(btn => {
      btn.addEventListener('click', () => this.switchView(btn.dataset.view));
    });
    document.getElementById('quick-add-tx').onclick = () => this.quickTx();
    document.getElementById('quick-add-touch').onclick = () => this.quickTouch();
  }
  switchView(view) {
    this.currentView = view;
    document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
    document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
    document.getElementById(`view-${view}`).classList.remove('hidden');
    document.getElementById('view-title').textContent = view === 'crm'? 'CRM / Outreach' : view==='log'?'CEO Daily Log': view==='settings'?'Settings / Backup': view.charAt(0).toUpperCase()+view.slice(1);
    this.renderAll();
  }

  renderAll() {
    this.renderDashboard();
    this.renderCRM();
    this.renderFinance();
    this.renderLog();
    this.renderSettings();
  }

  renderDashboard() {
    const area = document.getElementById('view-dashboard');
    const income = this.monthTotal('Income');
    const expenses = this.monthTotal('Expense');
    const profit = income - expenses;
    const cashflow = this.store.state.transactions.reduce((s,t)=>s + (t.type==='Income'?t.amount:-t.amount),0);
    const pipeline = this.pipelineTotals();
    const upcoming = this.upcomingFollowups();
    const today = this.todayMetrics();
    area.innerHTML = `
      <div class="grid grid-4">
        ${['Income','Expenses','Profit','Cashflow'].map((k,i)=>{
          const val = [income,expenses,profit,cashflow][i];
          return `<div class="card kpi"><div class="muted">${k} (month)</div><div class="value">${utils.formatMoney(val)}</div></div>`;
        }).join('')}
      </div>
      <div class="grid grid-3">
        <div class="card">
          <h3>Pipeline by status</h3>
          <div class="grid grid-2">
            ${Object.entries(pipeline).map(([s,v])=>`<div class="flex" style="justify-content:space-between"><span>${s}</span><strong>${utils.formatMoney(v)}</strong></div>`).join('')}
          </div>
        </div>
        <div class="card">
          <h3>Upcoming follow-ups</h3>
          <ul class="muted" style="padding-left:16px;">
            ${upcoming.slice(0,5).map(u=>`<li><strong>${u.company}</strong> - ${new Date(u.next).toLocaleString()} (${u.outcome})</li>`).join('') || '<li>None</li>'}
          </ul>
        </div>
        <div class="card">
          <h3>Today</h3>
          ${today ? `<div class="grid grid-2"><div><div class="muted">Calls</div><div class="value">${today.metrics.callsMade}</div></div><div><div class="muted">Emails</div><div class="value">${today.metrics.emailsSent}</div></div><div><div class="muted">Meetings</div><div class="value">${today.metrics.meetings}</div></div><div><div class="muted">Rev</div><div class="value">${utils.formatMoney(today.metrics.revenueToday)}</div></div></div><p class="muted">Notes: ${today.notes}</p>`: '<p class="muted">No log yet.</p>'}
        </div>
      </div>`;
  }

  monthTotal(type) {
    const month = utils.today().slice(0,7);
    return this.store.state.transactions.filter(t=>t.type===type && t.date.startsWith(month)).reduce((s,t)=>s+Number(t.amount||0),0);
  }
  pipelineTotals() {
    const map = {};
    this.store.state.companies.forEach(c=>{ map[c.status] = (map[c.status]||0) + (Number(c.dealValue)||0); });
    return map;
  }
  upcomingFollowups() {
    return this.store.state.outreach
      .filter(o=>o.nextFollowUpAt)
      .sort((a,b)=> new Date(a.nextFollowUpAt) - new Date(b.nextFollowUpAt))
      .map(o=>({company: this.store.state.companies.find(c=>c.companyId===o.companyId)?.companyName||'Unknown', next:o.nextFollowUpAt, outcome:o.outcome}));
  }
  todayMetrics() {
    return this.store.state.logs.find(l=>l.date===utils.today());
  }

  renderCRM() {
    const area = document.getElementById('view-crm');
    const statuses = ['Lead','Contacted','Replied','Meeting Set','Proposal','Won','Lost'];
    const unique = (field) => [...new Set(this.store.state.companies.map(c=>c[field]||''))];
    const search = this.searchTerm || '';
    const statusFilter = this.statusFilter || '';
    const nicheFilter = this.nicheFilter || '';
    const cityFilter = this.cityFilter || '';
    const filtered = this.store.state.companies.filter(c => (
      c.companyName.toLowerCase().includes(search||'') || (c.notes||'').toLowerCase().includes(search||'')
    ) && (!statusFilter || c.status===statusFilter) && (!nicheFilter || c.niche===nicheFilter) && (!cityFilter || c.location.includes(cityFilter)));

    area.innerHTML = `
      <div class="card">
        <h3>Companies</h3>
        <div class="input-row">
          <div><label>Search</label><input id="company-search" value="${search}" placeholder="name or note"></div>
          <div><label>Status</label><select id="company-status-filter"><option value="">Any</option>${statuses.map(s=>`<option ${statusFilter===s?'selected':''}>${s}</option>`).join('')}</select></div>
          <div><label>Niche</label><select id="company-niche-filter"><option value="">Any</option>${unique('niche').map(n=>`<option ${nicheFilter===n?'selected':''}>${n}</option>`).join('')}</select></div>
          <div><label>City</label><select id="company-city-filter"><option value="">Any</option>${unique('location').map(n=>`<option ${cityFilter===n?'selected':''}>${n}</option>`).join('')}</select></div>
        </div>
        <table class="table" style="margin-top:10px">
          <thead><tr><th>Name</th><th>Status</th><th>Niche</th><th>Location</th><th>Deal</th><th>Actions</th></tr></thead>
          <tbody>
            ${filtered.map(c=>`<tr data-id="${c.companyId}"><td>${c.companyName}</td><td>${c.status}</td><td>${c.niche}</td><td>${c.location}</td><td>${utils.formatMoney(c.dealValue||0)}</td><td><button class="ghost" data-act="view">View</button><button class="ghost" data-act="del">Del</button></td></tr>`).join('')}
          </tbody>
        </table>
        <h4 class="section-title">Kanban</h4>
        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(180px,1fr));">
          ${statuses.map(s=>`<div class="card" style="min-height:140px"><div class="muted">${s}</div>${this.store.state.companies.filter(c=>c.status===s).map(c=>`<div class="badge" style="display:block;margin-top:6px">${c.companyName}</div>`).join('')||'<p class="muted">-</p>'}</div>`).join('')}
        </div>
      </div>
      <div class="grid grid-2">
        <div class="card" id="company-detail">${this.companyDetailHTML(filtered[0]||null)}</div>
        <div class="card">
          <h3>Quick create</h3>
          ${this.companyForm()}
          <hr style="border-color: var(--line)">
          ${this.touchpointForm()}
        </div>
      </div>`;

    document.getElementById('company-search').oninput = e=>{this.searchTerm=e.target.value.toLowerCase(); this.renderCRM();};
    document.getElementById('company-status-filter').onchange = e=>{this.statusFilter=e.target.value; this.renderCRM();};
    document.getElementById('company-niche-filter').onchange = e=>{this.nicheFilter=e.target.value; this.renderCRM();};
    document.getElementById('company-city-filter').onchange = e=>{this.cityFilter=e.target.value; this.renderCRM();};
    area.querySelectorAll('tbody tr').forEach(row=>{
      row.querySelector('[data-act="view"]').onclick = ()=>{
        const id = row.dataset.id;
        const c = this.store.state.companies.find(x=>x.companyId===id);
        document.getElementById('company-detail').innerHTML = this.companyDetailHTML(c);
      };
      row.querySelector('[data-act="del"]').onclick = ()=>{
        this.store.delete('companies','companyId', row.dataset.id);
        this.renderAll();
        utils.showToast('Company removed');
      };
    });
    this.bindCompanyForm();
    this.bindTouchpointForm();
  }

  companyDetailHTML(c) {
    if (!c) return '<p class="muted">Select a company.</p>';
    const outreach = this.store.state.outreach.filter(o=>o.companyId===c.companyId).sort((a,b)=>new Date(b.sentAt)-new Date(a.sentAt));
    return `
      <h3>${c.companyName}</h3>
      <p class="muted">${c.niche} • ${c.location}</p>
      <div class="tag">${c.status}</div> <div class="tag">${c.nextAction||''}</div>
      <p>Email: ${c.primaryEmail} | Phone: ${c.phone}</p>
      <p>Deal: ${utils.formatMoney(c.dealValue||0)}</p>
      <p>Tags: ${(c.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</p>
      <p>Notes: ${c.notes||''}</p>
      <h4>Outreach timeline</h4>
      <div class="timeline">${outreach.map(o=>`<div class="timeline-item"><strong>${o.channel}</strong> ${new Date(o.sentAt).toLocaleString()} - ${o.outcome}<br><span class="muted">${o.subject||''}</span></div>`).join('') || '<p class="muted">No touchpoints yet.</p>'}</div>
    `;
  }

  companyForm() {
    return `
    <h4>Create company</h4>
    <div class="input-row">
      <div><label>Name</label><input id="c-name"></div>
      <div><label>Niche</label><input id="c-niche"></div>
      <div><label>Location</label><input id="c-loc" placeholder="City, State"></div>
      <div><label>Status</label><select id="c-status"><option>Lead</option><option>Contacted</option><option>Replied</option><option>Meeting Set</option><option>Proposal</option><option>Won</option><option>Lost</option></select></div>
      <div><label>Deal Value</label><input id="c-deal" type="number"></div>
      <div><label>Website</label><input id="c-web"></div>
      <div><label>Primary Email</label><input id="c-email"></div>
      <div><label>Phone</label><input id="c-phone"></div>
      <div><label>Owner</label><input id="c-owner"></div>
      <div><label>Tags (comma)</label><input id="c-tags"></div>
      <div><label>Next Action</label><input id="c-next"></div>
      <div style="grid-column:1/-1"><label>Notes</label><textarea id="c-notes"></textarea></div>
    </div>
    <button id="c-save">Save Company</button>
    `;
  }
  bindCompanyForm() {
    document.getElementById('c-save').onclick = ()=>{
      const email = document.getElementById('c-email').value;
      if (email && !/^[^@]+@[^@]+\.[^@]+$/.test(email)) return utils.showToast('Invalid email');
      const data = {
        companyId: utils.uuid(),
        companyName: document.getElementById('c-name').value || 'Unnamed',
        niche: document.getElementById('c-niche').value,
        location: document.getElementById('c-loc').value,
        website: document.getElementById('c-web').value,
        primaryEmail: email,
        phone: document.getElementById('c-phone').value,
        ownerName: document.getElementById('c-owner').value,
        status: document.getElementById('c-status').value,
        dealValue: Number(document.getElementById('c-deal').value)||0,
        notes: document.getElementById('c-notes').value,
        tags: (document.getElementById('c-tags').value||'').split(',').map(t=>t.trim()).filter(Boolean),
        nextAction: document.getElementById('c-next').value,
        createdAt: Date.now(), updatedAt: Date.now()
      };
      this.store.state.companies.push(data);
      this.store.persist();
      this.renderAll();
      utils.showToast('Company saved');
    };
  }

  touchpointForm() {
    return `
      <h4>Log Email sent</h4>
      <div class="input-row">
        <div><label>Company</label><select id="t-company">${this.store.state.companies.map(c=>`<option value="${c.companyId}">${c.companyName}</option>`).join('')}</select></div>
        <div><label>Date</label><input type="datetime-local" id="t-date" value="${new Date().toISOString().slice(0,16)}"></div>
        <div><label>Subject</label><input id="t-subject"></div>
        <div><label>Outcome</label><select id="t-outcome"><option>No reply</option><option>Reply</option><option>Bounce</option><option>Meeting</option><option>Not interested</option></select></div>
        <div><label>Next Follow-up</label><input type="datetime-local" id="t-next" value="${new Date(Date.now()+2*86400000).toISOString().slice(0,16)}"></div>
      </div>
      <button id="t-save">Add touchpoint</button>
    `;
  }
  bindTouchpointForm() {
    document.getElementById('t-save').onclick = ()=>{
      const companyId = document.getElementById('t-company').value;
      const sentAt = document.getElementById('t-date').value;
      const next = document.getElementById('t-next').value;
      const item = { outreachId: utils.uuid(), companyId, channel:'Email', templateName:'', subject: document.getElementById('t-subject').value, sentAt, outcome: document.getElementById('t-outcome').value, nextFollowUpAt: next, followUpCount:1, notes:'' };
      this.store.state.outreach.push(item);
      this.store.persist();
      this.renderAll();
      utils.showToast('Touchpoint logged');
    };
  }

  renderFinance() {
    const area = document.getElementById('view-finance');
    const month = this.txMonthFilter || utils.today().slice(0,7);
    const type = this.txTypeFilter || '';
    const category = this.txCatFilter || '';
    const company = this.txCompanyFilter || '';
    const filtered = this.store.state.transactions.filter(t=>
      (!month || t.date.startsWith(month)) && (!type || t.type===type) && (!category || t.category===category) && (!company || t.companyId===company)
    );
    area.innerHTML = `
      <div class="card">
        <h3>Transactions</h3>
        <div class="input-row">
          <div><label>Month</label><input type="month" id="tx-month" value="${month}"></div>
          <div><label>Type</label><select id="tx-type"><option value="">Any</option><option>Income</option><option>Expense</option></select></div>
          <div><label>Category</label><input id="tx-cat" value="${category}"></div>
          <div><label>Company</label><select id="tx-company"><option value="">Any</option>${this.store.state.companies.map(c=>`<option value="${c.companyId}" ${company===c.companyId?'selected':''}>${c.companyName}</option>`).join('')}</select></div>
        </div>
        <table class="table" style="margin-top:10px">
          <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Category</th><th>Company</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            ${filtered.map(t=>`<tr data-id="${t.txId}"><td>${t.date}</td><td>${t.type}</td><td>${utils.formatMoney(t.amount)}</td><td>${t.category}</td><td>${this.store.state.companies.find(c=>c.companyId===t.companyId)?.companyName||'-'}</td><td>${t.description}</td><td><button class="ghost" data-act="del">Del</button></td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="grid grid-2">
        <div class="card">${this.txForm()}</div>
        <div class="card">
          <h3>Summary</h3>
          ${this.financeSummaryTables()}
          <canvas id="finance-chart" height="180"></canvas>
        </div>
      </div>`;
    document.getElementById('tx-month').onchange = e=>{this.txMonthFilter=e.target.value; this.renderFinance();};
    document.getElementById('tx-type').onchange = e=>{this.txTypeFilter=e.target.value; this.renderFinance();};
    document.getElementById('tx-cat').oninput = e=>{this.txCatFilter=e.target.value; this.renderFinance();};
    document.getElementById('tx-company').onchange = e=>{this.txCompanyFilter=e.target.value; this.renderFinance();};
    area.querySelectorAll('tbody tr').forEach(row=>{
      row.querySelector('[data-act="del"]').onclick = ()=>{
        this.store.delete('transactions','txId',row.dataset.id);
        this.renderAll();
        utils.showToast('Transaction removed');
      };
    });
    this.bindTxForm();
    this.renderChart();
  }

  txForm() {
    return `
      <h3>Add transaction</h3>
      <div class="input-row">
        <div><label>Date</label><input type="date" id="tx-date" value="${utils.today()}"></div>
        <div><label>Type</label><select id="tx-type-input"><option>Income</option><option>Expense</option></select></div>
        <div><label>Amount</label><input type="number" id="tx-amount" min="0"></div>
        <div><label>Category</label><input id="tx-category" placeholder="Revenue-Client"></div>
        <div><label>Company</label><select id="tx-comp"><option value="">None</option>${this.store.state.companies.map(c=>`<option value="${c.companyId}">${c.companyName}</option>`).join('')}</select></div>
        <div><label>Payment Method</label><input id="tx-method"></div>
        <div><label>Recurring</label><select id="tx-recurring"><option value="false">No</option><option value="true">Yes</option></select></div>
        <div><label>Interval</label><select id="tx-interval"><option value="">--</option><option>Monthly</option><option>Annual</option></select></div>
        <div style="grid-column:1/-1"><label>Description</label><textarea id="tx-desc"></textarea></div>
      </div>
      <button id="tx-save">Save transaction</button>
    `;
  }
  bindTxForm() {
    document.getElementById('tx-save').onclick = ()=>{
      const amount = Number(document.getElementById('tx-amount').value);
      if (!(amount>0)) return utils.showToast('Amount must be positive');
      const date = document.getElementById('tx-date').value;
      if (!utils.parseDate(date)) return utils.showToast('Invalid date');
      const item = {
        txId: utils.uuid(),
        date,
        type: document.getElementById('tx-type-input').value,
        amount,
        category: document.getElementById('tx-category').value,
        companyId: document.getElementById('tx-comp').value || null,
        description: document.getElementById('tx-desc').value,
        paymentMethod: document.getElementById('tx-method').value,
        recurring: document.getElementById('tx-recurring').value === 'true',
        interval: document.getElementById('tx-interval').value || null
      };
      this.store.state.transactions.push(item);
      this.store.persist();
      this.renderAll();
      utils.showToast('Transaction saved');
    };
  }

  financeSummaryTables() {
    const byMonth = {};
    this.store.state.transactions.forEach(t=>{
      const m = utils.monthKey(t.date);
      byMonth[m] = byMonth[m] || {Income:0, Expense:0};
      byMonth[m][t.type] += Number(t.amount)||0;
    });
    const byCompany = {};
    this.store.state.transactions.forEach(t=>{
      const name = this.store.state.companies.find(c=>c.companyId===t.companyId)?.companyName || 'Unassigned';
      byCompany[name] = byCompany[name] || {Income:0, Expense:0};
      byCompany[name][t.type] += Number(t.amount)||0;
    });
    return `
      <div class="grid grid-2">
        <div>
          <h4>By month</h4>
          ${Object.entries(byMonth).sort(([a],[b])=>a.localeCompare(b)).map(([m,v])=>`<div class="flex" style="justify-content:space-between"><span>${m}</span><span>${utils.formatMoney(v.Income)} / ${utils.formatMoney(v.Expense)}</span></div>`).join('')}
        </div>
        <div>
          <h4>By company</h4>
          ${Object.entries(byCompany).map(([m,v])=>`<div class="flex" style="justify-content:space-between"><span>${m}</span><span>${utils.formatMoney(v.Income - v.Expense)}</span></div>`).join('')}
        </div>
      </div>`;
  }

  renderChart() {
    const canvas = document.getElementById('finance-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const months = [...new Set(this.store.state.transactions.map(t=>utils.monthKey(t.date)))].sort();
    const income = months.map(m=>this.store.state.transactions.filter(t=>t.type==='Income' && t.date.startsWith(m)).reduce((s,t)=>s+Number(t.amount),0));
    const expense = months.map(m=>this.store.state.transactions.filter(t=>t.type==='Expense' && t.date.startsWith(m)).reduce((s,t)=>s+Number(t.amount),0));
    const max = Math.max(...income,...expense,1);
    const barWidth = canvas.width / Math.max(months.length*2,1);
    months.forEach((m,i)=>{
      const x = i*barWidth*2 + 20;
      const hInc = (income[i]/max)*150;
      const hExp = (expense[i]/max)*150;
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(x, 170-hInc, barWidth-6, hInc);
      ctx.fillStyle = '#777';
      ctx.fillRect(x+barWidth/2, 170-hExp, barWidth-6, hExp);
      ctx.fillStyle = '#888';
      ctx.fillText(m, x, 170+12);
    });
  }

  renderLog() {
    const area = document.getElementById('view-log');
    const search = this.logSearch || '';
    const filtered = this.store.state.logs.filter(l=>JSON.stringify(l).toLowerCase().includes(search.toLowerCase()));
    const latest = filtered[0];
    area.innerHTML = `
      <div class="grid grid-2">
        <div class="card">${this.logForm()}</div>
        <div class="card">
          <h3>History</h3>
          <label>Search</label><input id="log-search" value="${search}">
          <ul class="muted">${filtered.map(l=>`<li><strong>${l.date}</strong> - Calls ${l.metrics.callsMade}, Emails ${l.metrics.emailsSent}</li>`).join('') || '<li>None</li>'}</ul>
        </div>
      </div>
      <div class="card">
        <h3>Weekly summary (7d)</h3>
        ${this.weeklySummary()}
      </div>`;
    document.getElementById('log-search').oninput = e=>{this.logSearch=e.target.value; this.renderLog();};
    this.bindLogForm();
  }

  logForm() {
    const todayLog = this.store.state.logs.find(l=>l.date===utils.today());
    return `
      <h3>${todayLog?'Edit':'Add'} log (${utils.today()})</h3>
      <div class="input-row">
        <div><label>Top priorities</label><input id="log-pri" value="${(todayLog?.topPriorities||[]).join(', ')}"></div>
        <div><label>Wins</label><input id="log-wins" value="${(todayLog?.wins||[]).join(', ')}"></div>
        <div><label>Blockers</label><input id="log-block" value="${(todayLog?.blockers||[]).join(', ')}"></div>
        <div><label>Calls</label><input type="number" id="log-calls" value="${todayLog?.metrics.callsMade||0}"></div>
        <div><label>Emails</label><input type="number" id="log-emails" value="${todayLog?.metrics.emailsSent||0}"></div>
        <div><label>Meetings</label><input type="number" id="log-meet" value="${todayLog?.metrics.meetings||0}"></div>
        <div><label>Revenue Today</label><input type="number" id="log-rev" value="${todayLog?.metrics.revenueToday||0}"></div>
        <div><label>Expenses Today</label><input type="number" id="log-exp" value="${todayLog?.metrics.expensesToday||0}"></div>
        <div style="grid-column:1/-1"><label>Notes</label><textarea id="log-notes">${todayLog?.notes||''}</textarea></div>
      </div>
      <button id="log-save">Save log</button>
    `;
  }
  bindLogForm() {
    document.getElementById('log-save').onclick = ()=>{
      const entry = {
        logId: this.store.state.logs.find(l=>l.date===utils.today())?.logId || utils.uuid(),
        date: utils.today(),
        topPriorities: (document.getElementById('log-pri').value||'').split(',').map(s=>s.trim()).filter(Boolean),
        wins: (document.getElementById('log-wins').value||'').split(',').map(s=>s.trim()).filter(Boolean),
        blockers: (document.getElementById('log-block').value||'').split(',').map(s=>s.trim()).filter(Boolean),
        metrics: {
          callsMade: Number(document.getElementById('log-calls').value)||0,
          emailsSent: Number(document.getElementById('log-emails').value)||0,
          meetings: Number(document.getElementById('log-meet').value)||0,
          revenueToday: Number(document.getElementById('log-rev').value)||0,
          expensesToday: Number(document.getElementById('log-exp').value)||0,
        },
        notes: document.getElementById('log-notes').value
      };
      const idx = this.store.state.logs.findIndex(l=>l.date===utils.today());
      if (idx>=0) this.store.state.logs[idx]=entry; else this.store.state.logs.push(entry);
      this.store.persist();
      this.renderAll();
      utils.showToast('Log saved');
    };
  }

  weeklySummary() {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate()-7);
    const logs = this.store.state.logs.filter(l=>new Date(l.date)>=cutoff);
    const totals = logs.reduce((acc,l)=>{
      acc.calls += l.metrics.callsMade; acc.emails += l.metrics.emailsSent; acc.meetings += l.metrics.meetings; acc.rev += l.metrics.revenueToday; acc.exp += l.metrics.expensesToday; return acc;
    }, {calls:0, emails:0, meetings:0, rev:0, exp:0});
    return `<div class="grid grid-3"><div><div class="muted">Calls</div><div class="value">${totals.calls}</div></div><div><div class="muted">Emails</div><div class="value">${totals.emails}</div></div><div><div class="muted">Meetings</div><div class="value">${totals.meetings}</div></div><div><div class="muted">Revenue</div><div class="value">${utils.formatMoney(totals.rev)}</div></div><div><div class="muted">Expenses</div><div class="value">${utils.formatMoney(totals.exp)}</div></div></div>`;
  }

  renderSettings() {
    const area = document.getElementById('view-settings');
    area.innerHTML = `
      <div class="grid grid-2">
        <div class="card">
          <h3>Backup</h3>
          <button id="export-json">Export JSON</button>
          <div style="margin-top:10px"><label>Import</label><input type="file" id="import-file" accept="application/json"></div>
          <div class="flex" style="margin-top:10px"><button id="import-merge">Merge</button><button id="import-replace">Replace</button></div>
          <p class="muted">Supports offline backup/restore.</p>
        </div>
        <div class="card">
          <h3>Reset</h3>
          <p class="muted">Restore demo data. This overwrites current data.</p>
          <button id="reset-demo">Reset demo data</button>
        </div>
      </div>`;
    document.getElementById('export-json').onclick = ()=>{
      const data = JSON.stringify(this.store.state, null, 2);
      const blob = new Blob([data], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'agency-os-backup.json';
      a.click();
      utils.showToast('Exported');
    };
    const fileInput = document.getElementById('import-file');
    document.getElementById('import-merge').onclick = ()=>this.importData(fileInput.files?.[0], false);
    document.getElementById('import-replace').onclick = ()=>this.importData(fileInput.files?.[0], true);
    document.getElementById('reset-demo').onclick = ()=>{ this.store.resetDemo(); this.renderAll(); utils.showToast('Demo reset'); };
  }

  importData(file, replace) {
    if (!file) return utils.showToast('Select file');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (replace) {
          this.store.state = data;
        } else {
          this.store.state = {
            companies: [...this.store.state.companies, ...(data.companies||[])],
            outreach: [...this.store.state.outreach, ...(data.outreach||[])],
            transactions: [...this.store.state.transactions, ...(data.transactions||[])],
            logs: [...this.store.state.logs, ...(data.logs||[])]
          };
        }
        this.store.persist();
        this.renderAll();
        utils.showToast('Import successful');
      } catch (e) { utils.showToast('Import failed'); }
    };
    reader.readAsText(file);
  }

  quickTx() {
    const amount = prompt('Amount (+Income)');
    if (!amount || !(Number(amount)>0)) return;
    this.store.state.transactions.push({ txId: utils.uuid(), date: utils.today(), type:'Income', amount:Number(amount), category:'Quick', companyId:null, description:'Quick add', recurring:false });
    this.store.persist();
    this.renderAll();
    utils.showToast('Quick transaction added');
  }
  quickTouch() {
    if (!this.store.state.companies.length) return utils.showToast('Add company first');
    const companyId = this.store.state.companies[0].companyId;
    this.store.state.outreach.push({ outreachId: utils.uuid(), companyId, channel:'Call', templateName:'Quick', subject:'Quick touch', sentAt:new Date().toISOString(), outcome:'No reply', nextFollowUpAt:new Date(Date.now()+86400000).toISOString(), followUpCount:1, notes:'' });
    this.store.persist();
    this.renderAll();
    utils.showToast('Quick touchpoint added');
  }
}

(async function init(){
  const storage = new StorageService();
  await storage.init();
  const store = new DataStore(storage);
  await store.init();
  new UI(store);
})();
