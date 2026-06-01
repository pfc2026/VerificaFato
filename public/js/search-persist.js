// Helper para persistir o resultado da pesquisa no backend.
// (Este arquivo é opcional; pode ser usado depois para integrar com o seu fluxo de análise existente.)

export async function saveSearch({ token, modo, texto, url, resultado }) {
  const base = window.location.origin || 'http://localhost:3000';
  const res = await fetch(base + '/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      modo,
      texto: texto || undefined,
      url: url || undefined,
      resultado: resultado || {},
    })
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data?.error?.message || 'Falha ao salvar pesquisa');
  }

  return data.data;
}

