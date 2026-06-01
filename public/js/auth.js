const API_BASE = (window.location.origin || 'http://localhost:3000');
const API = {
  register: '/api/auth/register',
  login: '/api/auth/login',
  me: '/api/auth/me',
};

function getAlert(el, type, msg) {
  if (!el) return;
  el.classList.remove('d-none', 'alert-success', 'alert-danger', 'alert-warning');
  el.classList.add(type);
  el.textContent = msg;
}

function setTab(which) {
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const loginBtn = document.getElementById('tab-login');
  const registerBtn = document.getElementById('tab-register');
  const contaBox = document.getElementById('conta-box');

  if (contaBox) contaBox.classList.add('d-none');

  // default: mostrar abas de login/registro
  if (which === 'login') {
    if (loginForm) loginForm.classList.remove('d-none');
    if (registerForm) registerForm.classList.add('d-none');

    if (loginBtn) {
      loginBtn.textContent = 'Login';
      loginBtn.classList.add('btn-primary');
      loginBtn.classList.remove('btn-outline-primary');
      loginBtn.disabled = false;
    }

    if (registerBtn) {
      registerBtn.classList.remove('d-none');
      registerBtn.classList.add('btn-outline-primary');
      registerBtn.classList.remove('btn-primary');
    }
  } else {
    if (registerForm) registerForm.classList.remove('d-none');
    if (loginForm) loginForm.classList.add('d-none');

    if (registerBtn) {
      registerBtn.classList.add('btn-primary');
      registerBtn.classList.remove('btn-outline-primary');
    }

    if (loginBtn) {
      loginBtn.classList.add('btn-outline-primary');
      loginBtn.classList.remove('btn-primary');
    }
  }
}

function readForm(form) {
  const fd = new FormData(form);
  return Object.fromEntries(fd.entries());
}

function clearFormValidation(form) {
  if (!form) return;
  form.classList.remove('was-validated');
  form.querySelectorAll('.is-invalid').forEach((field) => field.classList.remove('is-invalid'));
  form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute('aria-invalid'));
}

function setFieldError(form, name, message) {
  const field = form?.elements?.[name];
  if (!field) return;

  field.classList.add('is-invalid');
  field.setAttribute('aria-invalid', 'true');

  const feedback = field.closest('.mb-3')?.querySelector('.invalid-feedback');
  if (feedback && message) feedback.textContent = message;
}

function setFormBusy(form, busy) {
  const button = form?.querySelector('button[type="submit"]');
  if (!button) return;

  button.disabled = busy;
  button.dataset.originalText ||= button.innerHTML;
  button.innerHTML = busy
    ? '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Processando...'
    : button.dataset.originalText;
}

function validateCpf(cpf) {
  if (!cpf) return true;
  return /^\d{11}$/.test(cpf.replace(/\D/g, ''));
}

function validateClientForm(form) {
  clearFormValidation(form);
  form.classList.add('was-validated');

  if (!form.checkValidity()) {
    form.querySelector(':invalid')?.focus();
    return false;
  }

  const cpf = form.elements.cpf?.value.trim();
  if (cpf && !validateCpf(cpf)) {
    setFieldError(form, 'cpf', 'Informe um CPF com 11 dígitos.');
    form.elements.cpf.focus();
    return false;
  }

  return true;
}

function isApiError(data) {
  return data?.success === false || data?.sucesso === false;
}

function getApiErrorMessage(data, fallback) {
  const error = data?.error || data?.erro;
  if (error?.code === 'CONFIG_ERROR') {
    return 'O servidor no Vercel está sem variáveis de ambiente. Configure MONGODB_URI e JWT_SECRET no painel da Vercel.';
  }
  if (error?.code === 'DATABASE_CONNECTION_ERROR') {
    return 'Não foi possível conectar ao banco MongoDB. Confira a URI e libere o acesso de rede no MongoDB Atlas.';
  }
  return error?.message || fallback;
}

function getApiErrorDetails(data) {
  return data?.error?.details || data?.erro?.details || [];
}

function getApiPayload(data) {
  return data?.data || data?.dados || {};
}

function applyServerValidationErrors(form, details = []) {
  details.forEach((detail) => {
    const fieldName = detail.path || detail.param;
    if (fieldName) setFieldError(form, fieldName, detail.msg || 'Valor inválido.');
  });
}

