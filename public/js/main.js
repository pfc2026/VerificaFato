// main.js

const API_CONFIG = {
    baseURL: window.location.origin || 'http://localhost:5000',
    endpoints: {
        verify: '/api/verificar',
        search: '/api/search'
    }
};

const verificationForm = document.getElementById('verificationForm');
const newsText = document.getElementById('newsText');
const newsLink = document.getElementById('newsLink');
const citySelect = document.getElementById('citySelect');
const categorySelect = document.getElementById('categorySelect');
const loadingSpinner = document.querySelector('.loading-spinner');
const btnText = document.querySelector('.btn-text');
const accountStatus = document.getElementById('accountStatus');
const accountLink = document.getElementById('accountLink');
const adminLink = document.getElementById('adminLink');
const logoutButton = document.getElementById('logoutButton');
const saveHint = document.getElementById('saveHint');

if (verificationForm) {
    console.log('🎯 Formulário encontrado, adicionando listener...');
    verificationForm.addEventListener('submit', handleFormSubmit);
} else {
    console.error('❌ Formulário não encontrado!');
}

const WESTERN_CITIES = [
    'Cascavel', 'Foz do Iguaçu', 'Toledo', 'Marechal Cândido Rondon', 
    'Medianeira', 'Laranjeiras do Sul', 'Francisco Beltrão', 'Pato Branco',
    'Matelândia', 'Santa Tereza do Oeste', 'Santa Terezinha de Itaipu'
];

const REGIONAL_SOURCES = [
    'Rádio Colméia',
    'Cascavel News', 
    'Jornal O Paraná',
    'Rádio Clube',
    'Tribuna do Paraná',
    'Gazeta do Povo - Regional',
    'Rádio Cultura',
    'Jornal de Toledo'
];

function createModal(modalId) {
    console.log('🎨 Criando modal:', modalId);
    let modalEl = document.getElementById(modalId);
    
    if (!modalEl) {
        console.log('📦 Modal não existe, criando novo...');
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-fullscreen-sm-down modal-lg">
                    <div class="modal-content">
                        <div class="modal-header border-bottom sticky-top bg-white">
                            <h5 class="modal-title text-wrap" id="${modalId}Label">Resultado da Verificação</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" id="modalContent" style="max-width: 100%; overflow-x: hidden;">
                        </div>
                        <div class="modal-footer border-top">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modalEl = document.getElementById(modalId);
        console.log('✅ Modal criado com sucesso');
    }

    return new bootstrap.Modal(modalEl);
}

