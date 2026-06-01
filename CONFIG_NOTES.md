# Status atual (para referência)

## O que foi implementado
- API REST moderna em arquitetura MVC no diretório `src/`
- Modelos Mongoose: `User`, `Verification`, `Log`
- Auth com JWT e bcryptjs
- Validações com express-validator
- Middleware global de erros
- Swagger em `/api-docs`
- Seed admin automático
- Endpoints privados protegidos com `authJwt`

## Por que o servidor não sobe ainda
- O boot falha por falta de `MONGODB_URI` (e depois `JWT_SECRET`) no arquivo raiz `.env`.

## O que você precisa preencher
No arquivo `./.env` (raiz), definir:
- `MONGODB_URI=...`
- `JWT_SECRET=...`

Depois rodar:
- `npm run dev`

