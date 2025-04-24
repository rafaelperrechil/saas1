# SaaS Platform

Uma plataforma SaaS moderna construída com Next.js, Material-UI e Prisma.

## Tecnologias Utilizadas

- Next.js 13 (App Router)
- TypeScript
- Material-UI
- Prisma (MySQL)
- NextAuth.js
- SWR

## Funcionalidades

- Autenticação completa com NextAuth.js
- Gerenciamento de usuários
- Gerenciamento de perfis
- Dashboard com estatísticas
- Interface responsiva
- Proteção de rotas
- Validação de formulários

## Pré-requisitos

- Node.js 18+
- MySQL

## Configuração

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/saas1.git
cd saas1
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

4. Execute as migrações do banco de dados:

```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:3000`.

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a versão de produção
- `npm start` - Inicia o servidor de produção
- `npm run lint` - Executa a verificação de linting
- `npm run create-admin` - Cria o usuário administrador inicial

## Estrutura do Projeto

```
src/
  ├── app/              # Rotas e componentes da aplicação
  ├── components/       # Componentes reutilizáveis
  ├── lib/             # Utilitários e configurações
  └── types/           # Definições de tipos TypeScript
```

## Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -am 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
