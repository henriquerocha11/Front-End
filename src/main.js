const ICONS = {
  mark: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3v18M4.5 7.5h15M6 7.5 3.5 12h5L6 7.5Zm12 0-2.5 4.5h5L18 7.5ZM8 21h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.7"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="10" r="2.3" stroke="currentColor" stroke-width="1.7"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 21V5l8-3 8 3v16M2 21h20M9 21v-5h6v5M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m14 5 5 5M4 20l4.2-.8L19 8.4a2.1 2.1 0 0 0-3-3L5.2 16.2 4 20Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16m-10 4v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  service: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const DEMO_UNIVERSITIES = [
  { id: 901, nome: 'Universidade do Vale', cidade: 'Vitória da Conquista', ativa: true },
  { id: 902, nome: 'Instituto Horizonte', cidade: 'Jequié', ativa: true },
  { id: 903, nome: 'Centro Universitário do Sertão', cidade: 'Itapetinga', ativa: true },
];
const DEMO_SERVICES = {
  901: [
    { id: 9101, nome: 'Clínica de Psicologia', descricao: 'Acolhimento psicológico realizado por estudantes com supervisão docente.', local: 'Bloco B, sala 14', contato: '(77) 3421-0000', horarios: 'Segunda a sexta, 8h às 17h' },
    { id: 9102, nome: 'Orientação Jurídica', descricao: 'Atendimento inicial e orientação em questões de direito civil e de família.', local: 'Núcleo de Prática Jurídica', contato: 'npj@exemplo.edu.br', horarios: 'Terça e quinta, 14h às 18h' },
    { id: 9103, nome: 'Apoio Nutricional', descricao: 'Avaliação e educação alimentar em atividade de extensão universitária.', local: 'Clínica Escola, sala 3', contato: '(77) 3421-0002', horarios: 'Quarta, 9h às 12h' },
  ],
  902: [{ id: 9201, nome: 'Plantão de Matemática', descricao: 'Monitoria gratuita para estudantes do ensino médio da região.', local: 'Laboratório 2', contato: 'extensao@exemplo.edu.br', horarios: 'Segunda e quarta, 15h às 17h' }],
  903: [{ id: 9301, nome: 'Laboratório de Análises', descricao: 'Serviços laboratoriais e ações educativas para a comunidade.', local: 'Campus central', contato: '(77) 3261-0000', horarios: 'Segunda a sexta, 8h às 16h' }],
};

const state = {
  page: 'home', loading: true, error: '', demo: false, universities: [],
  query: '', city: '', modal: null, adminKey: '', adminConnected: false,
  adminTab: 'universities', adminUniversities: [], adminServices: [], adminError: '',
  apiBase: localStorage.getItem('conecta-api-base') || 'http://localhost:5065',
};
const app = document.querySelector('#app');
const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const initials = name => String(name || 'U').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
const url = path => `${state.apiBase.replace(/\/$/, '')}${path}`;

