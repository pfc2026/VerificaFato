# Guia de Contribuicao

## Ambiente local

1. Instale dependencias com `npm install`.
2. Copie `.env.example` para `.env` e configure `MONGODB_URI`, `MONGODB_DB_NAME` e `JWT_SECRET`.
3. Inicie a API com `npm run dev` ou `npm start`.
4. Acesse o frontend em `http://localhost:<PORT>/`.

## Padroes de codigo

- Mantenha validacoes de entrada nas rotas usando `express-validator`.
- Rotas que leem dados privados devem usar `authJwt`; rotas administrativas tambem devem usar `requireAdmin`.
- Nao confie em campos sensiveis enviados pelo cliente, como `tipo`, `ativo` ou `usuario`.
- Escape dados de API antes de inserir HTML no frontend.
- Prefira alteracoes pequenas e alinhadas ao padrao MVC atual.

## Testes e verificacao

- Rode `node --check` nos arquivos JavaScript alterados quando a mudanca for estrutural.
- Rode `npm test` com o MongoDB disponivel para cobrir os fluxos principais da API.
- Para mudancas no frontend, teste manualmente login, cadastro, verificacao por texto, verificacao por link e historico.

## Pull requests

Inclua no PR:

- resumo objetivo da mudanca;
- endpoints ou telas afetadas;
- validacoes/testes executados;
- riscos conhecidos ou pendencias.