async function register(e) {
  e.preventDefault();
  const form = e.target;
  const alertEl = document.getElementById('register-alert');

  if (!validateClientForm(form)) {
    getAlert(alertEl, 'alert-warning', 'Revise os campos destacados antes de continuar.');
    return;
  }

  const payload = readForm(form);
  setFormBusy(form, true);

  try {
    const res = await fetch(API_BASE + API.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        nome: payload.nome.trim(),
        email: payload.email.trim().toLowerCase(),
        senha: payload.senha,
        cpf: payload.cpf || undefined,
        tipo: 'usuario',
        ativo: true,
      }),
    });

    const data = await res.json();
    if (!res.ok || isApiError(data)) {
      const error = new Error(getApiErrorMessage(data, 'Erro ao criar conta'));
      error.details = getApiErrorDetails(data);
      throw error;
    }

    getAlert(alertEl, 'alert-success', 'Conta criada com sucesso. Faça login!');
    const loginEmail = document.querySelector('#form-login [name="email"]');
    if (loginEmail) loginEmail.value = payload.email.trim().toLowerCase();
    form.reset();
    clearFormValidation(form);
    setTab('login');
  } catch (err) {
    applyServerValidationErrors(form, err.details);
    getAlert(alertEl, 'alert-danger', err.message);
  } finally {
    setFormBusy(form, false);
  }
}

async function login(e) {
  e.preventDefault();
  const form = e.target;
  const alertEl = document.getElementById('login-alert');

  if (!validateClientForm(form)) {
    getAlert(alertEl, 'alert-warning', 'Informe email e senha para continuar.');
    return;
  }

  const payload = readForm(form);
  setFormBusy(form, true);

  try {
    const res = await fetch(API_BASE + API.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        senha: payload.senha,
      }),
    });

    const data = await res.json();
    if (!res.ok || isApiError(data)) {
      const error = new Error(getApiErrorMessage(data, 'Credenciais inválidas'));
      error.details = getApiErrorDetails(data);
      throw error;
    }

    const authData = getApiPayload(data);
    if (!authData.token) {
      throw new Error('Token não retornado pela API');
    }

    localStorage.setItem('token', authData.token);
    window.location.href = '/';
  } catch (err) {
    applyServerValidationErrors(form, err.details);
    getAlert(alertEl, 'alert-danger', err.message);
  } finally {
    setFormBusy(form, false);
  }
}

function setContaView(user) {
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const loginBtn = document.getElementById('tab-login');
  const registerBtn = document.getElementById('tab-register');

  if (loginForm) loginForm.classList.add('d-none');
  if (registerForm) registerForm.classList.add('d-none');

  // Troca “Login” -> “Conta”
  if (loginBtn) {
    loginBtn.textContent = 'Conta';
    loginBtn.classList.add('btn-outline-secondary');
    loginBtn.classList.remove('btn-primary');
    loginBtn.disabled = true;
  }

  if (registerBtn) registerBtn.classList.add('d-none');

  // Preenche dados
  const contaNome = document.getElementById('conta-nome');
  const contaEmail = document.getElementById('conta-email');
  const contaTipo = document.getElementById('conta-tipo');

  if (contaNome) contaNome.textContent = user?.nome || '-';
  if (contaEmail) contaEmail.textContent = user?.email || '-';
  if (contaTipo) contaTipo.textContent = user?.tipo || '-';

  const contaBox = document.getElementById('conta-box');
  if (contaBox) contaBox.classList.remove('d-none');
}

async function tryAutoLogin() {
  const token = localStorage.getItem('token');
  if (!token) {
    setTab('login');
    return;
  }

  try {
    const res = await fetch(API_BASE + API.me, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    const data = await res.json();
    if (!res.ok || isApiError(data)) {
      localStorage.removeItem('token');
      setTab('login');
      return;
    }

    setContaView(getApiPayload(data));
  } catch {
    localStorage.removeItem('token');
    setTab('login');
  }
}

document.getElementById('tab-login').addEventListener('click', () => setTab('login'));
document.getElementById('tab-register').addEventListener('click', () => setTab('register'));

document.getElementById('form-login').addEventListener('submit', login);
document.getElementById('form-register').addEventListener('submit', register);

const logoutAccountButton = document.getElementById('btn-logout-account');
if (logoutAccountButton) {
  logoutAccountButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  });
}

// fallback + auto-login
setTab('login');
tryAutoLogin();

