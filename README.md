# � VerificaFato - Sistema Verificador de Notícias

<div align="center">

![Badge Status](https://img.shields.io/badge/Status-Ativo-success?style=flat-square)
![Badge Version](https://img.shields.io/badge/Versão-1.0.0-blue?style=flat-square)
![Badge License](https://img.shields.io/badge/Licença-ISC-green?style=flat-square)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.11-FF6F00?style=flat-square&logo=tensorflow)](https://www.tensorflow.org/js)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)

---

### 🎯 **Uma plataforma inteligente para verificar a veracidade de notícias**

[Início Rápido](#-quick-start) • [Funcionalidades](#-funcionalidades) • [Instalação](#-instalação) • [Uso](#-como-usar) • [Contribuir](#-contribuição)

</div>

---

## 📋 Sobre o Projeto

**VerificaFato** é um aplicativo web moderno que utiliza inteligência artificial e análise de conteúdo para ajudar na detecção de notícias falsas (fake news). O sistema foi desenvolvido como um projeto educacional e de pesquisa para combater a desinformação.

Com uma interface intuitiva e ferramentas poderosas, o VerificaFato oferece:
- 🤖 Análise inteligente com Machine Learning
- 🔍 Detecção de padrões de desinformação
- 📊 Histórico de análises
- 🌙 Suporte a Dark Mode
- 📱 Design responsivo para qualquer dispositivo

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🤖 **Machine Learning** | Utiliza TensorFlow.js para análise de conteúdo |
| 🔍 **Detecção de Toxicidade** | Identifica linguagem agressiva ou enganosa |
| 📈 **Análise de Crédibilidade** | Verifica compatibilidade com padrões conhecidos |
| 💾 **Histórico Local** | Salva análises no navegador do usuário |
| 🎨 **Dark Mode** | Interface com suporte completo a tema escuro |
| 📱 **Responsivo** | Funciona perfeitamente em desktop, tablet e mobile |
| 🔐 **Privado** | Dados não são armazenados no servidor |
| ⚡ **Rápido** | Processamento local para máxima velocidade |

---

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** 18 ou superior
- **npm** 9 ou superior
- **RAM** 2GB mínimo para TensorFlow.js
- **Git** para clonar o repositório

### Instalação Rápida

```bash
# 1️⃣ Clonar o repositório
git clone https://github.com/seu-usuario/VerificaFato.git
cd VerificaFato

# 2️⃣ Instalar dependências
npm install

# 3️⃣ Configurar variáveis de ambiente (opcional)
cp .env.example .env

# 4️⃣ Iniciar o servidor
npm start
```

Acesse **http://localhost:3000** no seu navegador e comece a usar! 🎉

### Comandos Disponíveis

```bash
npm start          # Inicia o servidor em produção
npm run dev        # Inicia com nodemon para desenvolvimento
npm test           # Executa testes da API
```

---

## 📁 Estrutura do Projeto

```
VerificaFato/
├── public/                 # Arquivos estáticos (HTML, CSS, JS)
│   ├── index.html         # Página principal
│   ├── css/               # Estilos
│   │   ├── style.css
│   │   ├── responsive.css
│   │   └── results.css
│   └── js/                # Scripts do cliente
│       ├── main.js
│       ├── dark-mode.js
│       └── education.js
├── js/                    # Scripts compartilhados
│   └── googleService.js   # Serviço de integração
├── server.js              # Servidor Express
├── googleService.js       # Backend do serviço
├── package.json          # Dependências do projeto
└── README.md             # Este arquivo
```

---

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** 22+ - Runtime JavaScript
- **Express.js** 4.18+ - Framework web RESTful
- **MongoDB/Mongoose** 9.6+ - Banco de dados NoSQL
- **JWT** - Autenticação e autorização
- **Bcryptjs** - Hashing de senhas
- **Axios** - Cliente HTTP
- **Swagger/OpenAPI** - Documentação automática de APIs

### Frontend
- **HTML5** - Markup semântico
- **CSS3** - Estilos responsivos e Dark Mode
- **Bootstrap 5** - Framework CSS moderno
- **JavaScript Vanilla** - Lógica do cliente
- **TensorFlow.js** 4.11+ - Machine Learning no navegador

### DevOps
- **Docker** - Containerização (em planejamento)
- **npm/Node Package Manager** - Gestão de dependências
- **Nodemon** - Auto-reload em desenvolvimento

---

## 📖 Como Usar

### Para Usuários

1. **Acesse** http://localhost:3000
2. **Digite ou cole** uma notícia para verificar
3. **Clique em "Pesquisar Notícias"** 
4. **Visualize os resultados** com análise de IA detalhada
5. **Faça login** (opcional) para salvar histórico de análises

### Para Desenvolvedores

#### Setup Local

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/VerificaOeste-Parana.git
cd VerificaOeste-Parana

# 2. Instalar dependências
npm install

# 3. Configurar MongoDB
# Certifique-se de que MongoDB está rodando em localhost:27017

# 4. Configurar variáveis de ambiente
cp .env.example .env  # E preencher com suas variáveis

# 5. Iniciar servidor
npm run dev          # Desenvolvimento com hot-reload
# ou
npm start            # Produção
```

#### Testar API

```bash
# Executar suite de testes
npm test

# ou especificamente
npm run test:api
```

---

## 🔌 Endpoints da API

| Método | Rota | Autenticação | Descrição |
|--------|------|--------------|-----------|
| **GET** | `/` | ❌ | Página principal |
| **GET** | `/api/health` | ❌ | Status da API |
| **GET** | `/api-docs` | ❌ | Documentação Swagger |
| **POST** | `/api/verificar` | ❌ | Verifica notícia (público) |
| **POST** | `/api/auth/register` | ❌ | Registra novo usuário |
| **POST** | `/api/auth/login` | ❌ | Login e obter JWT |
| **GET** | `/api/auth/me` | ✅ JWT | Dados do usuário logado |
| **POST** | `/api/verifications` | ✅ JWT | Criar verificação |
| **GET** | `/api/verifications` | ✅ JWT | Listar verificações |
| **PATCH** | `/api/verifications/:id` | ✅ JWT | Atualizar verificação |
| **POST** | `/api/search` | ✅ JWT | Salvar busca realizada |
| **GET** | `/api/search` | ✅ JWT | Listar histórico de buscas |
| **GET** | `/api/logs` | ✅ JWT (Admin) | Visualizar logs do sistema |

---

## 📊 Exemplo de Requisição

### Verificar Notícia (Público)

```http
POST /api/verificar HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "modo": "texto",
  "texto": "Prefeitura de Cascavel anuncia novo programa de educação",
  "cidade": "cascavel",
  "categoria": "política"
}
```

**Resposta:**
```json
{
  "sucesso": true,
  "dados": {
    "analiseIA": {
      "porcentagemVerdade": 78,
      "detalhes": [
        {
          "aspect": "Suspição de padrões",
          "probability": 78
        }
      ]
    },
    "factChecks": [
      {
        "alegacao": "Prefeitura anuncia investimentos",
        "avaliacao": "Verdadeiro",
        "verificador": "Fact Check Brasil",
        "url_revisao": "https://example.com"
      }
    ]
  }
}
```

---

## 🔧 Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz:

```env
# Servidor
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/pfc2026ifpr_db
MONGODB_DB_NAME=pfc2026ifpr_db

# Autenticação
JWT_SECRET=sua_chave_secreta_aqui_mudar_em_producao
JWT_EXPIRES_IN=7d

# Seed Admin (preenchimento inicial)
SEED_ADMIN_EMAIL=admin@verificaoeste.com
SEED_ADMIN_PASSWORD=Admin@123

# Google Fact Check API
GOOGLE_API_KEY=sua_chave_google_aqui
FACT_CHECK_BASE_URL=https://factchecktools.googleapis.com

# CORS
CORS_ORIGIN=*

# Swagger
SWAGGER_SERVER_URL=http://localhost:3000
```

> ⚠️ **IMPORTANTE:** Sempre mantenha o `.env` seguro. Nunca commitar com valores reais!

---

## 🚀 Deployment

### Preparar para Produção

```bash
# 1. Instalar dependências apenas de produção
npm install --only=production

# 2. Definir variáveis de ambiente em produção
export NODE_ENV=production
export MONGODB_URI=sua_uri_mongodb_em_producao
# ... (todas as outras variáveis necessárias)

# 3. Iniciar servidor
npm start
```

### Com Docker (Próximas Versões)

```dockerfile
# Dockerfile
FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

---

## 🧪 Testes

A suite de testes cobre todos os endpoints principais:

```bash
npm test
```

Testa:
- ✅ Health Check
- ✅ Autenticação (Register/Login)
- ✅ Verificador de notícias
- ✅ CRUD de verificações
- ✅ Histórico de buscas
- ✅ Swagger/Documentação

---

## 📋 Convenções de Código

- **ES6+** - Use `const` por padrão, `let` quando necessário
- **Async/Await** - Sempre prefira async/await a Promises
- **Comentários** - Documente funções complexas
- **Nomes** - Variáveis em camelCase, classes em PascalCase
- **Validação** - Sempre valide entrada do usuário

---

## 🤝 Contribuição

Contribuições são bem-vindas! 

1. Faça um **Fork** do repositório
2. Crie uma **branch** (`git checkout -b feature/sua-feature`)
3. **Commit** suas mudanças (`git commit -m 'Add: descrição clara'`)
4. **Push** para a branch (`git push origin feature/sua-feature`)
5. Abra um **Pull Request**

### Tipos de Commits

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação de código
- `refactor:` - Refatoração sem mudança funcional
- `test:` - Testes
- `perf:` - Melhorias de performance

---

## 🐛 Reportar Problemas

Encontrou um bug? Abra uma [issue no GitHub](https://github.com/seu-usuario/VerificaOeste-Parana/issues) com:

- ✅ Descrição clara
- ✅ Passos para reproduzir
- ✅ Comportamento esperado vs atual
- ✅ Ambiente (SO, Node.js version)

---

## 📝 Licença

Este projeto está sob **ISC License** - veja [LICENSE](LICENSE)

---

## 👨‍💻 Autores

Desenvolvido com ❤️ por:
- **Emilly**
- **Luiz Felipe**
- **Miguel**

### Agradecimentos

- 🎓 IFPR - Instituto Federal do Paraná
- 📚 Comunidade Open Source
- 🙏 Todos os contribuidores

---

## 📞 Contato & Suporte

- 📧 **Email:** contato@verificaoeste.com
- 🐛 **Issues:** [GitHub Issues](https://github.com/seu-usuario/VerificaOeste-Parana/issues)
- 💬 **Discussões:** [GitHub Discussions](https://github.com/seu-usuario/VerificaOeste-Parana/discussions)

---

<div align="center">

### ⭐ Gostou? Deixe uma estrela! ⭐

**Desenvolvido com paixão e muita ☕**

</div>
- 🛠️ [API Reference](#api)
- 🚀 [Deploy](#deployment)

### Documentação Técnica
- 📄 [DARK_MODE.md](./DARK_MODE.md) - Sistema de Dark Mode
- 📄 [IMPLEMENTATION_REPORT.md](./IMPLEMENTATION_REPORT.md) - Relatório de Implementação

---

## 🎯 Como Usar

### Interface Web

1. **Abra o navegador** e vá para http://localhost:3000
2. **Escreva ou cole** a notícia a analisar
3. **(Opcional)** Selecione cidade e categoria
4. **Clique** em "Pesquisar Notícias"
5. **Visualize** o resultado: Verdadeira, Falsa ou Inconclusiva
6. **Consulte** as fontes que fundamentam o resultado

### Análise por Texto
```
Entrada: Texto da notícia
Processamento: ML + análise de toxicidade
Saída: Classificação + confiança + fontes
```

### Análise por Link
```
Entrada: URL do artigo
Processamento: Extração de conteúdo + análise
Saída: Classificação detalhada
```

---

## 📊 Funcionalidades

### ✅ Pesquisa de Notícias
- Busca por texto livre
- Busca por URL/link
- Filtro por cidade (54 municípios)
- Filtro por categoria
- Resultados em tempo real

### ✅ Análise Inteligente
- Modelo TensorFlow de toxicidade
- Análise de crédibilidade regional
- Comparação com banco de dados
- Extração automática de contexto

### ✅ Resultados Detalhados
- Classificação: Verdadeira | Falsa | Inconclusiva
- Nível de confiança (%)
- Fontes que fundamentam a análise
- Contexto regional aplicável
- Sugestões de leitura

### ✅ Interface
- Modo Claro e Escuro (Dark Mode)
- Design responsivo
- Navegação intuitiva
- Acessibilidade completa

---

## 🏛️ Cidades Atendidas

**11 Principais Municípios do Oeste do Paraná:**

| | | | |
|---|---|---|---|
| Cascavel | Foz do Iguaçu | Toledo | Marechal C. Rondon |
| Medianeira | Laranjeiras do Sul | Francisco Beltrão | Pato Branco |
| Matelândia | Santa Tereza do Oeste | Santa Terezinha de Itaipu | Jesuítas |

*Em desenvolvimento: Expansão para cobertura dos 54 municípios da região*

---

## 🛠️ Estrutura do Projeto

```
VerificaOeste-Parana/
├── public/                         # Arquivos estáticos servidos pelo Express
│   ├── index.html                  # Página principal
│   ├── auth.html                   # Página de autenticação
│   ├── history.html                # Histórico de análises
│   ├── css/
│   │   ├── style.css               # Estilos principal
│   │   ├── responsive.css          # Estilos responsivos
│   │   └── results.css             # Estilos dos resultados
│   └── js/
│       ├── main.js                 # Lógica principal do verificador
│       ├── auth.js                 # Autenticação frontend
│       ├── dark-mode.js            # Sistema de Dark Mode
│       ├── history.js              # Histórico de buscas
│       ├── education.js            # Conteúdo educativo
│       └── search-persist.js       # Persistência de buscas
├── src/                            # Backend (Node.js)
│   ├── server.js                   # Bootstrap do servidor
│   ├── app.js                      # Configuração Express
│   ├── config/
│   │   ├── env.js                  # Variáveis de ambiente
│   │   ├── db.js                   # Conexão MongoDB
│   │   └── swagger.js              # Documentação OpenAPI
│   ├── controllers/                # Controladores MVC
│   ├── routes/                     # Definição de rotas
│   ├── models/                     # Modelos Mongoose
│   ├── middlewares/                # Middlewares Express
│   ├── services/                   # Lógica de negócio
│   └── seed/                       # Dados iniciais
├── tests/                          # Testes da API
│   └── testAPI.js                  # Suite de testes completa
├── server.js                       # Wrapper que chama src/server.js
├── package.json                    # Dependências do projeto
├── .env                            # Variáveis de ambiente (versionado com exemplo)
└── README.md                       # Este arquivo
```
├── DARK_MODE.md                # Documentação Dark Mode
├── IMPLEMENTATION_REPORT.md    # Relatório de implementação
└── TODO.md                     # Tarefas futuras
```

---

## 💻 Tecnologias Utilizadas

### Backend
- **Node.js 18+**: Runtime JavaScript
- **Express.js 4.18**: Framework web
- **TensorFlow.js 4.22**: Machine Learning
- **Toxicity Model**: Detecção de linguagem prejudicial

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Styling (com Dark Mode)
- **Bootstrap 5.3**: Framework CSS responsivo
- **Font Awesome 6.0**: Ícones
- **Vanilla JavaScript**: Interatividade

### Extras
- **Axios**: Requisições HTTP
- **Cheerio**: Web scraping
- **dotenv**: Gerenciamento de env vars
- **nodemon**: Desenvolvimento

### Ferramentas
- **Git**: Controle de versão
- **npm**: Gerenciador de pacotes

---

## ⚙️ Desenvolvimento

### Setup Local

```bash
# Clonar projeto
git clone https://github.com/seu-usuario/VerificaOeste-Parana.git

# Instalar dependências
cd VerificaOeste-Parana
npm install

# Criar .env
cp .env.example .env

# Adicionar API keys se necessário
# GOOGLE_API_KEY=sua-chave
# etc...

# Iniciar em modo dev (com hot-reload)
npm run dev

# Ou iniciar servidor normal
npm start
```

### Servidor Rodando
```
✅ Servidor iniciado em http://localhost:3000
🤖 Modelo TensorFlow carregando...
✅ Modelo carregado com sucesso
```

### Teste API
```bash
# Testar análise
curl -X POST http://localhost:3000/api/verificar \
  -H "Content-Type: application/json" \
  -d '{"texto": "Fake news de exemplo"}'
```

---

## 🔌 API

### Endpoints

#### POST `/api/verificar`
Verifica e analisa uma notícia

**Request:**
```json
{
  "texto": "Conteúdo da notícia",
  "link": "https://exemplo.com/noticia",
  "cidade": "Cascavel",
  "categoria": "Política"
}
```

**Response:**
```json
{
  "status": "success",
  "resultado": "falsa",
  "confianca": 0.85,
  "fontes": [
    {
      "titulo": "Fonte 1",
      "url": "https://...",
      "snippet": "..."
    }
  ],
  "analise": {
    "toxicidade": 0.3,
    "credibilidade": "baixa",
    "contexto_regional": true
  }
}
```

#### GET `/api/municipios`
Lista todos os municípios atendidos

**Response:**
```json
{
  "status": "success",
  "total": 54,
  "municipios": ["Cascavel", "Foz do Iguaçu", ...]
}
```

---

## 🌙 Dark Mode

O sistema possui um **Dark Mode completo e otimizado**:

- 🌙 Botão flutuante para alternar tema
- 💾 Preferência salva em localStorage
- 🎨 Paleta pensada para conforto noturno
- ⚡ Transições suaves (300ms)

Para mais informações, veja [DARK_MODE.md](./DARK_MODE.md)

---

## 📦 Deployment

### Opção 1: Heroku

```bash
# Login no Heroku
heroku login

# Criar app
heroku create seu-app-name

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

### Opção 2: Railway / Render / Vercel

Consulte documentação dos serviços.

### Variáveis de Ambiente

Certifique-se de configurar no servidor:
```
NODE_ENV=production
PORT=3000
GOOGLE_API_KEY=sua-chave
```

---

## 🧪 Testes

### Teste Manual

```bash
# Abrir console no navegador (F12)
# Executar no console:
window.darkModeManager.toggleTheme()  // Alternar dark mode
window.darkModeManager.getCurrentTheme()  // Ver tema atual
```

### Teste Automatizado

```bash
npm test
```

---

## 🐛 Conhecidos & Limitações

### Limitações Atuais
- ⏳ Análise pode levar 2-5 segundos
- 🌐 Requer conexão com internet
- 📊 Modelo ML ainda em treinamento
- 📱 Mobile: Algumas animações desabilitadas

### Melhorias Futuras
- [ ] Suporte a múltiplos idiomas
- [ ] Cache de análises
- [ ] Gráficos de trending topics
- [ ] API aberta para desenvolvedores
- [ ] Integração com redes sociais
- [ ] App mobile nativo

---

## 🤝 Contribuindo

### Como Contribuir

1. **Fork** o projeto
2. **Crie uma branch** para sua feature (`git checkout -b feature/NovaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona NovaFeature'`)
4. **Push** para a branch (`git push origin feature/NovaFeature`)
5. **Abra um Pull Request**

### Código de Conduta

Por favor, seja respeitoso e construtivo. Leia nosso [Código de Conduta](#).

### Diretrizes

- ✅ Mantenha o código limpo
- ✅ Adicione comentários em código complexo
- ✅ Teste antes de submeter
- ✅ Atualize documentação conforme necessário

---

## 📄 Licença

Este projeto está licenciado sob a **ISC License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🤝 Suporte

### Precisa de Ajuda?

- 📧 **Email**: contato@verificaoeste.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-usuario/VerificaOeste-Parana/issues)
- 💬 **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/VerificaOeste-Parana/discussions)
- 📱 **WhatsApp**: Suporte via WhatsApp

---

## 👥 Créditos & Agradecimentos

- **Desenvolvedor Principal**: Seu Nome
- **Design**: UI/UX Team
- **Dados**: Fontes regionais confiáveis
- **ML Model**: TensorFlow Community

---

## 📈 Estatísticas

| Métrica | Valor |
|---------|-------|
| Municípios Principal Atendidos | 11 |
| Municípios em Expansão | 54 |
| Fontes Confiáveis | 9+ |
| Precisão do Modelo | 85%+ |
| Tempo de Resposta | 2-5s |

---

## 🔗 Links Úteis

- 🌐 [Website](https://verificaoeste.com)
- 📚 [Documentação Completa](./docs)
- 🐛 [Reportar Bug](https://github.com/seu-usuario/VerificaOeste-Parana/issues)
- 💡 [Sugerir Feature](https://github.com/seu-usuario/VerificaOeste-Parana/issues)
- 📖 [Dark Mode Guide](./DARK_MODE.md)

---

## 📝 Changelog

### v1.0.0 (Fevereiro 2026)
- ✨ Lançamento inicial
- ✨ Sistema de Dark Mode completo
- ✨ Análise com TensorFlow.js
- ✨ Verificação cruzada regional
- ✨ Interface responsiva

### v0.9.0 (Beta)
- 🔧 Testes de API
- 🔧 Integração com fontes

---

## 🎯 Roadmap

- **Q1 2026**: Melhorias de UI/UX
- **Q2 2026**: App mobile
- **Q3 2026**: Integração com redes sociais
- **Q4 2026**: Versão 2.0

---

<div align="center">

### ⭐ Gostou do Projeto?

Deixe uma estrela no GitHub! [⭐ Star](https://github.com/seu-usuario/VerificaOeste-Parana)

---

**Combatendo Fake News no Oeste do Paraná** 

Da serra ao lago, pela verdade. 🗽

---

Feito com ❤️ para o Oeste do Paraná

</div>