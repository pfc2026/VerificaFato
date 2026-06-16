const API_BASE = window.location.origin || 'http://localhost:3000';

const state = {
  users: { page: 1, limit: 10, totalPages: 1, q: '', tipo: '', ativo: '' },
  searches: { page: 1, limit: 10, totalPages: 1, q: '', modo: '', veredito: '' },
  logs: { page: 1, limit: 10, totalPages: 1, q: '', acao: '' },
};

let currentUser = null;

function getToken() {
  return localStorage.getItem('token');
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('pt-BR');
  } catch {
    return String(value);
  }
}

function trunc(value, max = 72) {
  const text = String(value || '');
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function getPayload(data) {
  return data?.dados || data?.data || {};
}

function getErrorMessage(data, fallback) {
  return data?.erro?.message || data?.error?.message || fallback;
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function showAlert(message, type = 'warning') {
  const container = document.getElementById('adminAlert');
  if (!container) return;

  container.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show shadow-sm" role="alert">
      ${escapeHTML(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    </div>
  `;
}

function showForbidden() {
  document.getElementById('adminDashboard')?.classList.add('d-none');
  document.getElementById('forbiddenState')?.classList.remove('d-none');
}

function showDashboard() {
  document.getElementById('forbiddenState')?.classList.add('d-none');
  document.getElementById('adminDashboard')?.classList.remove('d-none');
}

async function apiRequest(path, options = {}) {
  const token = getToken();
  if (!token) {
    window.location.href = '/auth.html';
    return null;
  }

  const response = await fetch(API_BASE + path, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/auth.html';
    return null;
  }

  if (response.status === 403) {
    showForbidden();
    throw new Error('Acesso restrito a administradores.');
  }

  if (!response.ok || data?.sucesso === false || data?.success === false) {
    throw new Error(getErrorMessage(data, 'Falha ao comunicar com a API.'));
  }

  return getPayload(data);
}

function buildQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  return query.toString();
}

function renderStatList(id, items, emptyText) {
  const container = document.getElementById(id);
  if (!container) return;

  if (!items || !items.length) {
    container.innerHTML = `<div class="text-muted small">${escapeHTML(emptyText)}</div>`;
    return;
  }

  const max = Math.max(...items.map((item) => Number(item.total) || 0), 1);
  container.innerHTML = items.map((item) => {
    const total = Number(item.total) || 0;
    const width = Math.max(4, Math.round((total / max) * 100));
    return `
      <div class="admin-stat-row">
        <div class="d-flex justify-content-between gap-2">
          <span>${escapeHTML(item.label || item.date || '-')}</span>
          <strong>${total}</strong>
        </div>
        <div class="admin-stat-bar"><span style="width: ${width}%"></span></div>
      </div>
    `;
  }).join('');
}

function renderSummary(data) {
  const cards = data.cards || {};
  setText('kpiUsers', cards.totalUsers ?? 0);
  setText('kpiActiveUsers', `${cards.activeUsers ?? 0} ativos / ${cards.inactiveUsers ?? 0} inativos`);
  setText('kpiAdmins', cards.adminUsers ?? 0);
  setText('kpiSearches', cards.totalSearches ?? 0);
  setText('kpiSearchesToday', `${cards.searchesToday ?? 0} hoje`);
  setText('kpiVerifications', cards.totalVerifications ?? 0);
  setText('kpiLogsToday', cards.logsToday ?? 0);

  renderStatList('modeStats', data.charts?.searchByMode, 'Sem pesquisas salvas.');
  renderStatList('verdictStats', data.charts?.topVerdicts, 'Sem vereditos salvos.');
  renderStatList('activityStats', data.charts?.activityByDay, 'Sem atividade recente.');
}

function renderPagination(scope, data) {
  state[scope].totalPages = data.totalPages || 1;
  setText(`${scope}Page`, `Página ${state[scope].page} de ${state[scope].totalPages}`);

  const prev = document.getElementById(`${scope}Prev`);
  const next = document.getElementById(`${scope}Next`);
  if (prev) prev.disabled = state[scope].page <= 1;
  if (next) next.disabled = state[scope].page >= state[scope].totalPages;
}

function userBadge(user) {
  return user.tipo === 'admin'
    ? '<span class="badge text-bg-dark">Admin</span>'
    : '<span class="badge text-bg-secondary">Usuário</span>';
}

function activeBadge(user) {
  return user.ativo
    ? '<span class="badge text-bg-success">Ativo</span>'
    : '<span class="badge text-bg-danger">Inativo</span>';
}

function renderUsers(data) {
  const tbody = document.getElementById('usersTableBody');
  const items = data.items || [];

  if (!tbody) return;
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted">Nenhum usuário encontrado.</td></tr>';
    renderPagination('users', data);
    return;
  }

  tbody.innerHTML = items.map((user) => {
    const id = user._id || user.id;
    const isSelf = currentUser && String(currentUser.id || currentUser._id) === String(id);
    const nextStatus = !user.ativo;
    const nextType = user.tipo === 'admin' ? 'usuario' : 'admin';

    return `
      <tr>
        <td>${escapeHTML(user.nome || '-')}</td>
        <td>${escapeHTML(user.email || '-')}</td>
        <td>${userBadge(user)}</td>
        <td>${activeBadge(user)}</td>
        <td>${escapeHTML(formatDate(user.createdAt))}</td>
        <td class="text-end">
          <div class="btn-group btn-group-sm" role="group">
            <button class="btn btn-outline-secondary" type="button"
              data-user-action="type" data-user-id="${escapeHTML(id)}" data-value="${escapeHTML(nextType)}"
              ${isSelf ? 'disabled' : ''}>
              ${user.tipo === 'admin' ? 'Remover admin' : 'Tornar admin'}
            </button>
            <button class="btn ${user.ativo ? 'btn-outline-danger' : 'btn-outline-success'}" type="button"
              data-user-action="active" data-user-id="${escapeHTML(id)}" data-value="${nextStatus}"
              ${isSelf ? 'disabled' : ''}>
              ${user.ativo ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  renderPagination('users', data);
}

function renderSearches(data) {
  const tbody = document.getElementById('searchesTableBody');
  const items = data.items || [];

  if (!tbody) return;
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted">Nenhuma pesquisa encontrada.</td></tr>';
    renderPagination('searches', data);
    return;
  }

  tbody.innerHTML = items.map((item) => {
    const user = item.usuario || {};
    const entrada = item.modo === 'link' ? item.url : item.texto;
    const score = item.porcentagem === null || item.porcentagem === undefined ? '-' : `${item.porcentagem}%`;

    return `
      <tr>
        <td>${escapeHTML(formatDate(item.createdAt))}</td>
        <td>${escapeHTML(user.email || user.nome || 'Anônimo')}</td>
        <td><span class="badge ${item.modo === 'link' ? 'text-bg-secondary' : 'text-bg-primary'}">${escapeHTML(item.modo || '-')}</span></td>
        <td>${escapeHTML(trunc(entrada || '-'))}</td>
        <td>${escapeHTML(item.veredito || '-')}</td>
        <td>${escapeHTML(score)}</td>
      </tr>
    `;
  }).join('');

  renderPagination('searches', data);
}

function stringifyDetails(details) {
  if (!details) return '-';
  if (typeof details === 'string') return details;
  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
}

function renderLogs(data) {
  const tbody = document.getElementById('logsTableBody');
  const items = data.items || [];

  if (!tbody) return;
  if (!items.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted">Nenhum log encontrado.</td></tr>';
    renderPagination('logs', data);
    return;
  }

  tbody.innerHTML = items.map((item) => `
    <tr>
      <td>${escapeHTML(formatDate(item.createdAt))}</td>
      <td><span class="badge text-bg-light border">${escapeHTML(item.acao || '-')}</span></td>
      <td>${escapeHTML(item.usuario || '-')}</td>
      <td>${escapeHTML(item.ip || '-')}</td>
      <td class="admin-log-details">${escapeHTML(trunc(stringifyDetails(item.detalhes), 120))}</td>
    </tr>
  `).join('');

  renderPagination('logs', data);
}

async function loadSummary() {
  const data = await apiRequest('/api/admin/summary');
  if (data) renderSummary(data);
}

async function loadUsers() {
  const query = buildQuery(state.users);
  const data = await apiRequest(`/api/users?${query}`);
  if (data) renderUsers(data);
}

async function loadSearches() {
  const query = buildQuery(state.searches);
  const data = await apiRequest(`/api/admin/searches?${query}`);
  if (data) renderSearches(data);
}

async function loadLogs() {
  const query = buildQuery(state.logs);
  const data = await apiRequest(`/api/logs?${query}`);
  if (data) renderLogs(data);
}

async function refreshAll() {
  try {
    await Promise.all([loadSummary(), loadUsers(), loadSearches(), loadLogs()]);
  } catch (err) {
    showAlert(err.message, 'danger');
  }
}

function bindFilters() {
  document.getElementById('usersFilter')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    state.users.page = 1;
    state.users.q = form.get('q') || '';
    state.users.tipo = form.get('tipo') || '';
    state.users.ativo = form.get('ativo') || '';
    loadUsers().catch((err) => showAlert(err.message, 'danger'));
  });

  document.getElementById('searchesFilter')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    state.searches.page = 1;
    state.searches.q = form.get('q') || '';
    state.searches.modo = form.get('modo') || '';
    state.searches.veredito = form.get('veredito') || '';
    loadSearches().catch((err) => showAlert(err.message, 'danger'));
  });

  document.getElementById('logsFilter')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    state.logs.page = 1;
    state.logs.q = form.get('q') || '';
    state.logs.acao = form.get('acao') || '';
    loadLogs().catch((err) => showAlert(err.message, 'danger'));
  });
}

