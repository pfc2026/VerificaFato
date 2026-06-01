const API_BASE = window.location.origin || 'http://localhost:3000';
const API = {
  search: '/api/search'
};

function getToken() {
  return localStorage.getItem('token');
}

function isApiError(data) {
  return data?.success === false || data?.sucesso === false;
}

function getApiErrorMessage(data, fallback) {
  return data?.error?.message || data?.erro?.message || fallback;
}

function getApiPayload(data) {
  return data?.data || data?.dados || {};
}

function setAlert(type, msg) {
  const el = document.getElementById('alert');
  if (!el) return;
  el.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-warning');
  el.classList.add('alert-' + type);
  el.textContent = msg;
}

function formatWhen(iso) {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR');
  } catch {
    return iso;
  }
}

function safeTrunc(str, max = 60) {
  if (!str) return '';
  const s = String(str);
  return s.length > max ? s.slice(0, max) + '...' : s;
}

function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeHttpUrl(value) {
  const raw = String(value || '').trim();
  if (!/^https?:\/\//i.test(raw)) return '';

  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

let state = {
  page: 1,
  limit: 10,
  q: '',
  modo: '',
  veredito: '',
  totalPages: 1,
};

async function fetchHistory() {
  const token = getToken();
  if (!token) {
    window.location.href = '/auth.html';
    return;
  }

  const tbody = document.getElementById('tbody');
  const meta = document.getElementById('meta');
  const pager = document.getElementById('pager');

  tbody.innerHTML = '';

  const params = new URLSearchParams();
  params.set('page', state.page);
  params.set('limit', state.limit);
  if (state.q) params.set('q', state.q);
  if (state.modo) params.set('modo', state.modo);
  if (state.veredito) params.set('veredito', state.veredito);

  try {
    const res = await fetch(API_BASE + API.search + '?' + params.toString(), {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();

    if (!res.ok || isApiError(data)) {
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        window.location.href = '/auth.html';
        return;
      }
      throw new Error(getApiErrorMessage(data, 'Falha ao carregar histórico'));
    }

    const { items, totalItems, totalPages } = getApiPayload(data);
    state.totalPages = totalPages;

    meta.textContent = `Total: ${totalItems} • Total de páginas: ${totalPages}`;
    pager.textContent = `Página ${state.page} de ${totalPages}`;

    if (!items || items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-muted">Nenhuma pesquisa encontrada.</td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(item => {
      const entrada = item.modo === 'link' ? safeTrunc(item.url, 55) : safeTrunc(item.texto, 55);
      const url = item.modo === 'link' ? safeHttpUrl(item.url) : '';
      return `
        <tr>
          <td>${escapeHTML(formatWhen(item.createdAt))}</td>
          <td><span class="badge ${item.modo === 'link' ? 'text-bg-secondary' : 'text-bg-primary'}">${escapeHTML(item.modo)}</span></td>
          <td>${escapeHTML(entrada || '-')}</td>
          <td>${escapeHTML(item.veredito || '-')}</td>
          <td class="text-end">
            ${url ? `<a class="btn btn-sm btn-outline-primary" target="_blank" rel="noopener noreferrer" href="${escapeHTML(url)}">Abrir</a>` : ''}
          </td>
        </tr>
      `;
    }).join('');

    document.getElementById('btn-prev').disabled = state.page <= 1;
    document.getElementById('btn-next').disabled = state.page >= state.totalPages;

  } catch (err) {
    setAlert('danger', err.message);
  }
}

document.getElementById('filterForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  state.page = 1;
  state.q = fd.get('q') || '';
  state.modo = fd.get('modo') || '';
  state.veredito = fd.get('veredito') || '';
  fetchHistory();
});

document.getElementById('btn-prev').addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1;
    fetchHistory();
  }
});

document.getElementById('btn-next').addEventListener('click', () => {
  if (state.page < state.totalPages) {
    state.page += 1;
    fetchHistory();
  }
});

document.getElementById('btn-logout').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = '/';
});

// Init
fetchHistory();

