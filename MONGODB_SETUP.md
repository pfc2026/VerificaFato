# 🗄️ Configuração do MongoDB

## Problema Identificado

O servidor Node.js requer uma conexão com MongoDB para iniciar. Atualmente, MongoDB não está instalado ou não está rodando em `localhost:27017`.

**Erro Esperado na Inicialização:**
```
[nodemon] starting `node server.js`
(servidor trava aguardando conexão MongoDB)
```

**Todos os testes falham** porque o servidor não consegue iniciar sem MongoDB.

---

## ✅ Solução 1: MongoDB Local (Windows)

### Instalação

#### 1. Download e Instalação
1. Acesse [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Selecione:
   - **Version:** Latest (recomendado 7.0+)
   - **OS:** Windows
   - **Package:** msi
3. Execute o instalador `.msi`
4. Siga as instruções (instale como serviço Windows)

#### 2. Verificar Instalação

```powershell
# Verificar se o serviço está rodando
Get-Service MongoDB

# Se não estiver rodando, inicie:
Start-Service MongoDB

# Verificar status
Get-Service MongoDB | Select-Object Status, Name
```

#### 3. Verificar Conexão

```bash
# Testar conexão com MongoDB (requer MongoDB CLI tools)
mongosh --eval "db.adminCommand('ping')"
```

**Saída esperada:**
```json
{ ok: 1 }
```

---

## ✅ Solução 2: MongoDB Docker (Recomendado para Desenvolvimento)

Se tiver Docker instalado, use:

```bash
# Criar e rodar MongoDB container
docker run -d `
  --name mongodb `
  -p 27017:27017 `
  -e MONGO_INITDB_ROOT_USERNAME=admin `
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 `
  mongo:7.0

# Verificar se está rodando
docker ps | findstr mongodb

# Parar o container (quando terminar)
docker stop mongodb

# Iniciar novamente
docker start mongodb
```

---

## ✅ Solução 3: MongoDB Atlas (Nuvem - SEM instalação local)

### Passo a Passo

1. Acesse [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Crie uma conta gratuita
3. Crie um novo projeto e cluster (tier gratuito M0)
4. Configure:
   - **Username:** seu_usuario
   - **Password:** sua_senha_segura
5. Obtenha a connection string (parecida com):
   ```
   mongodb+srv://seu_usuario:sua_senha@cluster0.xxxxx.mongodb.net/pfc2026ifpr_db?retryWrites=true&w=majority
   ```

6. **Atualize seu `.env`:**
   ```env
   MONGODB_URI=mongodb+srv://seu_usuario:sua_senha@cluster0.xxxxx.mongodb.net/pfc2026ifpr_db?retryWrites=true&w=majority
   ```

7. Teste a conexão executando o servidor:
   ```bash
   npm run dev
   ```

---

## 🔍 Diagnosticar Problemas

### Erro: "connect ECONNREFUSED 127.0.0.1:27017"

**Significa:** MongoDB não está rodando ou não está na porta 27017

**Solução:**
```bash
# Verificar se está rodando
Get-Service MongoDB

# Iniciar MongoDB
Start-Service MongoDB

# Aguarde alguns segundos
Start-Sleep -Seconds 3

# Tente novamente
npm run dev
```

### Erro: "MongooseError: Cannot connect to MongoDB"

**Significa:** Problema de credenciais ou URL de conexão

**Solução:**
1. Verif ique a `MONGODB_URI` em `.env`
2. Para MongoDB local, use: `mongodb://localhost:27017/pfc2026ifpr_db`
3. Para MongoDB Atlas, use a string fornecida no dashboard

### Erro: "Cannot find module 'mongodb'"

**Significa:** Dependências npm não foram instaladas

**Solução:**
```bash
npm install
```

---

## 📋 Checklist de Configuração

- [ ] MongoDB instalado (local ou Docker)
- [ ] Serviço MongoDB está rodando (`Get-Service MongoDB`)
- [ ] `.env` aponta para a URL correta de MongoDB
- [ ] Teste de conexão passa: `mongosh --eval "db.adminCommand('ping')"`
- [ ] Servidor inicia sem erros: `npm run dev`
- [ ] Testes passam: `npm test`

---

## 🚀 Iniciar Servidor com MongoDB

Após configurar MongoDB:

```bash
# Desenvolvimento (com hot-reload)
npm run dev

# Produção
npm start

# Executar testes
npm test
```

**Saída esperada no primeiro inicio:**
```
[nodemon] starting `node server.js`
Servidor Express rodando em http://localhost:3000
Conectado ao MongoDB em mongodb://localhost:27017/pfc2026ifpr_db
Seed admin criado/verificado
```

---

## 📞 Suporte

Se continuar com problemas:

1. Verifique se MongoDB está realmente rodando
2. Confira se a porta 27017 não está bloqueada (firewall)
3. Tente conectar direto: `mongosh mongodb://localhost:27017`
4. Veja os logs: `npm run dev` (mostra detalhes da conexão)

---

**Próximos Passos:**
1. Configure MongoDB usando uma das soluções acima
2. Execute `npm run dev` para iniciar o servidor
3. Acesse http://localhost:3000 no navegador
4. Execute `npm test` para validar todos os endpoints
