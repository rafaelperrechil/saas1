- ao criar uma conta:
  - criar um subscriptions para o user com o plano com o name igual a 'Free'
- caracteristicas dos planos:
  - criar uma tabela characteristics com os campos id, descricao
  - criar uma tabela plans_characteristics com os campos plansid, characteristicid e hascharacteristic
  - criar as variaveis no /pt/translation.json das caracteristicas
- na tabela checklist_items
  - adicionar os campos: textmandatory, photomandatory, videomandatory
- na criacao de checklists
  - em cada pergunta colocar um icone se a observação é obrigatoria
  - em cada pergunta colocar um icone se uma foto é obrigatoria
  - em cada pergunta colocar um icone se um video é obrigatoria
- ao fazer uma inspeção de checklist

  - validar e mostrar visualmente quais perguntas tem: photo, texto ou video obrigatorios
  - salvar fotos e videos enviados localmmente em uploads/[organizationid]/photos e upload/[organizationid]/movies
  - criar um tichekt para todas as respostas negativas respondidas

- em tichekts
  - ao alterar o status, salvar o historico do status atual, status novo, quem alterou equando

dashboard geral

#box checklist

- filtro de data no topo da pagina (ao carregar o dashboard inicia com a data atual)
- lista dos checklists a serem executados no dia, mostrando se ja vou executado ou nao, se sim mostrar taxa de respostas positivas e negativas e quem executou e em qual horario.
- ao lado da lista, grafico de pizza com a quantidade de perguntas respondidas positvas/negativas de todos os checklists do dia

#box tickets

- lista com os tickets abertos no dia
- ao lado da lista, fazer uma lista das perguntas nao conformes
