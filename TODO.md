# TODO

## ✅ COMPLETADO (v1.1.0)

- [x] Criar endpoint de "me" para retornar dados do usuário logado (GET /api/auth/me) - **IMPLEMENTADO**
- [x] Criar endpoint público `/api/verificar` para verificação de notícias - **IMPLEMENTADO**
- [x] Normalizar respostas JSON (sucesso/dados) para compatibilidade frontend - **IMPLEMENTADO**
- [x] Adicionar campos cidade e categoria aos modelos - **IMPLEMENTADO**
- [x] Corrigir import duplicado em auth.routes.js - **IMPLEMENTADO**
- [x] Configurar arquivo .env completo - **IMPLEMENTADO**

## 🔄 EM PROGRESSO

- [ ] Implementar autenticação no frontend (public/js/auth.js)
- [ ] Atualizar public/auth.html com dados do usuário logado
- [ ] Validar fluxo: token inválido remove token e volta para login
- [ ] Adicionar validação de entrada robusta no frontend
- [ ] Implementar persistência de token no localStorage

## 📋 PRÓXIMAS MELHORIAS

- [ ] Implementar refresh token
- [ ] Adicionar testes unitários
- [ ] Melhorar error handling e logging
- [ ] Sanitizar entradas de usuário
- [ ] Implementar rate limiting
- [ ] Adicionar CI/CD pipeline