function populateSelects() {
    if (!citySelect || !categorySelect) return;

    WESTERN_CITIES.forEach(city => {
        const option = document.createElement('option');
        option.value = city.toLowerCase().replace(/\s/g, '-');
        option.textContent = city;
        citySelect.appendChild(option);
    });

    ['Política', 'Economia', 'Segurança', 'Saúde', 'Geral'].forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

window.onload = populateSelects;

function getToken() {
    return localStorage.getItem('token');
}

function getApiPayload(data) {
    return data?.dados || data?.data || {};
}

function getApiErrorMessage(data, fallback) {
    return data?.erro?.message || data?.error?.message || fallback;
}

function getTruthVerdict(score) {
    if (score >= 70) return 'provavelmente verdadeiro';
    if (score >= 40) return 'precisa verificar';
    return 'provavelmente falso';
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

function clampNumber(value, min = 0, max = 100) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.max(min, Math.min(max, number));
}

function clearFieldError(field) {
    if (!field) return;
    field.classList.remove('is-invalid');
    field.removeAttribute('aria-invalid');
}

function setFieldError(field, message) {
    if (!field) return;
    field.classList.add('is-invalid');
    field.setAttribute('aria-invalid', 'true');

    const feedbackId = field.getAttribute('aria-describedby');
    const feedback = feedbackId ? document.getElementById(feedbackId) : null;
    if (feedback) feedback.textContent = message;
}

function clearVerificationErrors() {
    clearFieldError(newsText);
    clearFieldError(newsLink);
}

function validateVerificationInput(texto, link) {
    clearVerificationErrors();

    const hasText = Boolean(texto);
    const hasLink = Boolean(link);

    if (!hasText && !hasLink) {
        setFieldError(newsText, 'Digite um texto ou cole uma URL para verificar.');
        setFieldError(newsLink, 'Digite um texto ou cole uma URL para verificar.');
        return {
            valid: false,
            field: newsText,
            message: 'Por favor, digite o texto OU cole um link da notícia para verificação.',
        };
    }

    if (hasText && hasLink) {
        setFieldError(newsText, 'Use apenas texto ou link, não os dois.');
        setFieldError(newsLink, 'Use apenas texto ou link, não os dois.');
        return {
            valid: false,
            field: newsText,
            message: 'Por favor, escolha apenas UM método: texto ou link.',
        };
    }

    if (hasText && texto.length < 20) {
        setFieldError(newsText, 'O texto precisa ter pelo menos 20 caracteres.');
        return {
            valid: false,
            field: newsText,
            message: 'O texto precisa ter pelo menos 20 caracteres para uma análise minimamente útil.',
        };
    }

    if (hasLink && !safeHttpUrl(link)) {
        setFieldError(newsLink, 'Use uma URL completa iniciada por http:// ou https://.');
        return {
            valid: false,
            field: newsLink,
            message: 'Informe uma URL completa iniciada por http:// ou https://.',
        };
    }

    return { valid: true };
}

function getVerdictClass(score) {
    if (score >= 75) return 'success';
    if (score >= 55) return 'info';
    if (score >= 35) return 'warning';
    return 'danger';
}

function renderList(items, emptyText) {
    if (!items || !items.length) return `<span class="text-muted">${escapeHTML(emptyText)}</span>`;
    return items.map(item => `<span class="badge text-bg-light border me-1 mb-1">${escapeHTML(item)}</span>`).join('');
}

function setLoggedOutView() {
    if (accountStatus) {
        accountStatus.innerHTML = '<i class="fas fa-circle-user me-1"></i> Visitante';
        accountStatus.classList.remove('logged-in');
    }
    if (accountLink) {
        accountLink.innerHTML = '<i class="fas fa-user me-1"></i> Conta';
        accountLink.href = '/auth.html';
    }
    if (logoutButton) logoutButton.classList.add('d-none');
    if (adminLink) adminLink.classList.add('d-none');
    if (saveHint) saveHint.textContent = 'Entre na conta para salvar as análises no histórico.';
}

function setLoggedInView(user) {
    const label = escapeHTML(user?.nome || user?.email || 'Conta logada');
    if (accountStatus) {
        accountStatus.innerHTML = `<i class="fas fa-circle-check me-1"></i> ${label}`;
        accountStatus.classList.add('logged-in');
    }
    if (accountLink) {
        accountLink.innerHTML = '<i class="fas fa-user-check me-1"></i> Minha conta';
        accountLink.href = '/auth.html';
    }
    if (adminLink) adminLink.classList.toggle('d-none', user?.tipo !== 'admin');
    if (logoutButton) logoutButton.classList.remove('d-none');
    if (saveHint) saveHint.textContent = 'Você está logado. As análises serão salvas no histórico.';
}

async function loadAccountArea() {
    const token = getToken();
    if (!token) {
        setLoggedOutView();
        return;
    }

    try {
        const response = await fetch(`${API_CONFIG.baseURL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok || data?.success === false || data?.sucesso === false) {
            localStorage.removeItem('token');
            setLoggedOutView();
            return;
        }
        setLoggedInView(getApiPayload(data));
    } catch (err) {
        console.warn('Não foi possível carregar a conta:', err.message);
        setLoggedOutView();
    }
}

function setupLogout() {
    if (!logoutButton) return;
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        setLoggedOutView();
        showAlert('Você saiu da conta.', 'success');
    });
}

function setupQuickExamples() {
    document.querySelectorAll('.quick-example').forEach((button) => {
        button.addEventListener('click', () => {
            if (newsText) newsText.value = button.dataset.text || '';
            if (newsLink) newsLink.value = button.dataset.link || '';
            clearVerificationErrors();
            showAlert('Exemplo preenchido. Agora é só analisar.', 'success');
        });
    });
}

async function saveSearchHistory(requestData, responsePayload) {
    const token = getToken();
    if (!token) return;

    const analiseIA = responsePayload.analiseIA || {};
    const score = analiseIA.porcentagemVerdade ?? analiseIA.credibilityScore ?? null;
    const factChecks = Array.isArray(responsePayload.factChecks)
        ? responsePayload.factChecks
        : responsePayload.factChecks?.resultados || [];

    const historyPayload = {
        modo: requestData.modo,
        texto: requestData.modo === 'texto' ? requestData.texto : '',
        url: requestData.modo === 'link' ? requestData.link : '',
        cidade: requestData.cidade || '',
        categoria: requestData.categoria || '',
        analiseIA,
        factChecks,
        resultado: {
            veredito: analiseIA.veredito || (typeof score === 'number' ? getTruthVerdict(score) : ''),
            porcentagem: score,
            informacoes: responsePayload.informacoes || {},
            metadados: responsePayload.metadados || {}
        }
    };

    try {
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.search}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(historyPayload),
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            return;
        }

        if (!response.ok) {
            console.warn('Não foi possível salvar no histórico:', response.status, response.statusText);
        }
    } catch (err) {
        console.warn('Não foi possível salvar no histórico:', err.message);
    }
}

setupLogout();
setupQuickExamples();
loadAccountArea();

async function simulateRegionalVerification(text, city, category) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const regionalIndicators = {
                fake: ['prefeitura de ' + city, 'câmara municipal', 'urgente região', 'compartilhe cascavel'],
                true: ['secretaria de saúde', 'detran regional', 'universidade estadual']
            };
            
            const hasFakeIndicators = regionalIndicators.fake.some(indicator => 
                text.toLowerCase().includes(indicator)
            );
            
            const hasTrueIndicators = regionalIndicators.true.some(indicator =>
                text.toLowerCase().includes(indicator)
            );
            
            let verdict, confidence, explanation;
            
            if (hasFakeIndicators && !hasTrueIndicators) {
                verdict = 'FALSA';
                confidence = 88;
                explanation = `Notícia sobre ${city} apresenta padrões comuns de desinformação regional.`;
            } else if (hasTrueIndicators) {
                verdict = 'VERDADEIRA';
                confidence = 92;
                explanation = `Informação condiz com fontes oficiais da região de ${city}.`;
            } else {
                verdict = 'INCONCLUSIVO';
                confidence = 65;
                explanation = `Recomenda-se verificar em fontes oficiais de ${city}.`;
            }
            
            const result = {
                id: Date.now(),
                text: text.substring(0, 100) + '...',
                verdict: verdict,
                confidence: confidence,
                city: city,
                category: category,
                sources: REGIONAL_SOURCES.slice(0, 4),
                explanation: explanation,
                regionalTips: 'Consulte fontes oficiais do município',
                timestamp: new Date().toISOString()
            };
            
            resolve(result);
        }, 2000);
    });
}

function setLoadingState(isLoading) {
    if (!loadingSpinner || !btnText) return;
    if (isLoading) {
        loadingSpinner.style.display = 'inline-block';
        btnText.style.display = 'none';
        if (verificationForm) {
            verificationForm.querySelector('button[type="submit"]')?.setAttribute('disabled', 'disabled');
        }
    } else {
        loadingSpinner.style.display = 'none';
        btnText.style.display = 'inline-block';
        if (verificationForm) {
            verificationForm.querySelector('button[type="submit"]')?.removeAttribute('disabled');
        }
    }
}

function showAlert(message, type = 'warning') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} glass-card alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.setAttribute('aria-live', 'polite');
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
        ${escapeHTML(message)}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    document.getElementById('alertContainer').innerHTML = '';
    document.getElementById('alertContainer').appendChild(alertDiv);
    
    setTimeout(() => alertDiv.remove(), 5000);
}

function createResultsModal() {
    const modalId = 'resultsModal';
    let modalEl = document.getElementById(modalId);
    
    if (!modalEl) {
        const modalHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content glass-card">
                        <div class="modal-header border-0">
                            <h5 class="modal-title">
                                <i class="fas fa-search me-2"></i>
                                Resultado da Verificação
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="modalContent">
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        modalEl = document.getElementById(modalId);
    }
    return new bootstrap.Modal(modalEl);
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const texto = newsText.value.trim();
    const link = newsLink.value.trim();
    const validation = validateVerificationInput(texto, link);

    if (!validation.valid) {
        showAlert(validation.message, 'warning');
        validation.field?.focus();
        return;
    }

    setLoadingState(true);
    
    try {
        const selectedCity = citySelect.value;
        const selectedCategory = categorySelect.value;

        const isLinkMode = !!link;
        const isTextMode = !!texto;

        console.log('📝 Dados do formulário:', {
            modo: isLinkMode ? 'link' : 'texto',
            texto: isTextMode ? texto : null,
            link: isLinkMode ? link : null,
            cidade: selectedCity,
            categoria: selectedCategory
        });

        console.log('🔄 Iniciando requisição...');

        const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.verify}`;
        console.log('🌐 URL da requisição:', url);

        const requestData = {
            texto: isTextMode ? texto : null,
            link: isLinkMode ? link : null,
            cidade: selectedCity,
            categoria: selectedCategory,
            modo: isLinkMode ? 'link' : 'texto'
        };
        
        console.log('📤 Dados sendo enviados:', requestData);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            console.error('❌ Erro na resposta:', response.status, response.statusText);
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        console.log('✅ Resposta recebida');
        const data = await response.json();
        console.log('📊 Dados recebidos:', data);

        if (data.sucesso || data.success) {
            const responsePayload = getApiPayload(data);
            await saveSearchHistory(requestData, responsePayload);

            console.log('✨ Criando modal com os resultados');
            const modal = createModal('resultadoModal');
            const modalContent = document.getElementById('modalContent');
            
            console.log('Dados recebidos para exibição:', responsePayload);
            
            // Verifica se é uma análise de link ou de texto e se temos análise de IA
            const isLink = requestData.modo === 'link';
            const hasAIAnalysis = responsePayload.analiseIA && typeof responsePayload.analiseIA === 'object';
            const informacoes = responsePayload.informacoes || {};

            // Início do HTML
            let htmlContent = '<div class="result-card">';

            // Cabeçalho
            htmlContent += `
                <h4 class="mb-3 text-center">
                    ${isLink ? 'Análise da Notícia' : 'Verificações Encontradas'}
                </h4>`;

            if (informacoes.resumo || informacoes.fonte || informacoes.palavrasChave) {
                const entidades = informacoes.entidades || {};
                const palavrasChave = Array.isArray(informacoes.palavrasChave)
                    ? informacoes.palavrasChave.map(item => item.termo)
                    : [];
                const perguntas = Array.isArray(informacoes.perguntasChecagem)
                    ? informacoes.perguntasChecagem
                    : [];

                htmlContent += `
                    <div class="card mb-4">
                        <div class="card-header bg-light">
                            <h5 class="mb-0">
                                <i class="fas fa-circle-info me-2"></i>
                                Informações importantes da notícia
                            </h5>
                        </div>
                        <div class="card-body">
                            ${informacoes.titulo ? `
                                <h6 class="fw-bold mb-2">${escapeHTML(informacoes.titulo)}</h6>
                            ` : ''}
                            ${informacoes.resumo ? `
                                <p class="mb-3">${escapeHTML(informacoes.resumo)}</p>
                            ` : ''}

                            <div class="row g-3">
                                <div class="col-md-6">
                                    <div class="border rounded p-3 h-100">
                                        <div class="fw-semibold mb-2">
                                            <i class="fas fa-link me-2"></i>Fonte
                                        </div>
                                        <div>${escapeHTML(informacoes.fonte?.dominio || 'Texto sem link')}</div>
                                        <small class="text-muted d-block mt-1">
                                            ${escapeHTML(informacoes.fonte?.classificacao || 'sem classificação')} ·
                                            confiança ${escapeHTML(informacoes.fonte?.confianca || 'não avaliada')}
                                        </small>
                                        ${informacoes.fonte?.observacao ? `
                                            <small class="text-muted d-block mt-2">${escapeHTML(informacoes.fonte.observacao)}</small>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="border rounded p-3 h-100">
                                        <div class="fw-semibold mb-2">
                                            <i class="fas fa-tags me-2"></i>Palavras-chave
                                        </div>
                                        ${renderList(palavrasChave, 'Nenhuma palavra-chave extraída.')}
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="border rounded p-3 h-100">
                                        <div class="fw-semibold mb-2">
                                            <i class="fas fa-location-dot me-2"></i>Entidades citadas
                                        </div>
                                        <div class="mb-1"><small class="text-muted">Cidades:</small> ${renderList(entidades.cidades || [], 'não identificadas')}</div>
                                        <div class="mb-1"><small class="text-muted">Instituições:</small> ${renderList(entidades.instituicoes || [], 'não identificadas')}</div>
                                        <div><small class="text-muted">Pessoas/locais:</small> ${renderList(entidades.pessoasOuLocais || [], 'não identificados')}</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="border rounded p-3 h-100">
                                        <div class="fw-semibold mb-2">
                                            <i class="fas fa-magnifying-glass-chart me-2"></i>Checagem sugerida
                                        </div>
                                        ${perguntas.length ? `
                                            <ul class="mb-2 ps-3">
                                                ${perguntas.slice(0, 4).map(item => `<li>${escapeHTML(item)}</li>`).join('')}
                                            </ul>
                                        ` : '<span class="text-muted">Sem perguntas adicionais.</span>'}
                                        ${informacoes.consultaSugerida ? `
                                            <small class="text-muted d-block">
                                                Pesquise por: ${escapeHTML(informacoes.consultaSugerida)}
                                            </small>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
            }

            // Análise de IA
            if (hasAIAnalysis) {
                console.log('🤖 Renderizando análise de IA:', responsePayload.analiseIA);
                const analiseIA = responsePayload.analiseIA;
                const score = clampNumber(analiseIA.porcentagemVerdade ?? analiseIA.credibilityScore ?? 0);
                const textoAnalisado = responsePayload.texto || {};
                const detalhes = Array.isArray(analiseIA.detalhes) ? analiseIA.detalhes : [];
                const sinais = Array.isArray(analiseIA.sinais) ? analiseIA.sinais : [];
                const recomendacoes = Array.isArray(analiseIA.recomendacoes) ? analiseIA.recomendacoes : [];
                const verdictClass = getVerdictClass(score);
                
                htmlContent += `
                    <div class="card mb-4">
                        <div class="card-header bg-${verdictClass} ${verdictClass === 'warning' || verdictClass === 'info' ? 'text-dark' : 'text-white'}">
                            <h5 class="mb-0">
                                <i class="fas fa-robot me-2"></i>
                                ${escapeHTML(analiseIA.veredito || getTruthVerdict(score))}
                            </h5>
                        </div>
                        <div class="card-body">
                            <h5 class="mb-3 text-center">Índice de confiabilidade</h5>
                            <div class="d-flex align-items-center justify-content-center mb-4">
                                <div class="progress" style="height: 40px; width: 80%;">
                                    <div class="progress-bar bg-${verdictClass}" 
                                        role="progressbar" 
                                        style="width: ${score}%" 
                                        aria-valuenow="${score}" 
                                        aria-valuemin="0" 
                                        aria-valuemax="100">
                                        <span style="font-size: 1.2rem; font-weight: bold;">${score}%</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="alert alert-${verdictClass} text-center">
                                <i class="fas ${score >= 75 ? 'fa-check-circle' : score >= 35 ? 'fa-exclamation-circle' : 'fa-times-circle'} me-2"></i>
                                ${escapeHTML(analiseIA.resumo || 'A notícia foi analisada por sinais de confiabilidade.')}
                            </div>

                            ${textoAnalisado.titulo || textoAnalisado.conteudo ? `
                                <div class="mt-4">
                                    <h6 class="mb-3">Notícia Analisada:</h6>
                                    ${textoAnalisado.titulo ? `<p class="text-muted">${escapeHTML(textoAnalisado.titulo)}</p>` : ''}
                                    ${textoAnalisado.conteudo ? `
                                        <p class="small text-muted">
                                            ${escapeHTML(String(textoAnalisado.conteudo).substring(0, 200).replace(/\n+/g, ' '))}...
                                        </p>
                                    ` : ''}
                                </div>
                            ` : ''}

                            ${sinais.length ? `
                                <div class="mt-4">
                                    <h6 class="mb-3">Sinais encontrados:</h6>
                                    <div class="list-group">
                                        ${sinais.map(sinal => `
                                            <div class="list-group-item d-flex align-items-start gap-2">
                                                <i class="fas ${sinal.tipo === 'positivo' ? 'fa-circle-check text-success' : 'fa-triangle-exclamation text-warning'} mt-1"></i>
                                                <div>
                                                    <div>${escapeHTML(sinal.descricao)}</div>
                                                    <small class="text-muted">Ocorrências: ${escapeHTML(sinal.ocorrencias || 1)}</small>
                                                </div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            ${recomendacoes.length ? `
                                <div class="mt-4">
                                    <h6 class="mb-3">O que fazer agora:</h6>
                                    <ul class="mb-0">
                                        ${recomendacoes.map(item => `<li>${escapeHTML(item)}</li>`).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            <div class="mt-3">
                                <h6>Detalhes da Análise:</h6>
                                <div class="row">
                                    ${detalhes.map(detalhe => `
                                        <div class="col-12 col-sm-6 mb-2">
                                            <small>
                                                <strong>${escapeHTML(detalhe.aspect)}:</strong>
                                                <span class="text-${clampNumber(detalhe.probability) >= 70 ? 'success' : clampNumber(detalhe.probability) >= 40 ? 'warning' : 'danger'}">
                                                    ${clampNumber(detalhe.probability)}%
                                                </span>
                                            </small>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>`;
            }

            // Fact-checking section
            const factChecks = responsePayload.factChecks ? (
                Array.isArray(responsePayload.factChecks) ? responsePayload.factChecks : 
                (responsePayload.factChecks.resultados || [])
            ) : [];
            console.log('🔍 Fact checks encontrados:', factChecks);
            const quantidade = factChecks.length;
            const encontrados = quantidade > 0;

            // Se temos verificações ou já exibimos a análise de IA
            if (encontrados || hasAIAnalysis) {

                // Statistics card (apenas para pesquisa por texto)
                if (!isLink && encontrados) {
                    htmlContent += `
                        <div class="card mb-4">
                            <div class="card-header bg-info text-white">
                                <h5 class="mb-0">
                                    <i class="fas fa-chart-pie me-2"></i>
                                    Resumo das Verificações
                                </h5>
                            </div>
                            <div class="card-body">
                                <div class="alert alert-info mb-4">
                                    <i class="fas fa-info-circle me-2"></i>
                                    Encontramos <strong>${quantidade}</strong> verificações sobre este assunto
                                </div>
                                
                                <div class="row mb-4">
                                    <div class="col-4 text-center">
                                        <h3 class="text-danger">${factChecks.filter(f => (f.avaliacao || '').toLowerCase().includes('falso')).length}</h3>
                                        <small>FALSO</small>
                                    </div>
                                    <div class="col-4 text-center">
                                        <h3 class="text-warning">${factChecks.filter(f => (f.avaliacao || '').toLowerCase().includes('enganoso')).length}</h3>
                                        <small>ENGANOSO</small>
                                    </div>
                                    <div class="col-4 text-center">
                                        <h3 class="text-success">${factChecks.filter(f => (f.avaliacao || '').toLowerCase().includes('verdadeiro')).length}</h3>
                                        <small>VERDADEIRO</small>
                                    </div>
                                </div>
                            </div>
                        </div>`;
                }

                // Lista de verificações
                if (encontrados) {
                    htmlContent += `
                        <div class="card mb-4">
                            <div class="card-header ${isLink ? 'bg-secondary' : 'bg-light'} ${isLink ? 'text-white' : ''}">
                                <h5 class="mb-0">
                                    <i class="fas fa-list-ul me-2"></i>
                                    ${isLink ? 'Verificações Relacionadas' : 'Detalhes das Verificações'}
                                </h5>
                            </div>
                            <div class="card-body p-0">
                                <div class="result-details">
                                    ${factChecks.map(item => {
                                        const avaliacao = String(item.avaliacao || '');
                                        const avaliacaoLower = avaliacao.toLowerCase();
                                        const reviewUrl = safeHttpUrl(item.url_revisao);

                                        return `
                                            <div class="result-item p-3 border-bottom ${
                                                avaliacaoLower.includes('falso') ? 'border-danger bg-danger bg-opacity-10' :
                                                avaliacaoLower.includes('enganoso') ? 'border-warning bg-warning bg-opacity-10' :
                                                'border-success bg-success bg-opacity-10'
                                            }">
                                                <div class="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2 mb-3">
                                                    <span class="badge ${
                                                        avaliacaoLower.includes('falso') ? 'bg-danger' :
                                                        avaliacaoLower.includes('enganoso') ? 'bg-warning text-dark' :
                                                        'bg-success'
                                                    } px-3 py-2 text-wrap fs-6">
                                                        ${escapeHTML(avaliacao || 'Não especificado')}
                                                    </span>
                                                    <span class="badge bg-secondary px-3 py-2">
                                                        <i class="fas fa-check-circle me-1"></i>
                                                        ${escapeHTML(item.verificador || 'Fonte desconhecida')}
                                                    </span>
                                                </div>
                                                <div class="mt-2">
                                                    <h6 class="fw-bold text-break mb-3">${escapeHTML(item.alegacao || 'Sem descrição disponível')}</h6>
                                                    <div class="d-flex flex-wrap gap-3 align-items-center">
                                                        <small class="text-muted">
                                                            <i class="fas fa-user me-1"></i>
                                                            ${escapeHTML(item.autor || 'Autor não informado')}
                                                        </small>
                                                        ${reviewUrl ? `
                                                            <a href="${escapeHTML(reviewUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary">
                                                                <i class="fas fa-external-link-alt me-1"></i>
                                                                Ver verificação completa
                                                            </a>
                                                        ` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>`;
                } else {
                    // Se não encontrou verificações mas tem análise de IA
                    if (hasAIAnalysis) {
                        htmlContent += `
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                Não encontramos verificações anteriores sobre esta notícia em nossa base de dados.
                                <hr>
                                <small class="d-block mt-2">
                                    <i class="fas fa-robot me-1"></i>
                                    Você pode consultar a análise de IA acima para uma avaliação preliminar do conteúdo.
                                </small>
                            </div>`;
                    } else {
                        htmlContent += `
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                Nenhuma verificação encontrada na nossa base de dados para este ${isLink ? 'link' : 'texto'}.
                                ${isLink ? '<hr><small class="d-block mt-2">Aguarde enquanto nossa IA analisa o conteúdo...</small>' : ''}
                            </div>`;
                    }
                }
            }

            // Fecha div principal
            htmlContent += '</div>';
            
            // Atualiza o conteúdo do modal
            modalContent.innerHTML = htmlContent;
            modal.show();
            console.log('✅ Modal exibido com sucesso');
        } else {
            showAlert(getApiErrorMessage(data, 'Não foi possível verificar a notícia. Tente novamente.'), 'danger');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert(error.message || 'Erro ao processar a requisição. Tente novamente.', 'danger');
    } finally {
        setLoadingState(false);
    }
}