function bindPagination(scope, loader) {
  document.getElementById(`${scope}Prev`)?.addEventListener('click', () => {
    if (state[scope].page > 1) {
      state[scope].page -= 1;
      loader().catch((err) => showAlert(err.message, 'danger'));
    }
  });

  document.getElementById(`${scope}Next`)?.addEventListener('click', () => {
    if (state[scope].page < state[scope].totalPages) {
      state[scope].page += 1;
      loader().catch((err) => showAlert(err.message, 'danger'));
    }
  });
}

function bindUserActions() {
  document.getElementById('usersTableBody')?.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-user-action]');
    if (!button) return;

    const id = button.dataset.userId;
    const action = button.dataset.userAction;
    const value = button.dataset.value;
    const body = action === 'active' ? { ativo: value === 'true' } : { tipo: value };

    button.disabled = true;
    try {
      await apiRequest(`/api/users/${id}`, { method: 'PATCH', body });
      showAlert('Usuário atualizado com sucesso.', 'success');
      await Promise.all([loadSummary(), loadUsers()]);
    } catch (err) {
      showAlert(err.message, 'danger');
    } finally {
      button.disabled = false;
    }
  });
}

function bindLogout() {
  document.getElementById('adminLogout')?.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  });
}

async function initAdmin() {
  bindFilters();
  bindPagination('users', loadUsers);
  bindPagination('searches', loadSearches);
  bindPagination('logs', loadLogs);
  bindUserActions();
  bindLogout();

  try {
    currentUser = await apiRequest('/api/auth/me');
    if (!currentUser || currentUser.tipo !== 'admin') {
      showForbidden();
      return;
    }

    setText('adminIdentity', currentUser.nome || currentUser.email || 'Administrador');
    showDashboard();
    await refreshAll();
  } catch (err) {
    showAlert(err.message, 'danger');
  }
}

initAdmin();
