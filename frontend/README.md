# EditalCheck — Frontend

Este diretório contém o frontend Next.js do EditalCheck. As alterações deste pacote foram limitadas ao frontend; os arquivos do backend NestJS foram preservados sem edição.

## Requisitos

- Node.js **24.12.0 ou superior**. As dependências Firebase presentes no lockfile declaram esse requisito mínimo.
- npm.
- Backend do Charles em execução no endereço definido em `NEXT_PUBLIC_API_URL`.

## Configuração e execução (Windows / PowerShell)

1. Abra o PowerShell dentro desta pasta `frontend`.
2. Confira se existe o arquivo `.env.local`. Ele já foi incluído neste pacote com os valores de configuração web do Firebase e a URL da API enviados pelo Charles no WhatsApp.
3. Instale as dependências:

   ```powershell
   npm ci
   ```

4. Inicie o frontend:

   ```powershell
   npm run dev
   ```

5. Acesse `http://localhost:3000`.

Para validar o código, use:

```powershell
npm run typecheck
npm run lint
npm run build
```

## Variáveis de ambiente

O `.env.local` já contém `NEXT_PUBLIC_API_URL` e a configuração web do Firebase compartilhada na conversa. Se Charles mudar a porta/endereço da API ou os dados do Firebase, atualize esse arquivo e reinicie o servidor Next.js.

O arquivo `.env.example` serve como modelo sem dados do projeto. As variáveis `NEXT_PUBLIC_*` são disponibilizadas ao código do navegador. Não coloque senhas, tokens administrativos ou arquivos de conta de serviço nelas.

## Credencial Firebase Admin do backend

O arquivo JSON indicado por Charles em `GOOGLE_APPLICATION_CREDENTIALS` é uma credencial privada do Firebase Admin e pertence ao backend. Ele **não** deve ser colocado dentro de `frontend`, dentro de `public`, nem enviado ao Git. O print do WhatsApp mostra que Charles enviou um ZIP com essa credencial, mas esse ZIP não veio como arquivo anexado acessível nesta conversa; por isso, ele não foi recriado nem incluído neste pacote. Charles deve manter essa credencial no ambiente do backend.

## Estado atual das telas

- **Login e cadastro:** Firebase Authentication.
- **Empresa:** o frontend já utiliza as rotas que estavam no projeto (`GET /editalcheckapp/consult` e `POST /editalcheckapp/signup`).
- **Habilitação:** consulta as certidões da empresa e usa dados demonstrativos quando não consegue obter os dados da API.
- **Documentos e Atestados:** interface e dados demonstrativos locais; a persistência depende de rotas e do formato de dados a serem confirmados/implementados pelo responsável pelo backend.

Os avisos de demonstração foram adicionados para não confundir dados locais com dados gravados no banco.
