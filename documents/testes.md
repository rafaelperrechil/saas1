
## Testes de Listagem (page.tsx)

1. **Renderização da Lista**

   - Deve renderizar a tabela de checklists quando houver dados
   - Deve mostrar loading spinner durante o carregamento
   - Deve chamar getChecklistsByBranch com o branchId correto
   - Deve atualizar a lista após toggle de status
   - Deve mostrar mensagem de sucesso após toggle de status
   - Deve mostrar mensagem de erro quando o toggle falhar

## Testes de Cadastro (add/page.tsx)

- Deve validar campos obrigatórios (nome, frequência, horário, dias da semana, responsáveis, seções, ambiente)
- Deve mostrar mensagens de erro para campos inválidos
- Deve permitir avançar para próximo passo apenas com campos válidos
- Deve adicionar nova seção corretamente
- Deve remover seção existente
- Deve atualizar nome da seção
- Deve validar seção vazia
- Deve adicionar nova questão à seção
- Deve remover questão existente
- Deve validar campos obrigatórios da questão
- Deve aplicar labels padrão baseado no tipo de resposta
- Deve chamar API com dados corretos
- Deve mostrar mensagem de sucesso após salvar
- Deve redirecionar para lista após salvar
- Deve mostrar mensagem de erro quando salvar falhar
- Deve permitir reordenar seções via drag and drop
- Deve manter ordem correta após reordenação
- Deve permitir reordenar questões dentro da mesma seção
- Deve permitir mover questão entre seções diferentes
- Deve manter ordem correta após reordenação

## Testes de Edição (edit/[id]/page.tsx)

   - Deve carregar dados do checklist existente
   - Deve validar campos obrigatórios
   - Deve mostrar mensagens de erro para campos inválidos
   - Deve permitir avançar para próximo passo apenas com campos válidos
   - Deve carregar seções existentes
   - Deve adicionar nova seção
   - Deve remover seção existente
   - Deve atualizar nome da seção
   - Deve validar seção vazia
   - Deve carregar questões existentes
   - Deve adicionar nova questão
   - Deve remover questão existente
   - Deve validar campos obrigatórios da questão
   - Deve aplicar labels padrão baseado no tipo de resposta
   - Deve chamar API com dados corretos
   - Deve mostrar mensagem de sucesso após atualizar
   - Deve redirecionar para lista após atualizar
   - Deve mostrar mensagem de erro quando atualizar falhar
   - Deve permitir reordenar seções via drag and drop
   - Deve manter ordem correta após reordenação
   - Deve permitir reordenar questões dentro da mesma seção
   - Deve permitir mover questão entre seções diferentes
   - Deve manter ordem correta após reordenação
