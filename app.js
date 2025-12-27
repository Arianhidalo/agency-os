// Modules: utils/, store/, views/, ui/
const utils = {
  uuid: () => crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(16).slice(2),
  today: () => new Date().toISOString().slice(0,10),
  monthKey: (d) => d.slice(0,7),
  parseDate: (s) => isNaN(new Date(s)) ? null : new Date(s),
  formatMoney: (v) => '$' + (Number(v)||0).toLocaleString('en-US', {minimumFractionDigits:0, maximumFractionDigits:0}),
  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show';
    setTimeout(()=> t.className = 'toast', 2200);
  },
  confirm(message, onConfirm) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal">
          <h3>Confirm</h3>
          <p>${message}</p>
          <div class="flex" style="justify-content:flex-end">
            <button class="btn ghost" id="confirm-cancel">Cancel</button>
            <button class="btn danger" id="confirm-ok">Delete</button>
          </div>
        </div>
      </div>`;
    document.getElementById('confirm-cancel').onclick = ()=> root.innerHTML = '';
    document.getElementById('confirm-ok').onclick = ()=>{ root.innerHTML=''; onConfirm(); };
  },
  modal(title, bodyHTML) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `
      <div class="modal-backdrop" role="dialog" aria-modal="true">
        <div class="modal">
          <div class="flex" style="justify-content:space-between;align-items:center">
            <h3>${title}</h3>
            <button class="icon-button" id="modal-close">✕</button>
          </div>
          ${bodyHTML}
        </div>
      </div>`;
    document.getElementById('modal-close').onclick = ()=> root.innerHTML='';
  },
  closeModal(){ document.getElementById('modal-root').innerHTML=''; }
};

class StorageService {
  constructor(){ this.useLocal=false; this.db=null; }
  async init(){
    try { await this.initIndexedDB(); } catch(e){ console.warn('IndexedDB failed', e); this.useLocal=true; }
  }
  initIndexedDB(){
    return new Promise((resolve,reject)=>{
      if(!('indexedDB' in window)) return reject('no idb');
      const open = indexedDB.open('agencyOS',1);
      open.onupgradeneeded = ()=>{ open.result.createObjectStore('state'); };
      open.onerror = ()=> reject(open.error);
      open.onsuccess = ()=>{ this.db=open.result; resolve(); };
    });
  }
  async saveState(state){
    if(this.useLocal){ localStorage.setItem('agencyState', JSON.stringify(state)); return; }
    return new Promise((resolve,reject)=>{
      const tx = this.db.transaction('state','readwrite');
      tx.objectStore('state').put(state,'main');
      tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
    });
  }
  async loadState(){
    if(this.useLocal){
      const raw=localStorage.getItem('agencyState');
      if(!raw) return null;
      try { return JSON.parse(raw); } catch(e){ console.warn('Failed to parse localStorage state', e); return null; }
    }
    return new Promise((resolve,reject)=>{
      const tx=this.db.transaction('state','readonly');
      const req=tx.objectStore('state').get('main');
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error);
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
  constructor(store){
    this.store=store;
    this.currentView='dashboard';
    this.range='thisMonth';
    this.renderAll();
    this.bindNav();
    this.bindTopbar();
  }
  bindNav(){
    document.querySelectorAll('.nav-link').forEach(btn=>btn.addEventListener('click',()=>{
      this.switchView(btn.dataset.view);
    }));
    document.getElementById('open-sidebar').onclick=()=>document.querySelector('.sidebar').classList.add('open');
    document.getElementById('close-sidebar').onclick=()=>document.querySelector('.sidebar').classList.remove('open');
  }
  bindTopbar(){
    document.getElementById('quick-add').onclick=()=>this.quickAddModal();
    document.getElementById('global-search').oninput=(e)=>this.globalSearch(e.target.value);
    document.addEventListener('click',(e)=>{
      if(!document.getElementById('search-results').contains(e.target) && e.target.id!=='global-search') document.getElementById('search-results').classList.remove('active');
    });
  }
  switchView(view){
    this.currentView=view;
    document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
    document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
    document.getElementById(`view-${view}`).classList.remove('hidden');
    document.getElementById('breadcrumbs').textContent={dashboard:'Dashboard',crm:'CRM / Outreach',finance:'Finance',log:'CEO Daily Log',settings:'Settings / Backup'}[view];
    document.querySelector('.sidebar').classList.remove('open');
    this.renderAll();
  }
  renderAll(){
    this.renderDashboard();
    this.renderCRM();
    this.renderFinance();
    this.renderLog();
    this.renderSettings();
  }

  // DASHBOARD
  dateMatch(dateStr){
    const date=new Date(dateStr);
    const now=new Date();
    if(this.range==='thisMonth'){ return utils.monthKey(dateStr)===utils.today().slice(0,7); }
    if(this.range==='lastMonth'){
      const d=new Date(now.getFullYear(), now.getMonth()-1, 1); return utils.monthKey(dateStr)===`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    }
    if(this.range==='ytd'){ return date.getFullYear()===now.getFullYear(); }
    return true; // custom not implemented
  }
  renderDashboard(){
    const area=document.getElementById('view-dashboard');
    const tx=this.store.state.transactions.filter(t=>this.dateMatch(t.date));
    const income=tx.filter(t=>t.type==='Income').reduce((s,t)=>s+Number(t.amount),0);
    const expenses=tx.filter(t=>t.type==='Expense').reduce((s,t)=>s+Number(t.amount),0);
    const profit=income-expenses;
    const cashflow=this.store.state.transactions.reduce((s,t)=>s+(t.type==='Income'?t.amount:-t.amount),0);
    const pipeline=this.pipelineTotals();
    const followups=this.upcomingFollowups().slice(0,8);
    const today=this.todayMetrics();
    area.innerHTML=`
      <div class="flex" style="justify-content:space-between">
        <div class="section-title">KPI Range</div>
        <div class="flex" style="justify-content:flex-end">
          ${['thisMonth','lastMonth','ytd','all'].map(r=>`<button class="btn ${this.range===r?'primary':'ghost'}" data-range="${r}">${{thisMonth:'This month',lastMonth:'Last month',ytd:'YTD',all:'All'}[r]}</button>`).join('')}
        </div>
      </div>
      <div class="grid grid-4">
        ${['Income','Expenses','Profit','Cashflow'].map((k,i)=>{
          const val=[income,expenses,profit,cashflow][i];
          return `<div class="card kpi"><div class="muted">${k}</div><div class="value">${utils.formatMoney(val)}</div></div>`;
        }).join('')}
      </div>
      <div class="grid grid-2">
        <div class="card">
          <h3>Pipeline</h3>
          <div class="card-sub">Value by status</div>
          ${Object.entries(pipeline).map(([s,v])=>`<div class="flex" style="justify-content:space-between"><span>${s}</span><strong>${utils.formatMoney(v.value)}</strong><span class="muted">${v.count} deals</span></div>`).join('')}
          <div class="grid grid-4" style="margin-top:var(--space-2)">
            ${Object.entries(pipeline).map(([s,v])=>`<div class="badge">${s}: ${v.count}</div>`).join('')}
          </div>
        </div>
        <div class="card">
          <h3>Kanban preview</h3>
          <div class="grid grid-4">
            ${Object.entries(pipeline).map(([s,v])=>`<div><div class="muted">${s}</div><div class="value">${v.count}</div><div class="muted">${utils.formatMoney(v.value)}</div></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="grid grid-2">
        <div class="card">
          <h3>Upcoming follow-ups</h3>
          <ul class="muted" style="padding-left:16px; margin:0;">
            ${followups.map(u=>`<li><strong>${u.company}</strong> - ${new Date(u.next).toLocaleString()} (${u.outcome})</li>`).join('') || '<li class="empty">No follow-ups pending</li>'}
          </ul>
        </div>
        <div class="card">
          <h3>Today</h3>
          ${today?`<div class="grid grid-2"><div><div class="muted">Calls</div><div class="value">${today.metrics.callsMade}</div></div><div><div class="muted">Emails</div><div class="value">${today.metrics.emailsSent}</div></div><div><div class="muted">Meetings</div><div class="value">${today.metrics.meetings}</div></div><div><div class="muted">Rev</div><div class="value">${utils.formatMoney(today.metrics.revenueToday)}</div></div></div><p class="muted">Notes: ${today.notes||'—'}</p>`:'<p class="empty">No log yet. Quick add one.</p>'}
        </div>
      </div>`;
    area.querySelectorAll('[data-range]').forEach(b=>b.onclick=()=>{this.range=b.dataset.range; this.store.state.ui.range=this.range; this.store.persist(); this.renderDashboard(); this.renderFinance();});
  }
  pipelineTotals(){
    const map={};
    this.store.state.companies.forEach(c=>{ if(!map[c.status]) map[c.status]={value:0,count:0}; map[c.status].value+=(Number(c.dealValue)||0); map[c.status].count++; });
    return map;
  }
  upcomingFollowups(){
    return this.store.state.outreach.filter(o=>o.nextFollowUpAt).sort((a,b)=> new Date(a.nextFollowUpAt)-new Date(b.nextFollowUpAt)).map(o=>({company:this.store.state.companies.find(c=>c.companyId===o.companyId)?.companyName||'Unknown', next:o.nextFollowUpAt, outcome:o.outcome}));
  }
  todayMetrics(){ return this.store.state.logs.find(l=>l.date===utils.today()); }

  // CRM / Outreach
  renderCRM(){
    const area=document.getElementById('view-crm');
    const statuses=['Lead','Contacted','Replied','Meeting Set','Proposal','Won','Lost'];
    const search=this.searchTerm||'';
    const statusFilter=this.statusFilter||'';
    const nicheFilter=this.nicheFilter||'';
    const cityFilter=this.cityFilter||'';
    const tagFilter=this.tagFilter||'';
    const dueOnly=this.dueOnly||false;
    const filtered=this.store.state.companies.filter(c=>{
      const matchesSearch = c.companyName.toLowerCase().includes(search) || (c.notes||'').toLowerCase().includes(search);
      const matchesStatus=!statusFilter||c.status===statusFilter;
      const matchesNiche=!nicheFilter||c.niche===nicheFilter;
      const matchesCity=!cityFilter||c.location.includes(cityFilter);
      const matchesTag=!tagFilter||(c.tags||[]).includes(tagFilter);
      const dueOk=!dueOnly|| this.store.state.outreach.some(o=>o.companyId===c.companyId && new Date(o.nextFollowUpAt)<=new Date());
      return matchesSearch && matchesStatus && matchesNiche && matchesCity && matchesTag && dueOk;
    });
    area.innerHTML=`
      <div class="card">
        <div class="section-title">Companies</div>
        <div class="filter-row">
          <div><label>Search</label><input id="company-search" value="${search}" placeholder="Name or notes"></div>
          <div><label>Status</label><select id="company-status-filter"><option value="">Any</option>${statuses.map(s=>`<option ${statusFilter===s?'selected':''}>${s}</option>`).join('')}</select></div>
          <div><label>Niche</label><input id="company-niche-filter" value="${nicheFilter}"></div>
          <div><label>City</label><input id="company-city-filter" value="${cityFilter}"></div>
          <div><label>Tag</label><input id="company-tag-filter" value="${tagFilter}" placeholder="priority"></div>
          <div class="flex"><label>Due</label><input type="checkbox" id="company-due" ${dueOnly?'checked':''}></div>
        </div>
        <div class="table-wrapper">
        <table class="table" style="margin-top:10px">
          <thead><tr><th>Name</th><th>Status</th><th>Niche</th><th>Location</th><th>Deal</th><th>Actions</th></tr></thead>
          <tbody>
            ${filtered.map(c=>`<tr data-id="${c.companyId}"><td>${c.companyName}</td><td>${c.status}</td><td>${c.niche}</td><td>${c.location}</td><td>${utils.formatMoney(c.dealValue||0)}</td><td class="actions"><button class="btn ghost" data-act="view">View</button><button class="btn ghost" data-act="edit">Edit</button><button class="btn ghost" data-act="touch">Log touchpoint</button><button class="btn danger" data-act="del">Delete</button></td></tr>`).join('') || '<tr><td colspan="6" class="empty">No companies — add one.</td></tr>'}
          </tbody>
        </table></div>
      </div>
      <div class="grid grid-2">
        <div class="card" id="company-detail">${this.companyDetailHTML(filtered[0]||null)}</div>
        <div class="card">${this.companyForm()}</div>
      </div>
      <div class="card">
        <div class="flex" style="justify-content:space-between;align-items:center"><h3>Kanban</h3><label class="flex" style="gap:6px"><span class="muted">Show</span><input type="checkbox" id="kanban-toggle" ${this.kanbanOn?'checked':''}></label></div>
        ${this.kanbanOn?this.kanbanHTML(statuses):'<p class="muted">Enable to view board.</p>'}
      </div>`;

    document.getElementById('company-search').oninput=e=>{this.searchTerm=e.target.value.toLowerCase(); this.renderCRM();};
    document.getElementById('company-status-filter').onchange=e=>{this.statusFilter=e.target.value; this.renderCRM();};
    document.getElementById('company-niche-filter').oninput=e=>{this.nicheFilter=e.target.value; this.renderCRM();};
    document.getElementById('company-city-filter').oninput=e=>{this.cityFilter=e.target.value; this.renderCRM();};
    document.getElementById('company-tag-filter').oninput=e=>{this.tagFilter=e.target.value; this.renderCRM();};
    document.getElementById('company-due').onchange=e=>{this.dueOnly=e.target.checked; this.renderCRM();};
    const detail=document.getElementById('company-detail');
    detail.dataset.id = (filtered[0]||{}).companyId || '';
    area.querySelectorAll('tbody tr').forEach(row=>{
      const id=row.dataset.id; const c=this.store.state.companies.find(x=>x.companyId===id);
      row.querySelector('[data-act="view"]').onclick=()=> { detail.innerHTML=this.companyDetailHTML(c); detail.dataset.id=id; };
      row.querySelector('[data-act="edit"]').onclick=()=> this.companyEditModal(c);
      row.querySelector('[data-act="touch"]').onclick=()=> this.touchpointModal(c.companyId);
      row.querySelector('[data-act="del"]').onclick=()=> utils.confirm('Delete company?', ()=>{ this.store.state.companies=this.store.state.companies.filter(x=>x.companyId!==id); this.store.persist(); this.renderAll(); utils.toast('Company deleted'); });
    });
    const detailTouch=detail.querySelector('#detail-touch'); if(detailTouch){ detailTouch.onclick=()=> this.touchpointModal(detail.dataset?.id||filtered[0]?.companyId); }
    this.bindCompanyForm();
    document.getElementById('kanban-toggle').onchange=e=>{this.kanbanOn=e.target.checked; this.renderCRM();};
    document.querySelectorAll('[data-move-select]').forEach(sel=> sel.onchange=()=>{ const id=sel.dataset.moveSelect; const company=this.store.state.companies.find(c=>c.companyId===id); company.status=sel.value; this.store.persist(); this.renderCRM(); });
  }
  companyDetailHTML(c){
    if(!c) return '<p class="empty">Select a company.</p>';
    const outreach=this.store.state.outreach.filter(o=>o.companyId===c.companyId).sort((a,b)=>new Date(b.sentAt)-new Date(a.sentAt));
    return `<h3>${c.companyName}</h3>
      <div class="muted">${c.niche} • ${c.location}</div>
      <div class="badge">${c.status}</div> <div class="badge">${c.nextAction||'No next action'}</div>
      <p>Email: ${c.primaryEmail||'—'} | Phone: ${c.phone||'—'}</p>
      <p>Deal: ${utils.formatMoney(c.dealValue||0)}</p>
      <p>Tags: ${(c.tags||[]).map(t=>`<span class="badge">${t}</span>`).join(' ')||'—'}</p>
      <p>Notes: ${c.notes||'—'}</p>
      <div class="flex" style="justify-content:flex-end"><button class="btn ghost" id="detail-touch">Add touchpoint</button></div>
      <div class="timeline">${outreach.map(o=>`<div class="timeline-item"><strong>${o.channel}</strong> ${new Date(o.sentAt).toLocaleString()} - ${o.outcome}<br><span class="muted">${o.subject||''}</span></div>`).join('')||'<p class="empty">No touchpoints yet.</p>'}</div>`;
  }
  companyForm(prefix=''){
    const pre=id=>`${prefix}${id}`;
    return `<div id="${pre('company-form')}"><h3>Create company</h3>
      <div class="filter-row">
        <div><label>Name</label><input id="${pre('c-name')}"></div>
        <div><label>Niche</label><input id="${pre('c-niche')}"></div>
        <div><label>Location</label><input id="${pre('c-loc')}" placeholder="City, State"></div>
        <div><label>Status</label><select id="${pre('c-status')}"><option>Lead</option><option>Contacted</option><option>Replied</option><option>Meeting Set</option><option>Proposal</option><option>Won</option><option>Lost</option></select></div>
        <div><label>Deal Value</label><input id="${pre('c-deal')}" type="number" min="0"></div>
        <div><label>Website</label><input id="${pre('c-web')}"></div>
        <div><label>Primary Email</label><input id="${pre('c-email')}"></div>
        <div><label>Phone</label><input id="${pre('c-phone')}"></div>
        <div><label>Owner</label><input id="${pre('c-owner')}"></div>
        <div><label>Tags (comma)</label><input id="${pre('c-tags')}"></div>
        <div><label>Next Action</label><input id="${pre('c-next')}"></div>
        <div style="grid-column:1/-1"><label>Notes</label><textarea id="${pre('c-notes')}"></textarea></div>
      </div>
      <button class="btn primary" id="${pre('c-save')}">Save Company</button></div>`;
  }
  bindCompanyForm(prefix=''){
    const pre=id=>`${prefix}${id}`;
    const root=document.getElementById(pre('company-form')); if(!root) return;
    const btn=root.querySelector(`#${pre('c-save')}`); if(!btn) return;
    btn.onclick=()=>{
      const email=root.querySelector(`#${pre('c-email')}`).value;
      if(email && !/^[^@]+@[^@]+\.[^@]+$/.test(email)) return utils.toast('Invalid email');
      const data={
        companyId: utils.uuid(),
        companyName: root.querySelector(`#${pre('c-name')}`).value || 'Unnamed',
        niche: root.querySelector(`#${pre('c-niche')}`).value,
        location: root.querySelector(`#${pre('c-loc')}`).value,
        website: root.querySelector(`#${pre('c-web')}`).value,
        primaryEmail: email,
        phone: root.querySelector(`#${pre('c-phone')}`).value,
        ownerName: root.querySelector(`#${pre('c-owner')}`).value,
        status: root.querySelector(`#${pre('c-status')}`).value,
        dealValue: Number(root.querySelector(`#${pre('c-deal')}`).value)||0,
        notes: root.querySelector(`#${pre('c-notes')}`).value,
        tags: (root.querySelector(`#${pre('c-tags')}`).value||'').split(',').map(t=>t.trim()).filter(Boolean),
        nextAction: root.querySelector(`#${pre('c-next')}`).value,
        createdAt: Date.now(), updatedAt: Date.now()
      };
      this.store.state.companies.push(data); this.store.persist(); this.renderAll(); utils.toast('Company saved');
    };
  }
  companyEditModal(c){
    utils.modal('Edit company', `<div class="filter-row">
      <div><label>Name</label><input id="ec-name" value="${c.companyName}"></div>
      <div><label>Status</label><select id="ec-status">${['Lead','Contacted','Replied','Meeting Set','Proposal','Won','Lost'].map(s=>`<option ${c.status===s?'selected':''}>${s}</option>`).join('')}</select></div>
      <div><label>Deal</label><input type="number" id="ec-deal" value="${c.dealValue||0}"></div>
      <div><label>Next action</label><input id="ec-next" value="${c.nextAction||''}"></div>
      <div style="grid-column:1/-1"><label>Notes</label><textarea id="ec-notes">${c.notes||''}</textarea></div>
      <button class="btn primary" id="ec-save">Save</button>
    </div>`);
    document.getElementById('ec-save').onclick=()=>{
      c.companyName=document.getElementById('ec-name').value; c.status=document.getElementById('ec-status').value; c.dealValue=Number(document.getElementById('ec-deal').value)||0; c.nextAction=document.getElementById('ec-next').value; c.notes=document.getElementById('ec-notes').value; c.updatedAt=Date.now();
      this.store.persist(); utils.closeModal(); this.renderAll(); utils.toast('Company updated');
    };
  }
  touchpointModal(companyId){
    utils.modal('Log touchpoint', `<div class="filter-row">
      <div><label>Company</label><select id="t-company">${this.store.state.companies.map(c=>`<option value="${c.companyId}" ${companyId===c.companyId?'selected':''}>${c.companyName}</option>`).join('')}</select></div>
      <div><label>Date</label><input type="datetime-local" id="t-date" value="${new Date().toISOString().slice(0,16)}"></div>
      <div><label>Subject</label><input id="t-subject"></div>
      <div><label>Outcome</label><select id="t-outcome"><option>No reply</option><option>Reply</option><option>Bounce</option><option>Meeting</option><option>Not interested</option></select></div>
      <div><label>Next Follow-up</label><input type="datetime-local" id="t-next" value="${new Date(Date.now()+86400000).toISOString().slice(0,16)}"></div>
      <button class="btn primary" id="t-save">Add</button>
    </div>`);
    document.getElementById('t-save').onclick=()=>{
      const item={ outreachId: utils.uuid(), companyId: document.getElementById('t-company').value, channel:'Email', templateName:'', subject: document.getElementById('t-subject').value, sentAt: document.getElementById('t-date').value, outcome: document.getElementById('t-outcome').value, nextFollowUpAt: document.getElementById('t-next').value, followUpCount:1, notes:'' };
      this.store.state.outreach.push(item); this.store.persist(); utils.closeModal(); this.renderAll(); utils.toast('Touchpoint logged');
    };
  }
  kanbanHTML(statuses){
    return `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">${statuses.map(s=>`<div class="card"><div class="muted">${s}</div>${this.store.state.companies.filter(c=>c.status===s).map(c=>`<div class="badge" data-move="${c.companyId}">${c.companyName} <select data-move-select="${c.companyId}">${statuses.map(o=>`<option ${o===c.status?'selected':''}>${o}</option>`).join('')}</select></div>`).join('')||'<p class="empty">—</p>'}</div>`).join('')}</div>`;
  }

  // Finance
  renderFinance(){
    const area=document.getElementById('view-finance');
    const prefs=this.store.state.ui.financeFilters||{};
    const month=prefs.month || utils.today().slice(0,7);
    const type=prefs.type||'';
    const cat=prefs.category||'';
    const company=prefs.company||'';
    const filtered=this.store.state.transactions.filter(t=>(!month||t.date.startsWith(month)) && (!type||t.type===type) && (!cat||t.category===cat) && (!company||t.companyId===company));
    area.innerHTML=`
      <div class="card">
        <div class="section-title">Transactions</div>
        <div class="filter-row">
          <div><label>Month</label><input type="month" id="tx-month" value="${month}"></div>
          <div><label>Type</label><select id="tx-type"><option value="">Any</option><option ${type==='Income'?'selected':''}>Income</option><option ${type==='Expense'?'selected':''}>Expense</option></select></div>
          <div><label>Category</label><input id="tx-cat" value="${cat}"></div>
          <div><label>Company</label><select id="tx-company"><option value="">Any</option>${this.store.state.companies.map(c=>`<option value="${c.companyId}" ${company===c.companyId?'selected':''}>${c.companyName}</option>`).join('')}</select></div>
        </div>
        <div class="table-wrapper">
        <table class="table" style="margin-top:10px">
          <thead><tr><th>Date</th><th>Type</th><th>Amount</th><th>Category</th><th>Company</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            ${filtered.map(t=>`<tr data-id="${t.txId}"><td>${t.date}</td><td>${t.type}</td><td>${utils.formatMoney(t.amount)}</td><td>${t.category}</td><td>${this.store.state.companies.find(c=>c.companyId===t.companyId)?.companyName||'-'}</td><td>${t.description}</td><td class="actions"><button class="btn ghost" data-act="del">Delete</button></td></tr>`).join('') || '<tr><td colspan="7" class="empty">No transactions yet — add your first income/expense.</td></tr>'}
          </tbody>
        </table></div>
      </div>
      <div class="grid grid-2">
        <div class="card">${this.txForm()}</div>
        <div class="card">
          <h3>Summaries</h3>
          ${this.financeSummaryTables()}
          <canvas id="finance-chart" height="200"></canvas>
        </div>
      </div>`;
    document.getElementById('tx-month').onchange=e=>{prefs.month=e.target.value; this.persistFilters(prefs);};
    document.getElementById('tx-type').onchange=e=>{prefs.type=e.target.value; this.persistFilters(prefs);};
    document.getElementById('tx-cat').oninput=e=>{prefs.category=e.target.value; this.persistFilters(prefs);};
    document.getElementById('tx-company').onchange=e=>{prefs.company=e.target.value; this.persistFilters(prefs);};
    area.querySelectorAll('tbody tr').forEach(row=>{
      row.querySelector('[data-act="del"]').onclick=()=> utils.confirm('Delete transaction?', ()=>{ this.store.state.transactions=this.store.state.transactions.filter(t=>t.txId!==row.dataset.id); this.store.persist(); this.renderAll(); utils.toast('Transaction removed'); });
    });
    this.bindTxForm();
    this.renderChart();
  }
  persistFilters(prefs){ this.store.state.ui.financeFilters=prefs; this.store.persist(); this.renderFinance(); }
  txForm(prefix=''){
    const pre=id=>`${prefix}${id}`;
    return `<div id="${pre('tx-form')}"><h3>Add transaction</h3>
      <div class="filter-row">
        <div><label>Date</label><input type="date" id="${pre('tx-date')}" value="${utils.today()}"></div>
        <div><label>Type</label><select id="${pre('tx-type-input')}"><option>Income</option><option>Expense</option></select></div>
        <div><label>Amount</label><input type="number" id="${pre('tx-amount')}" min="0"></div>
        <div><label>Category</label><input id="${pre('tx-category')}" placeholder="Revenue-Client"></div>
        <div><label>Company</label><select id="${pre('tx-comp')}"><option value="">None</option>${this.store.state.companies.map(c=>`<option value="${c.companyId}">${c.companyName}</option>`).join('')}</select></div>
        <div><label>Payment Method</label><input id="${pre('tx-method')}"></div>
        <div><label>Recurring</label><select id="${pre('tx-recurring')}"><option value="false">No</option><option value="true">Yes</option></select></div>
        <div><label>Interval</label><select id="${pre('tx-interval')}"><option value="">--</option><option>Monthly</option><option>Annual</option></select></div>
        <div style="grid-column:1/-1"><label>Description</label><textarea id="${pre('tx-desc')}"></textarea></div>
      </div>
      <button class="btn primary" id="${pre('tx-save')}">Save transaction</button></div>`;
  }
  bindTxForm(prefix=''){
    const pre=id=>`${prefix}${id}`;
    const root=document.getElementById(pre('tx-form')); if(!root) return;
    const btn=root.querySelector(`#${pre('tx-save')}`); if(!btn) return;
    btn.onclick=()=>{
      const amount=Number(root.querySelector(`#${pre('tx-amount')}`).value);
      if(!(amount>0)) return utils.toast('Amount must be positive');
      const date=root.querySelector(`#${pre('tx-date')}`).value;
      if(!utils.parseDate(date)) return utils.toast('Invalid date');
      const item={ txId: utils.uuid(), date, type: root.querySelector(`#${pre('tx-type-input')}`).value, amount, category: root.querySelector(`#${pre('tx-category')}`).value, companyId: root.querySelector(`#${pre('tx-comp')}`).value||null, description: root.querySelector(`#${pre('tx-desc')}`).value, paymentMethod: root.querySelector(`#${pre('tx-method')}`).value, recurring: root.querySelector(`#${pre('tx-recurring')}`).value==='true', interval: root.querySelector(`#${pre('tx-interval')}`).value||null };
      this.store.state.transactions.push(item); this.store.persist(); this.renderAll(); utils.toast('Transaction saved');
    };
  }
  financeSummaryTables(){
    const byMonth={};
    this.store.state.transactions.forEach(t=>{ const m=utils.monthKey(t.date); byMonth[m]=byMonth[m]||{Income:0,Expense:0}; byMonth[m][t.type]+=Number(t.amount)||0; });
    const byCompany={};
    this.store.state.transactions.forEach(t=>{ const name=this.store.state.companies.find(c=>c.companyId===t.companyId)?.companyName || 'Unassigned'; byCompany[name]=byCompany[name]||{Income:0,Expense:0}; byCompany[name][t.type]+=Number(t.amount)||0; });
    return `<div class="grid grid-2">
      <div><h4>By month</h4>${Object.entries(byMonth).sort(([a],[b])=>a.localeCompare(b)).map(([m,v])=>`<div class="flex" style="justify-content:space-between"><span>${m}</span><span>${utils.formatMoney(v.Income)} / ${utils.formatMoney(v.Expense)} / ${utils.formatMoney(v.Income-v.Expense)}</span></div>`).join('')}</div>
      <div><h4>By company</h4>${Object.entries(byCompany).map(([m,v])=>`<div class="flex" style="justify-content:space-between"><span>${m}</span><span>${utils.formatMoney(v.Income)} / ${utils.formatMoney(v.Expense)} / ${utils.formatMoney(v.Income-v.Expense)}</span></div>`).join('')}</div>
    </div>`;
  }
  renderChart(){
    const canvas=document.getElementById('finance-chart'); if(!canvas) return; const ctx=canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const months=[...new Set(this.store.state.transactions.map(t=>utils.monthKey(t.date)))].sort().slice(-12);
    const income=months.map(m=>this.store.state.transactions.filter(t=>t.type==='Income' && t.date.startsWith(m)).reduce((s,t)=>s+Number(t.amount),0));
    const expense=months.map(m=>this.store.state.transactions.filter(t=>t.type==='Expense' && t.date.startsWith(m)).reduce((s,t)=>s+Number(t.amount),0));
    const profit=income.map((v,i)=>v-(expense[i]||0));
    const max=Math.max(...income,...expense,...profit,1);
    const w=canvas.width, h=canvas.height-30; const barWidth=w/Math.max(months.length*2,1);
    ctx.strokeStyle='#333'; ctx.lineWidth=1; for(let y=0;y<=4;y++){ const yy=h-(h*(y/4)); ctx.beginPath(); ctx.moveTo(0,yy); ctx.lineTo(w,yy); ctx.stroke(); }
    months.forEach((m,i)=>{
      const x=i*barWidth*2+12; const hInc=(income[i]/max)*(h-20); const hExp=(expense[i]/max)*(h-20);
      ctx.fillStyle='#f5f5f5'; ctx.fillRect(x, h-hInc, barWidth-6, hInc);
      ctx.fillStyle='#777'; ctx.fillRect(x+barWidth/2, h-hExp, barWidth-6, hExp);
      ctx.fillStyle='#888'; ctx.fillText(m, x, h+12);
    });
    ctx.strokeStyle='#e6e6e6'; ctx.beginPath(); profit.forEach((p,i)=>{ const x=i*barWidth*2+barWidth/2; const y=h-((p/max)*(h-20)); if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y); }); ctx.stroke();
  }

  // Logs
  renderLog(){
    const area=document.getElementById('view-log');
    const search=this.logSearch||'';
    const range=this.logRange||'all';
    const logs=this.store.state.logs.filter(l=>JSON.stringify(l).toLowerCase().includes(search.toLowerCase())).filter(l=>{
      if(range==='week'){ return new Date(l.date)>=new Date(Date.now()-7*86400000); }
      if(range==='month'){ return new Date(l.date)>=new Date(Date.now()-30*86400000); }
      return true;
    });
    area.innerHTML=`
      <div class="grid grid-2">
        <div class="card">${this.logForm()}</div>
        <div class="card">
          <h3>History</h3>
          <div class="filter-row">
            <div><label>Search</label><input id="log-search" value="${search}"></div>
            <div><label>Range</label><select id="log-range"><option value="all" ${range==='all'?'selected':''}>All</option><option value="week" ${range==='week'?'selected':''}>Last 7d</option><option value="month" ${range==='month'?'selected':''}>Last 30d</option></select></div>
          </div>
          <ul class="muted">${logs.map(l=>`<li><strong>${l.date}</strong> - Calls ${l.metrics.callsMade}, Emails ${l.metrics.emailsSent}</li>`).join('')||'<li class="empty">No logs yet.</li>'}</ul>
        </div>
      </div>
      <div class="card"><h3>Weekly summary (7d)</h3>${this.weeklySummary()}</div>`;
    document.getElementById('log-search').oninput=e=>{this.logSearch=e.target.value; this.renderLog();};
    document.getElementById('log-range').onchange=e=>{this.logRange=e.target.value; this.renderLog();};
    this.bindLogForm();
  }
  logForm(prefix=''){
    const todayLog=this.store.state.logs.find(l=>l.date===utils.today());
    const pre=id=>`${prefix}${id}`;
    const listField=(id,label,vals)=>`<div><label>${label}</label><div class="flex" id="${pre(id)}">${vals.map((v,i)=>`<span class="badge" data-idx="${i}">${v} ✕</span>`).join('')}</div><div class="flex"><input data-input="${pre(id)}" placeholder="Add item"><button class="btn ghost" data-add="${pre(id)}">Add</button></div></div>`;
    return `<div id="${pre('log-form')}"><h3>${todayLog?'Edit':'Add'} log (${utils.today()})</h3>
      <div class="filter-row">
        ${listField('pri','Top priorities', todayLog?.topPriorities||[])}
        ${listField('wins','Wins', todayLog?.wins||[])}
        ${listField('block','Blockers', todayLog?.blockers||[])}
        <div><label>Calls</label><input type="number" id="${pre('log-calls')}" value="${todayLog?.metrics.callsMade||0}"></div>
        <div><label>Emails</label><input type="number" id="${pre('log-emails')}" value="${todayLog?.metrics.emailsSent||0}"></div>
        <div><label>Meetings</label><input type="number" id="${pre('log-meet')}" value="${todayLog?.metrics.meetings||0}"></div>
        <div><label>Revenue Today</label><input type="number" id="${pre('log-rev')}" value="${todayLog?.metrics.revenueToday||0}"></div>
        <div><label>Expenses Today</label><input type="number" id="${pre('log-exp')}" value="${todayLog?.metrics.expensesToday||0}"></div>
        <div style="grid-column:1/-1"><label>Notes</label><textarea id="${pre('log-notes')}">${todayLog?.notes||''}</textarea></div>
      </div>
      <button class="btn primary" id="${pre('log-save')}">Save log</button></div>`;
  }
  bindLogForm(prefix=''){
    const pre=id=>`${prefix}${id}`;
    const root=document.getElementById(pre('log-form')); if(!root) return;
    const addItem=(id)=>{
      const input=root.querySelector(`[data-input="${id}"]`); if(!input||!input.value) return;
      const badge=document.createElement('span'); badge.className='badge'; badge.textContent=input.value+' ✕'; badge.onclick=()=>badge.remove();
      const holder=root.querySelector(`#${id}`); if(holder) holder.appendChild(badge);
      input.value='';
    };
    root.querySelectorAll('[data-add]').forEach(btn=>btn.onclick=()=>addItem(btn.dataset.add));
    root.querySelectorAll('.badge').forEach(b=> b.onclick=()=>b.remove());
    const getVal=id=>Number(root.querySelector(`#${pre(id)}`)?.value)||0;
    const collect=id=>Array.from(root.querySelectorAll(`#${id} .badge`)).map(b=>b.textContent.replace(' ✕',''));
    const saveBtn=root.querySelector(`#${pre('log-save')}`);
    if(saveBtn) saveBtn.onclick=()=>{
      const entry={ logId: this.store.state.logs.find(l=>l.date===utils.today())?.logId||utils.uuid(), date: utils.today(), topPriorities: collect(pre('pri')), wins: collect(pre('wins')), blockers: collect(pre('block')), metrics:{ callsMade:getVal('log-calls'), emailsSent:getVal('log-emails'), meetings:getVal('log-meet'), revenueToday:getVal('log-rev'), expensesToday:getVal('log-exp') }, notes: root.querySelector(`#${pre('log-notes')}`)?.value||'' };
      const idx=this.store.state.logs.findIndex(l=>l.date===utils.today()); if(idx>=0) this.store.state.logs[idx]=entry; else this.store.state.logs.push(entry); this.store.persist(); this.renderAll(); utils.toast('Log saved');
    };
  }
  weeklySummary(){
    const cutoff=new Date(Date.now()-7*86400000);
    const logs=this.store.state.logs.filter(l=>new Date(l.date)>=cutoff);
    const totals=logs.reduce((a,l)=>{a.calls+=l.metrics.callsMade; a.emails+=l.metrics.emailsSent; a.meetings+=l.metrics.meetings; a.rev+=l.metrics.revenueToday; a.exp+=l.metrics.expensesToday; return a;},{calls:0,emails:0,meetings:0,rev:0,exp:0});
    return `<div class="grid grid-3"><div><div class="muted">Calls</div><div class="value">${totals.calls}</div></div><div><div class="muted">Emails</div><div class="value">${totals.emails}</div></div><div><div class="muted">Meetings</div><div class="value">${totals.meetings}</div></div><div><div class="muted">Revenue</div><div class="value">${utils.formatMoney(totals.rev)}</div></div><div><div class="muted">Expenses</div><div class="value">${utils.formatMoney(totals.exp)}</div></div></div>`;
  }

  // Settings
  renderSettings(){
    const area=document.getElementById('view-settings');
    area.innerHTML=`
      <div class="card">
        <h3>Backup</h3>
        <div class="flex" style="flex-wrap:wrap;gap:var(--space-2)"><button class="btn primary" id="export-json">Export JSON</button>
        <input type="file" id="import-file" accept="application/json">
        <button class="btn ghost" id="import-merge">Import (Merge)</button><button class="btn ghost" id="import-replace">Import (Replace)</button></div>
        <p class="muted">Sensitive data stored locally.</p>
      </div>
      <div class="card">
        <h3>Reset</h3>
        <p class="muted">Restore demo data. This overwrites current data.</p>
        <button class="btn danger" id="reset-demo">Reset demo data</button>
      </div>`;
    document.getElementById('export-json').onclick=()=>{
      const data=JSON.stringify(this.store.state,null,2);
      const blob=new Blob([data],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='agency-os-backup.json'; a.click(); utils.toast('Exported');
    };
    const file=document.getElementById('import-file');
    document.getElementById('import-merge').onclick=()=>this.importData(file.files?.[0], false);
    document.getElementById('import-replace').onclick=()=>this.importData(file.files?.[0], true);
    document.getElementById('reset-demo').onclick=()=>{ this.store.resetDemo(); this.renderAll(); utils.toast('Demo reset'); };
  }
  importData(file, replace){
    if(!file) return utils.toast('Select file');
    const reader=new FileReader();
    reader.onload=()=>{
      try{ const data=JSON.parse(reader.result); if(replace){ this.store.state=this.store.normalizeState(data); } else {
        const incoming=this.store.normalizeState(data);
        this.store.state={ companies:[...this.store.state.companies,...incoming.companies], outreach:[...this.store.state.outreach,...incoming.outreach], transactions:[...this.store.state.transactions,...incoming.transactions], logs:[...this.store.state.logs,...incoming.logs], ui:this.store.state.ui };
      } this.store.persist(); this.renderAll(); utils.toast('Import successful'); } catch(e){ utils.toast('Import failed'); }
    };
    reader.readAsText(file);
  }

  // Global search & quick add
  globalSearch(term){
    const box=document.getElementById('search-results');
    if(!term){ box.classList.remove('active'); box.innerHTML=''; return; }
    const lower=term.toLowerCase();
    const matches=[
      ...this.store.state.companies.filter(c=>c.companyName.toLowerCase().includes(lower)).map(c=>({label:`Company: ${c.companyName}`, action:()=>{this.switchView('crm'); document.getElementById('company-detail').innerHTML=this.companyDetailHTML(c);} })),
      ...this.store.state.transactions.filter(t=>t.description.toLowerCase().includes(lower)).map(t=>({label:`Transaction: ${t.description}`, action:()=>this.switchView('finance')})),
      ...this.store.state.outreach.filter(o=>(o.subject||'').toLowerCase().includes(lower)).map(o=>({label:`Outreach: ${(o.subject||'email')}`, action:()=>this.switchView('crm')})),
      ...this.store.state.logs.filter(l=>(l.notes||'').toLowerCase().includes(lower)).map(l=>({label:`Log: ${l.date}`, action:()=>this.switchView('log')}))
    ].slice(0,6);
    box.innerHTML=matches.map(m=>`<div>${m.label}</div>`).join('');
    box.classList.toggle('active', matches.length>0);
    box.querySelectorAll('div').forEach((div,i)=> div.onclick=()=>{ matches[i].action(); box.classList.remove('active'); });
  }
  quickAddModal(){
    const tabs=['Transaction','Touchpoint','Company','Daily log'];
    const content=(tab)=>{
      if(tab==='Transaction') return this.txForm('q-');
      if(tab==='Touchpoint') return `<div class="filter-row"><div><label>Company</label><select id="qt-company">${this.store.state.companies.map(c=>`<option value="${c.companyId}">${c.companyName}</option>`).join('')}</select></div><div><label>Subject</label><input id="qt-sub"></div><div><label>Outcome</label><select id="qt-outcome"><option>No reply</option><option>Reply</option><option>Meeting</option><option>Bounce</option><option>Not interested</option></select></div><div><label>Next follow-up</label><input type="datetime-local" id="qt-next" value="${new Date(Date.now()+86400000).toISOString().slice(0,16)}"></div><button class="btn primary" id="qt-save">Save</button></div>`;
      if(tab==='Company') return this.companyForm('q-');
      return this.logForm('q-');
    };
    let active=tabs[0];
    const render=()=>{
      utils.modal('Quick Add', `<div class="tabs">${tabs.map(t=>`<div class="tab ${t===active?'active':''}" data-tab="${t}">${t}</div>`).join('')}</div><div id="quick-body">${content(active)}</div>`);
      document.querySelectorAll('[data-tab]').forEach(el=>el.onclick=()=>{active=el.dataset.tab; render();});
      if(active==='Transaction') this.bindTxForm('q-');
      if(active==='Touchpoint') document.getElementById('qt-save').onclick=()=>{ const item={ outreachId: utils.uuid(), companyId: document.getElementById('qt-company').value, channel:'Call', templateName:'Quick', subject: document.getElementById('qt-sub').value, sentAt:new Date().toISOString(), outcome: document.getElementById('qt-outcome').value, nextFollowUpAt: document.getElementById('qt-next').value, followUpCount:1, notes:'' }; this.store.state.outreach.push(item); this.store.persist(); utils.closeModal(); this.renderAll(); utils.toast('Touchpoint logged'); };
      if(active==='Company') this.bindCompanyForm('q-');
      if(active==='Daily log') this.bindLogForm('q-');
    };
    render();
  }
}

(async function init(){
  const storage=new StorageService(); await storage.init(); const store=new DataStore(storage); await store.init();
  new UI(store);
})();
