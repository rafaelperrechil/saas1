import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  lng: 'pt',
  fallbackLng: 'pt',
  ns: ['common'],
  defaultNS: 'common',
  resources: {
    pt: {
      common: {
        'wizard.welcome.title': 'Bem-vindo',
        'wizard.welcome.description': 'Bem-vindo ao assistente de configuração',
        'wizard.organization.title': 'Organização',
        'wizard.organization.subtitle': 'Informações da sua organização',
        'wizard.organization.name': 'Nome da Organização',
        'wizard.organization.employeesCount': 'Número de Funcionários',
        'wizard.organization.country': 'País',
        'wizard.organization.city': 'Cidade',
        'wizard.organization.niche': 'Nicho',
        'wizard.organization.errors.nameRequired': 'Nome da organização é obrigatório',
        'wizard.organization.errors.employeesRequired': 'Número de funcionários é obrigatório',
        'wizard.organization.errors.countryRequired': 'País é obrigatório',
        'wizard.organization.errors.cityRequired': 'Cidade é obrigatória',
        'wizard.organization.errors.nicheRequired': 'Nicho é obrigatório',
        'wizard.organization.errors.loadingNiches': 'Erro ao carregar nichos',
        'wizard.branch.title': 'Nome da Filial',
        'wizard.branch.subtitle': 'Informações da sua filial',
        'wizard.branch.name': 'Nome da Filial',
        'wizard.branch.description':
          'Cada organização tem apenas uma unidade por padrão. Adicionar mais sob consulta.',
        'wizard.branch.errors.required': 'Nome da filial é obrigatório',
        'wizard.departments.addDepartment': 'Adicionar Departamento',
        'wizard.departments.newDepartment': 'Novo Departamento',
        'wizard.departments.responsibleEmail': 'E-mail do Responsável',
        'wizard.environments.addEnvironment': 'Adicionar Ambiente',
        'wizard.common.next': 'Próximo',
        'wizard.common.back': 'Voltar',
        'wizard.common.save': 'Salvar',
        'wizard.common.finish': 'Finalizar',
        'wizard.completion.title': 'Concluído',
        'wizard.completion.message': 'Configuração concluída com sucesso',
        'wizard.completion.redirect': 'Redirecionando...',
        'wizard.departments.responsibles': 'Responsáveis',
        'wizard.departments.responsiblesAdded': 'Responsáveis adicionados',
        'wizard.common.add': 'Adicionar',
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