async function request(path, options = {}, admin = false) {
  const headers = { Accept: 'application/json', ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  if (admin) headers['X-Api-Key'] = state.adminKey;
  let response;
  try { response = await fetch(url(path), { ...options, headers }); }
  catch { throw new Error(`Não foi possível acessar a API em ${state.apiBase}. Confira se o backend está em execução e se a URL está correta.`); }
  if (!response.ok) {
    let message = `A API respondeu com erro (${response.status}).`;
    try { const body = await response.json(); message = body.mensagem || body.title || message; } catch {}
    if (response.status === 401) message = 'Chave de administração ausente ou inválida.';
    if (response.status === 503) message = 'A chave administrativa não está configurada no backend.';
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

function setDemo() {
  state.demo = true; state.error = ''; state.loading = false;
  state.universities = DEMO_UNIVERSITIES;
  render();
}
async function loadPublic() {
  state.loading = true; state.error = ''; state.demo = false; render();
  try { state.universities = await request('/api/universidades'); }
  catch (error) { state.error = error.message; state.universities = []; }
  state.loading = false; render();
}
function toast(message, bad = false) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div'); el.className = `toast${bad ? ' bad' : ''}`; el.setAttribute('role', 'status'); el.textContent = message;
  document.body.append(el); setTimeout(() => el.remove(), 3200);
}

function publicHeader() {
  return `<header class="topbar"><a class="brand" href="#inicio" data-action="home"><span class="brand-mark">${ICONS.mark}</span><span>conecta<em>campus</em></span></a><nav class="nav" aria-label="Navegação principal"><a href="#universidades" data-action="scroll-list">Explorar instituições</a><button class="button secondary" data-action="admin">Área do gestor ${ICONS.arrow}</button></nav></header>`;
}
function universityCard(u) {
  return `<article class="uni-card" data-action="services" data-id="${Number(u.id)}" tabindex="0" role="button" aria-label="Ver serviços de ${esc(u.nome)}"><div class="uni-top"><div class="uni-icon">${esc(initials(u.nome))}</div><span class="arrow">${ICONS.arrow}</span></div><h3>${esc(u.nome)}</h3><div class="location">${ICONS.pin}${esc(u.cidade)}</div><div class="uni-foot"><span class="service-count"><i></i> Catálogo de serviços</span><span>Conhecer ${ICONS.arrow}</span></div></article>`;
}
function homePage() {
  const cities = [...new Set(state.universities.map(u => u.cidade).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'pt-BR'));
  const query = state.query.trim().toLocaleLowerCase('pt-BR');
  const filtered = state.universities.filter(u => (!state.city || u.cidade === state.city) && (!query || `${u.nome} ${u.cidade}`.toLocaleLowerCase('pt-BR').includes(query)));
  let content = '';
  if (state.loading) content = '<div class="loading">Carregando instituições…</div>';
  else if (state.error && !state.demo) content = `<div class="error"><b>Não conseguimos carregar os dados.</b><br>${esc(state.error)}<div style="margin-top:16px;display:flex;gap:9px;justify-content:center;flex-wrap:wrap"><button class="button small" data-action="retry">Tentar novamente</button><button class="button secondary small" data-action="demo">Ver demonstração</button></div><div style="margin-top:12px;font-size:11px">API: ${esc(state.apiBase)} · Configure a URL no rodapé.</div></div>`;
  else if (!filtered.length) content = `<div class="empty">${state.universities.length ? 'Nenhuma instituição combina com essa busca.' : 'Ainda não há universidades ativas cadastradas.'}<br><button class="button text small" data-action="clear-search">Limpar filtros</button></div>`;
  else content = filtered.map(universityCard).join('');
  const number = state.demo ? DEMO_UNIVERSITIES.length : state.universities.length;
  const cityNumber = new Set(state.universities.map(x => x.cidade)).size;
  return `<div class="shell">${publicHeader()}<main><section class="hero" id="inicio"><div><div class="eyebrow">Universidade perto da comunidade</div><h1>Conheça o que a universidade pode <span>fazer por você.</span></h1><p>Encontre serviços, projetos e atendimentos oferecidos pelas instituições da sua região. Informação simples para aproximar comunidade e campus.</p><div class="search-panel">${ICONS.search}<div class="input-wrap"><input id="search" aria-label="Buscar universidade ou cidade" placeholder="Busque por universidade ou cidade" value="${esc(state.query)}" /></div><button class="button" data-action="scroll-list">Explorar ${ICONS.arrow}</button></div><p class="hero-note"><b>Gratuito para consultar.</b> Os serviços são mantidos pelas próprias instituições.</p><div class="stats"><div class="stat"><b>${number || '—'}</b><span>instituições${state.demo ? ' · demo' : ''}</span></div><div class="stat"><b>${cityNumber || '—'}</b><span>cidades atendidas</span></div><div class="stat"><b>+ acesso</b><span>à informação</span></div></div></div><div class="hero-art"><div class="art-label">Conhecimento que chega mais longe</div><div class="art-quote"><div class="quote-icon">${ICONS.building}</div><strong>O campus também é um espaço de cuidado e troca.</strong><small>Encontre apoio e iniciativas na sua cidade.</small></div><div class="art-orbit"></div><div class="float-card"><b>Comunidade + universidade</b>Uma conexão que transforma</div></div></section><section class="section" id="universidades"><div class="section-head"><div><div class="eyebrow">Explore por instituição</div><h2>Onde você quer encontrar apoio?</h2><p style="margin-top:8px">Selecione uma universidade para ver os serviços disponíveis.</p></div><div class="filters"><select id="city-filter" class="filter-select" aria-label="Filtrar por cidade"><option value="">Todas as cidades</option>${cities.map(c => `<option ${c === state.city ? 'selected' : ''} value="${esc(c)}">${esc(c)}</option>`).join('')}</select></div></div>${state.demo ? '<div class="pill demo-pill" style="margin-bottom:15px">Visualização demonstrativa · estes registros são fictícios</div>' : ''}<div class="grid">${content}</div></section></main><footer class="footer"><div class="footer-row"><span>© 2026 Conecta Campus · Projeto de Extensão Universitária</span><span><button class="button text small" data-action="settings">Configurar conexão da API</button></span></div></footer></div>${state.modal ? renderModal() : ''}`;
}

function adminHeader() {
  return `<header class="admin-top"><a class="brand" href="#inicio" data-action="home"><span class="brand-mark">${ICONS.mark}</span><span>conecta<em>campus</em></span></a><div class="admin-connected">${state.adminConnected ? '<i class="green-dot"></i> Conectado à API' : 'Painel de gestão'}<button class="button text small" data-action="home">Voltar ao portal</button></div></header>`;
}
function adminConnect() {
  return `<div class="admin-page"><div class="admin-shell">${adminHeader()}<main class="admin-layout"><aside class="sidebar"><div class="side-title">Painel</div><button class="side-link active">${ICONS.building} Gestão de cadastros</button></aside><section class="admin-main"><div class="eyebrow">Acesso administrativo</div><h1>Área do gestor</h1><p class="sub">Entre com a chave administrativa do backend para gerenciar as instituições e seus serviços.</p><div class="connect-card"><h2>Conectar à API</h2><p>O painel usa a API REST do projeto e a chave definida no servidor. A chave fica somente na memória desta aba e é apagada ao sair.</p>${state.adminError ? `<div class="admin-warning" role="alert">${esc(state.adminError)}</div>` : ''}<form id="connect-form"><div class="field"><label for="api-base">Endereço da API</label><input id="api-base" name="apiBase" type="url" value="${esc(state.apiBase)}" required placeholder="http://localhost:5065" /></div><div class="field"><label for="api-key">Chave administrativa (X-Api-Key)</label><input id="api-key" name="apiKey" type="password" autocomplete="current-password" required placeholder="Digite a chave configurada no servidor" /></div><div class="security-note"><b>Segurança:</b> o backend usa uma chave compartilhada, não contas individuais. Para publicar o painel na internet, mova essa chave para um serviço de autenticação no servidor. Não coloque a chave em arquivo público ou variável VITE_.</div><button class="button" type="submit">Validar chave e entrar ${ICONS.arrow}</button></form></div></section></main></div></div>`;
}
function adminPage() {
  if (!state.adminConnected) return adminConnect();
  const tab = state.adminTab;
  const activeUniversities = state.adminUniversities.filter(x => x.ativa).length;
  const activeServices = state.adminServices.filter(x => x.ativo).length;
  let table = '';
  if (tab === 'universities') {
    table = `<div class="admin-card"><div class="table-head"><h2>Universidades cadastradas</h2><div class="table-actions"><span class="admin-connected"><i class="green-dot"></i> Sincronizado</span><button class="button small" data-action="add-university">+ Nova universidade</button></div></div>${state.adminUniversities.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Instituição</th><th>Cidade</th><th>Status</th><th>Ações</th></tr></thead><tbody>${state.adminUniversities.map(u => `<tr><td><b>${esc(u.nome)}</b><div style="font-size:10px;color:#8c9892;margin-top:3px">ID ${u.id}</div></td><td>${esc(u.cidade)}</td><td><span class="status ${u.ativa ? '' : 'off'}">${u.ativa ? 'Ativa' : 'Inativa'}</span></td><td><div class="actions"><button class="icon-btn" title="Editar" aria-label="Editar ${esc(u.nome)}" data-action="edit-university" data-id="${u.id}">${ICONS.edit}</button><button class="button secondary small" data-action="toggle-university" data-id="${u.id}">${u.ativa ? 'Desativar' : 'Ativar'}</button><button class="icon-btn" title="Excluir" aria-label="Excluir ${esc(u.nome)}" data-action="delete-university" data-id="${u.id}">${ICONS.trash}</button></div></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty-admin">Nenhuma universidade cadastrada ainda.</div>'}</div>`;
  } else {
    const names = Object.fromEntries(state.adminUniversities.map(u => [u.id, u.nome]));
    table = `<div class="admin-card"><div class="table-head"><h2>Serviços cadastrados</h2><div class="table-actions"><select id="admin-university-filter" class="filter-select" aria-label="Filtrar serviços por universidade"><option value="">Todas as instituições</option>${state.adminUniversities.map(u => `<option value="${u.id}">${esc(u.nome)}</option>`).join('')}</select><button class="button small" data-action="add-service">+ Novo serviço</button></div></div>${state.adminServices.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Serviço</th><th>Instituição</th><th>Contato / local</th><th>Status</th><th>Ações</th></tr></thead><tbody>${state.adminServices.map(s => `<tr data-service-row data-university="${s.universidadeId}"><td><b>${esc(s.nome)}</b><div style="font-size:10px;color:#8c9892;margin-top:3px">${esc(s.horarios || 'Horário não informado')}</div></td><td>${esc(names[s.universidadeId] || `Instituição #${s.universidadeId}`)}</td><td>${esc(s.contato || s.local || '—')}</td><td><span class="status ${s.ativo ? '' : 'off'}">${s.ativo ? 'Ativo' : 'Inativo'}</span></td><td><div class="actions"><button class="icon-btn" title="Editar" aria-label="Editar ${esc(s.nome)}" data-action="edit-service" data-id="${s.id}">${ICONS.edit}</button><button class="button secondary small" data-action="toggle-service" data-id="${s.id}">${s.ativo ? 'Desativar' : 'Ativar'}</button><button class="icon-btn" title="Excluir" aria-label="Excluir ${esc(s.nome)}" data-action="delete-service" data-id="${s.id}">${ICONS.trash}</button></div></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty-admin">Nenhum serviço cadastrado ainda.</div>'}</div>`;
  }
  return `<div class="admin-page"><div class="admin-shell">${adminHeader()}<main class="admin-layout"><aside class="sidebar"><div class="side-title">Gerenciar</div><button class="side-link ${tab === 'universities' ? 'active' : ''}" data-action="admin-tab" data-tab="universities">${ICONS.building} Universidades</button><button class="side-link ${tab === 'services' ? 'active' : ''}" data-action="admin-tab" data-tab="services">${ICONS.service} Serviços</button><div class="side-title" style="margin-top:12px">Sessão</div><button class="side-link" data-action="disconnect">Sair da administração</button></aside><section class="admin-main"><div class="eyebrow">Visão geral</div><h1>Gestão de cadastros</h1><p class="sub">Mantenha os dados das instituições e dos serviços comunitários em dia.</p>${state.adminError ? `<div class="admin-warning" role="alert">${esc(state.adminError)}</div>` : ''}<div class="admin-stats"><div class="admin-stat"><span>Instituições cadastradas</span><b>${state.adminUniversities.length}</b></div><div class="admin-stat"><span>Instituições ativas</span><b>${activeUniversities}</b></div><div class="admin-stat"><span>Serviços ativos</span><b>${activeServices}</b></div></div><div class="admin-warning">A área administrativa autentica chamadas com <code>X-Api-Key</code>. A chave permanece apenas na memória desta aba; sair limpa a sessão.</div>${table}</section></main></div></div>${state.modal ? renderModal() : ''}`;
}

function renderModal() {
  const m = state.modal;
  if (m.type === 'services') {
    const u = state.universities.find(x => x.id === m.id);
    let rows = m.loading ? '<div class="loading">Carregando serviços…</div>' : m.error ? `<div class="error">${esc(m.error)}<br><button class="button text small" data-action="reload-services" data-id="${m.id}">Tentar novamente</button></div>` : !m.services.length ? '<div class="empty">Esta instituição ainda não possui serviços ativos publicados.</div>' : m.services.map(s => `<article class="service-card"><h3>${esc(s.nome)}</h3><p>${esc(s.descricao)}</p><div class="service-meta">${s.local ? `<span>${ICONS.pin}${esc(s.local)}</span>` : ''}${s.contato ? `<span>${ICONS.service}${esc(s.contato)}</span>` : ''}${s.horarios ? `<span>◷ ${esc(s.horarios)}</span>` : ''}</div></article>`).join('');
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><div class="eyebrow">${esc(u?.cidade || '')}</div><h2 id="modal-title">${esc(u?.nome || 'Serviços')}</h2><p>Serviços e atendimentos disponíveis para a comunidade</p></div><button class="modal-close" data-action="close-modal" aria-label="Fechar">×</button></div><div class="service-list">${rows}</div></section></div>`;
  }
  const editing = m.type.startsWith('edit-');
  const isUni = m.type.includes('university');
  const item = m.item || {};
  const title = isUni ? (editing ? 'Editar universidade' : 'Nova universidade') : (editing ? 'Editar serviço' : 'Novo serviço');
  const fields = isUni
    ? `<div class="field"><label for="f-name">Nome da instituição</label><input id="f-name" name="nome" required maxlength="150" value="${esc(item.nome || '')}" /></div><div class="field"><label for="f-city">Cidade</label><input id="f-city" name="cidade" required maxlength="100" value="${esc(item.cidade || '')}" /></div>`
    : `<div class="field"><label for="f-university">Universidade</label><select id="f-university" name="universidadeId" required ${editing ? 'disabled' : ''}><option value="">Selecione a instituição</option>${state.adminUniversities.filter(u => u.ativa || u.id === item.universidadeId).map(u => `<option value="${u.id}" ${u.id === item.universidadeId ? 'selected' : ''}>${esc(u.nome)}</option>`).join('')}</select>${editing ? `<input type="hidden" name="universidadeId" value="${item.universidadeId}">` : ''}</div><div class="field"><label for="f-name">Nome do serviço</label><input id="f-name" name="nome" required maxlength="150" value="${esc(item.nome || '')}" /></div><div class="field"><label for="f-description">Descrição</label><textarea id="f-description" name="descricao" required maxlength="1000">${esc(item.descricao || '')}</textarea></div><div class="field"><label for="f-location">Local (informe local ou contato)</label><input id="f-location" name="local" maxlength="200" value="${esc(item.local || '')}" /></div><div class="field"><label for="f-contact">Contato (informe local ou contato)</label><input id="f-contact" name="contato" maxlength="200" value="${esc(item.contato || '')}" /></div><div class="field"><label for="f-hours">Horários</label><input id="f-hours" name="horarios" maxlength="200" value="${esc(item.horarios || '')}" /></div>`;
  return `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><h2 id="modal-title">${title}</h2><p>Preencha os dados abaixo. Campos obrigatórios estão identificados.</p></div><button class="modal-close" data-action="close-modal" aria-label="Fechar">×</button></div><form id="record-form" data-kind="${isUni ? 'university' : 'service'}" data-edit="${editing ? 'true' : 'false'}" data-id="${item.id || ''}">${fields}<div class="modal-foot"><button type="button" class="button secondary" data-action="close-modal">Cancelar</button><button type="submit" class="button">${editing ? 'Salvar alterações' : 'Criar cadastro'}</button></div></form></section></div>`;
}

function render() { app.innerHTML = state.page === 'admin' ? adminPage() : homePage(); }

async function loadAdminData() {
  state.adminError = '';
  try {
    const [universities, services] = await Promise.all([
      request('/api/admin/universidades', {}, true),
      request('/api/admin/servicos', {}, true),
    ]);
    state.adminUniversities = universities; state.adminServices = services;
  } catch (error) { state.adminError = error.message; }
  render();
}
async function showServices(id) {
  state.modal = { type: 'services', id: Number(id), services: [], loading: true, error: '' }; render();
  try {
    const services = state.demo ? DEMO_SERVICES[id] || [] : await request(`/api/universidades/${Number(id)}/servicos`);
    if (state.modal?.id === Number(id)) { state.modal.services = services; state.modal.loading = false; }
  } catch (error) { if (state.modal?.id === Number(id)) { state.modal.loading = false; state.modal.error = error.message; } }
  render();
}
async function connectAdmin(form) {
  const data = new FormData(form); state.apiBase = String(data.get('apiBase')).replace(/\/$/, '');
  localStorage.setItem('conecta-api-base', state.apiBase); state.adminKey = String(data.get('apiKey')); state.adminError = 'Validando chave…'; render();
  try {
    const [universities, services] = await Promise.all([request('/api/admin/universidades', {}, true), request('/api/admin/servicos', {}, true)]);
    state.adminUniversities = universities; state.adminServices = services; state.adminConnected = true; state.adminError = '';
  } catch (error) { state.adminKey = ''; state.adminError = error.message; }
  render();
}
async function saveRecord(form) {
  const data = Object.fromEntries(new FormData(form)); const kind = form.dataset.kind; const edit = form.dataset.edit === 'true'; const id = form.dataset.id;
  try {
    if (kind === 'university') {
      await request(edit ? `/api/admin/universidades/${id}` : '/api/admin/universidades', { method: edit ? 'PUT' : 'POST', body: JSON.stringify({ nome: data.nome.trim(), cidade: data.cidade.trim() }) }, true);
    } else {
      const body = { nome: data.nome.trim(), descricao: data.descricao.trim(), local: data.local.trim() || null, contato: data.contato.trim() || null, horarios: data.horarios.trim() || null };
      if (edit) await request(`/api/admin/servicos/${id}`, { method: 'PUT', body: JSON.stringify(body) }, true);
      else await request('/api/admin/servicos', { method: 'POST', body: JSON.stringify({ ...body, universidadeId: Number(data.universidadeId) }) }, true);
    }
    state.modal = null; await loadAdminData(); toast(edit ? 'Cadastro atualizado.' : 'Cadastro criado.');
  } catch (error) { toast(error.message, true); }
}
async function toggleRecord(kind, id) {
  const uni = kind === 'university'; const item = uni ? state.adminUniversities.find(x => x.id === id) : state.adminServices.find(x => x.id === id);
  if (!item) return;
  try {
    await request(uni ? `/api/admin/universidades/${id}/ativa` : `/api/admin/servicos/${id}/ativo`, { method: 'PATCH', body: JSON.stringify(uni ? { ativa: !item.ativa } : { ativo: !item.ativo }) }, true);
    await loadAdminData(); toast(`${uni ? 'Universidade' : 'Serviço'} ${item.ativa ? 'desativado' : 'ativado'}.`);
  } catch (error) { toast(error.message, true); }
}
async function deleteRecord(kind, id) {
  const uni = kind === 'university'; const item = uni ? state.adminUniversities.find(x => x.id === id) : state.adminServices.find(x => x.id === id);
  if (!item || !confirm(`Excluir “${item.nome}”? Essa ação não pode ser desfeita.`)) return;
  try { await request(uni ? `/api/admin/universidades/${id}` : `/api/admin/servicos/${id}`, { method: 'DELETE' }, true); await loadAdminData(); toast('Cadastro excluído.'); }
  catch (error) { toast(error.message, true); }
}

app.addEventListener('click', async event => {
  const target = event.target.closest('[data-action]'); if (!target) return;
  const action = target.dataset.action; const id = Number(target.dataset.id);
  if (action === 'home') { state.page = 'home'; state.modal = null; render(); if (!state.demo && !state.universities.length && !state.loading) loadPublic(); }
  if (action === 'scroll-list') { document.querySelector('#universidades')?.scrollIntoView({ behavior: 'smooth' }); }
  if (action === 'admin') { state.page = 'admin'; state.modal = null; state.adminError = ''; render(); }
  if (action === 'retry') loadPublic();
  if (action === 'demo') setDemo();
  if (action === 'clear-search') { state.query = ''; state.city = ''; render(); }
  if (action === 'services') showServices(id);
  if (action === 'reload-services') showServices(id);
  if (action === 'close-modal') { if (target.classList.contains('modal-backdrop') && event.target !== target) return; state.modal = null; render(); }
  if (action === 'settings') {
    const base = prompt('Endereço base da API', state.apiBase);
    if (base !== null && base.trim()) { state.apiBase = base.trim().replace(/\/$/, ''); localStorage.setItem('conecta-api-base', state.apiBase); loadPublic(); }
  }
  if (action === 'admin-tab') { state.adminTab = target.dataset.tab; render(); }
  if (action === 'disconnect') { state.adminKey = ''; state.adminConnected = false; state.adminUniversities = []; state.adminServices = []; state.adminError = ''; render(); }
  if (action === 'add-university') { state.modal = { type: 'new-university' }; render(); }
  if (action === 'edit-university') { state.modal = { type: 'edit-university', item: state.adminUniversities.find(x => x.id === id) }; render(); }
  if (action === 'add-service') { state.modal = { type: 'new-service' }; render(); }
  if (action === 'edit-service') { state.modal = { type: 'edit-service', item: state.adminServices.find(x => x.id === id) }; render(); }
  if (action === 'toggle-university') toggleRecord('university', id);
  if (action === 'toggle-service') toggleRecord('service', id);
  if (action === 'delete-university') deleteRecord('university', id);
  if (action === 'delete-service') deleteRecord('service', id);
});
app.addEventListener('input', event => {
  if (event.target.id === 'search') { state.query = event.target.value; const selection = event.target.selectionStart; render(); const next = document.querySelector('#search'); next?.focus(); next?.setSelectionRange(selection, selection); }
});
app.addEventListener('change', event => {
  if (event.target.id === 'city-filter') { state.city = event.target.value; render(); }
  if (event.target.id === 'admin-university-filter') document.querySelectorAll('[data-service-row]').forEach(row => row.hidden = !!event.target.value && row.dataset.university !== event.target.value);
});
app.addEventListener('submit', event => {
  if (event.target.id === 'connect-form') { event.preventDefault(); connectAdmin(event.target); }
  if (event.target.id === 'record-form') { event.preventDefault(); saveRecord(event.target); }
});
app.addEventListener('keydown', event => {
  const card = event.target.closest('.uni-card');
  if (card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); showServices(Number(card.dataset.id)); }
  if (event.key === 'Escape' && state.modal) { state.modal = null; render(); }
});

render();
loadPublic();
