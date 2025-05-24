# Testes dos CRUDs Administrativos

## Testes Gerais (Aplicam-se a todos os CRUDs)

- [ ] Verificar se apenas usuários autenticados podem acessar as páginas
- [ ] Verificar se apenas administradores têm acesso às funcionalidades
- [ ] Testar responsividade em diferentes tamanhos de tela
- [ ] Verificar se os loadings são exibidos corretamente durante operações
- [ ] Verificar se as mensagens de sucesso/erro são exibidas corretamente
- [ ] Testar a validação de campos obrigatórios
- [ ] Verificar se a tabela atualiza automaticamente após operações
- [ ] Testar a ordenação das tabelas (se implementada)
- [ ] Testar a paginação das tabelas (se implementada)
- [ ] Verificar se os modais fecham corretamente após operações
- [ ] Testar o comportamento offline
- [ ] Verificar se os botões são desabilitados durante operações

## Usuários

### Listagem

- [ ] Verificar se todos os usuários são listados corretamente
- [ ] Verificar se as informações exibidas estão corretas (nome, email, perfil, data de criação)

### Criação

- [ ] Testar criação com todos os campos preenchidos corretamente
- [ ] Verificar validação de email único
- [ ] Testar validação de senha (comprimento mínimo, caracteres especiais, etc)
- [ ] Verificar se o perfil é atribuído corretamente
- [ ] Testar criação com campos obrigatórios vazios
- [ ] Verificar se o email é validado corretamente

### Edição

- [ ] Testar edição de todos os campos
- [ ] Verificar se a senha só é alterada quando preenchida
- [ ] Testar alteração de perfil
- [ ] Verificar se o email continua único após edição
- [ ] Testar edição mantendo campos opcionais vazios

### Exclusão

- [ ] Verificar se a confirmação de exclusão é exibida
- [ ] Testar exclusão de usuário
- [ ] Testar cancelamento da exclusão

## Perfis

### Listagem

- [ ] Verificar se todos os perfis são listados
- [ ] Verificar se as informações estão corretas
- [ ] Testar ordenação por nome (se implementada)

### Criação

- [ ] Testar criação com nome válido
- [ ] Verificar validação de nome único
- [ ] Testar criação com nome vazio
- [ ] Verificar limite de caracteres do nome

### Edição

- [ ] Testar edição do nome
- [ ] Verificar se o nome continua único após edição
- [ ] Testar edição com nome vazio
- [ ] Verificar se as permissões são mantidas após edição

### Exclusão

- [ ] Verificar se a confirmação de exclusão é exibida
- [ ] Testar exclusão de perfil
- [ ] Verificar se não é possível excluir perfis em uso
- [ ] Testar cancelamento da exclusão

## Planos

### Listagem

- [ ] Verificar se todos os planos são listados
- [ ] Verificar se os valores são exibidos corretamente formatados

### Criação

- [ ] Testar criação com todos os campos preenchidos
- [ ] Verificar validação de nome único
- [ ] Testar valores negativos nos campos numéricos
- [ ] Verificar criação de plano personalizado
- [ ] Testar limites dos campos numéricos
- [ ] Verificar validação de preços
- [ ] Testar relação entre unidades incluídas e preço extra

### Edição

- [ ] Testar edição de todos os campos
- [ ] Verificar se os valores numéricos são validados
- [ ] Testar alteração de plano normal para personalizado
- [ ] Verificar se o nome continua único após edição
- [ ] Testar edição de preços e limites
- [ ] Verificar se as alterações afetam usuários existentes

### Exclusão

- [ ] Verificar se a confirmação de exclusão é exibida
- [ ] Testar exclusão de plano
- [ ] Verificar se não é possível excluir planos em uso
- [ ] Testar cancelamento da exclusão

## Testes de Integração

- [ ] Verificar se a alteração de perfil reflete nas permissões do usuário
- [ ] Testar se a exclusão de perfil não deixa usuários órfãos
- [ ] Verificar se a alteração de plano reflete nos limites dos usuários
- [ ] Testar a criação de usuário com diferentes perfis e planos
- [ ] Verificar integridade referencial entre as entidades

## Testes de Segurança

- [ ] Verificar proteção contra XSS nos campos de entrada
- [ ] Testar injeção de SQL nos formulários
- [ ] Verificar se as rotas são protegidas
- [ ] Testar tentativas de acesso não autorizado
- [ ] Verificar se as senhas são armazenadas com hash
- [ ] Testar limites de requisições (rate limiting)
- [ ] Verificar se os tokens são validados corretamente

## Testes de Performance

- [ ] Verificar tempo de carregamento das listagens
- [ ] Testar performance com grande volume de dados
- [ ] Verificar consumo de memória
- [ ] Testar múltiplas operações simultâneas
- [ ] Verificar tempo de resposta das operações CRUD
