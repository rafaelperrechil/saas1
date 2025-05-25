'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormHelperText,
  Snackbar,
  Alert,
  Paper,
  Modal,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { getChecklistResponseTypes } from '@/services/checklist_response_type.service';
import { departmentService } from '@/services/department.service';
import { userService } from '@/services/user.service';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { environmentService } from '@/services/environment.service';

const getDefaultLabels = (type: string) => {
  switch (type) {
    case 'binary':
      return { positive: 'Sim', negative: 'Não' };
    case 'status':
      return { positive: 'OK', negative: 'Falha' };
    case 'guest':
      return { positive: 'Presente', negative: 'Ausente' };
    case 'presence':
      return { positive: 'Disponível', negative: 'Indisponível' };
    default:
      return { positive: 'Positivo', negative: 'Negativo' };
  }
};

interface Question {
  id: string;
  text: string;
  responseType: string;
  positiveLabel: string;
  negativeLabel: string;
  department: string;
}

interface Section {
  id: string;
  name: string;
  questions: Question[];
}

interface Environment {
  id: string;
  name: string;
  position: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

function SectionBox({
  section,
  onUpdateQuestions,
  onRemoveSection,
  onUpdateSectionName,
  responseTypes,
  departments,
  loadingTypes,
  loadingDepartments,
  sectionIndex,
  provided,
  innerRef,
  questionsDroppableId,
}: {
  section: Section;
  onUpdateQuestions: (questions: Question[]) => void;
  onRemoveSection: () => void;
  onUpdateSectionName: (name: string) => void;
  responseTypes: any[];
  departments: any[];
  loadingTypes: boolean;
  loadingDepartments: boolean;
  sectionIndex: number;
  provided: any;
  innerRef: any;
  questionsDroppableId: string;
}) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { t } = useTranslation();

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      text: '',
      responseType: 'binary',
      positiveLabel: 'Sim',
      negativeLabel: 'Não',
      department: '',
    };
    onUpdateQuestions([...section.questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    onUpdateQuestions(section.questions.filter((q) => q.id !== id));
  };

  const updateQuestionText = (id: string, text: string) => {
    onUpdateQuestions(section.questions.map((q) => (q.id === id ? { ...q, text } : q)));
    if (errors[`question-${id}`]) {
      setErrors({ ...errors, [`question-${id}`]: '' });
    }
  };

  const updateResponseType = (id: string, responseType: string) => {
    const type = responseTypes.find((t) => t.id === responseType);
    const defaultLabels = type
      ? { positive: type.positiveLabel, negative: type.negativeLabel }
      : { positive: '', negative: '' };
    onUpdateQuestions(
      section.questions.map((q) =>
        q.id === id
          ? {
              ...q,
              responseType,
              positiveLabel: defaultLabels.positive,
              negativeLabel: defaultLabels.negative,
            }
          : q
      )
    );
  };

  const updatePositiveLabel = (id: string, positiveLabel: string) => {
    onUpdateQuestions(section.questions.map((q) => (q.id === id ? { ...q, positiveLabel } : q)));
  };

  const updateNegativeLabel = (id: string, negativeLabel: string) => {
    onUpdateQuestions(section.questions.map((q) => (q.id === id ? { ...q, negativeLabel } : q)));
  };

  const updateDepartment = (id: string, department: string) => {
    onUpdateQuestions(section.questions.map((q) => (q.id === id ? { ...q, department } : q)));
  };

  return (
    <Box
      ref={innerRef}
      {...provided.draggableProps}
      sx={{ mb: 4, border: '1px solid #eee', borderRadius: 2, p: 2, background: '#fafbfc' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          variant="standard"
          value={section.name}
          onChange={(e) => onUpdateSectionName(e.target.value)}
          InputProps={{ disableUnderline: false, style: { fontSize: 22, fontWeight: 600 } }}
          sx={{ flex: 1, fontWeight: 600, fontSize: 22, mr: 2 }}
        />
        <IconButton color="error" onClick={onRemoveSection}>
          <DeleteIcon />
        </IconButton>
        <span {...provided.dragHandleProps} style={{ cursor: 'grab', marginLeft: 8 }}>
          <DragIndicatorIcon />
        </span>
      </Box>
      {/* Box de perguntas */}
      <Droppable droppableId={questionsDroppableId} type="question">
        {(dropProvided) => (
          <Box ref={dropProvided.innerRef} {...dropProvided.droppableProps}>
            {section.questions.length === 0 && (
              <Paper
                variant="outlined"
                sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', mb: 2 }}
              >
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Ainda não há perguntas neste checklist.
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={addQuestion}
                  sx={{ fontWeight: 700 }}
                >
                  Adicionar Primeira Pergunta
                </Button>
              </Paper>
            )}
            {section.questions.map((question, qIdx) => (
              <Draggable key={question.id} draggableId={question.id} index={qIdx}>
                {(qProvided) => (
                  <Card
                    ref={qProvided.innerRef}
                    {...qProvided.draggableProps}
                    sx={{
                      my: 2,
                      p: 2,
                      position: 'relative',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span {...qProvided.dragHandleProps} style={{ cursor: 'grab' }}>
                        <DragIndicatorIcon />
                      </span>
                      <TextField
                        fullWidth
                        id={`question-text-${question.id}`}
                        label={t('checklists.questions.text')}
                        value={question.text}
                        onChange={(e) => updateQuestionText(question.id, e.target.value)}
                        error={!!errors[`question-${question.id}`]}
                        helperText={errors[`question-${question.id}`]}
                        sx={{ minWidth: 220, maxWidth: 400 }}
                      />
                      <FormControl sx={{ minWidth: 160, flex: 1 }}>
                        <InputLabel>{t('checklists.questions.responseType')}</InputLabel>
                        <Select
                          id={`response-type-${question.id}`}
                          label={t('checklists.questions.responseType')}
                          value={question.responseType}
                          onChange={(e) => updateResponseType(question.id, e.target.value)}
                          disabled={loadingTypes}
                        >
                          {loadingTypes ? (
                            <MenuItem value="" disabled>
                              {t('common.saving')}
                            </MenuItem>
                          ) : (
                            responseTypes.map((type) => (
                              <MenuItem key={type.id} value={type.id}>
                                {type.name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                      <FormControl
                        id={`department-select-${question.id}`}
                        sx={{ minWidth: 180, flex: 1 }}
                        error={!!errors[`department-${question.id}`]}
                      >
                        <InputLabel>{t('checklists.questions.department')}</InputLabel>
                        <Select
                          label={t('checklists.questions.department')}
                          value={question.department}
                          onChange={(e) => updateDepartment(question.id, e.target.value)}
                          disabled={loadingDepartments}
                        >
                          {loadingDepartments ? (
                            <MenuItem value="" disabled>
                              {t('common.saving')}
                            </MenuItem>
                          ) : (
                            departments.map((dept) => (
                              <MenuItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                        {errors[`department-${question.id}`] && (
                          <FormHelperText>{errors[`department-${question.id}`]}</FormHelperText>
                        )}
                      </FormControl>
                      <IconButton
                        size="small"
                        sx={{
                          color: 'error.main',
                          '&:hover': { bgcolor: 'error.light', color: 'white' },
                        }}
                        onClick={() => removeQuestion(question.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    {/* Caso o tipo de resposta seja customizado, mostrar os campos de rótulo embaixo, mas em linha também */}
                    {question.responseType &&
                      responseTypes.find((t) => t.id === question.responseType)?.name ===
                        'Customizado' && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <TextField
                            fullWidth
                            id={`positive-label-${question.id}`}
                            label={t('checklists.questions.positiveLabel')}
                            value={question.positiveLabel}
                            onChange={(e) => updatePositiveLabel(question.id, e.target.value)}
                          />
                          <TextField
                            fullWidth
                            id={`negative-label-${question.id}`}
                            label={t('checklists.questions.negativeLabel')}
                            value={question.negativeLabel}
                            onChange={(e) => updateNegativeLabel(question.id, e.target.value)}
                          />
                        </Box>
                      )}
                  </Card>
                )}
              </Draggable>
            ))}
            {dropProvided.placeholder}
            {section.questions.length > 0 && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={addQuestion}
                sx={{ mt: 2, fontWeight: 700 }}
              >
                {t('checklists.questions.add')}
              </Button>
            )}
          </Box>
        )}
      </Droppable>
    </Box>
  );
}

export default function AddChecklistPage() {
  const { data: session } = useSession();
  const [checklistName, setChecklistName] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [responseTypes, setResponseTypes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [responsibles, setResponsibles] = useState<User[]>([]);
  const [frequency, setFrequency] = useState('diario');
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [executionTime, setExecutionTime] = useState('08:00');
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<any>({});
  const { t } = useTranslation();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('');
  const [loadingEnvironments, setLoadingEnvironments] = useState(true);

  const steps = [t('checklists.steps.general'), t('checklists.steps.checklist')];

  React.useEffect(() => {
    setLoadingTypes(true);
    getChecklistResponseTypes().then((data) => {
      setResponseTypes(data || []);
      setLoadingTypes(false);
    });
  }, []);

  useEffect(() => {
    if (session?.user?.branch?.id) {
      setLoadingEnvironments(true);
      environmentService
        .getEnvironments()
        .then((response) => {
          if (response.data) {
            setEnvironments(response.data);
            if (response.data.length > 0) {
              setSelectedEnvironment(response.data[0].id);
            }
          } else if (response.error) {
            console.error('Erro ao carregar ambientes:', response.error);
          }
          setLoadingEnvironments(false);
        })
        .catch((error) => {
          console.error('Erro ao chamar environmentService:', error);
          setLoadingEnvironments(false);
        });
    } else {
      console.log('Branch ID não encontrado na sessão');
    }
  }, [session?.user?.branch?.id]);

  React.useEffect(() => {
    if (session?.user?.branch?.id) {
      setLoadingDepartments(true);
      departmentService.getDepartmentsByBranch(session.user.branch.id).then((data) => {
        setDepartments(data || []);
        setLoadingDepartments(false);
      });
    }
  }, [session?.user?.branch?.id]);

  React.useEffect(() => {
    const orgId = session?.user?.branch?.organizationId;
    if (orgId) {
      setLoadingUsers(true);
      userService.getUsersByOrganization(orgId).then((data) => {
        setUsers((data as User[]) || []);
        setLoadingUsers(false);
      });
    }
  }, [session?.user?.branch?.organizationId]);

  const handleOpenSectionModal = () => setSectionModalOpen(true);
  const handleCloseSectionModal = () => {
    setSectionModalOpen(false);
    setSectionName('');
  };
  const handleAddSection = () => {
    if (!sectionName.trim()) return;
    setSections([
      ...sections,
      { id: `section-${Date.now()}`, name: sectionName.trim(), questions: [] },
    ]);
    handleCloseSectionModal();
  };
  const handleUpdateSectionQuestions = (sectionId: string, questions: Question[]) => {
    setSections(sections.map((s) => (s.id === sectionId ? { ...s, questions } : s)));
  };
  const handleRemoveSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };
  const handleUpdateSectionName = (sectionId: string, name: string) => {
    setSections(sections.map((s) => (s.id === sectionId ? { ...s, name } : s)));
  };

  // Drag and drop handlers
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    // Section drag
    if (result.type === 'section') {
      const newSections = Array.from(sections);
      const [removed] = newSections.splice(result.source.index, 1);
      newSections.splice(result.destination.index, 0, removed);
      setSections(newSections);
      return;
    }
    // Question drag (dentro ou entre sections)
    const sourceSectionIdx = sections.findIndex(
      (s) => `section-${s.id}` === result.source.droppableId
    );
    const destSectionIdx = sections.findIndex(
      (s) => `section-${s.id}` === result.destination!.droppableId
    );
    if (sourceSectionIdx === -1 || destSectionIdx === -1) return;
    const sourceSection = sections[sourceSectionIdx];
    const destSection = sections[destSectionIdx];
    const sourceQuestions = Array.from(sourceSection.questions);
    const [removed] = sourceQuestions.splice(result.source.index, 1);
    if (sourceSectionIdx === destSectionIdx) {
      // reorder dentro da mesma section
      sourceQuestions.splice(result.destination.index, 0, removed);
      const newSections = [...sections];
      newSections[sourceSectionIdx] = { ...sourceSection, questions: sourceQuestions };
      setSections(newSections);
    } else {
      // mover para outra section
      const destQuestions = Array.from(destSection.questions);
      destQuestions.splice(result.destination.index, 0, removed);
      const newSections = [...sections];
      newSections[sourceSectionIdx] = { ...sourceSection, questions: sourceQuestions };
      newSections[destSectionIdx] = { ...destSection, questions: destQuestions };
      setSections(newSections);
    }
  };

  function validateStep1() {
    const newErrors: any = {};
    if (!checklistName.trim()) newErrors.checklistName = t('checklists.errors.nameRequired');
    if (responsibles.length === 0)
      newErrors.responsibles = t('checklists.errors.responsiblesRequired');
    if (!frequency) newErrors.frequency = t('checklists.errors.frequencyRequired');
    if (weekdays.length === 0) newErrors.weekdays = t('checklists.errors.weekdaysRequired');
    if (!executionTime) newErrors.executionTime = t('checklists.errors.timeRequired');
    if (!selectedEnvironment) newErrors.environment = t('checklists.errors.environmentRequired');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSaveChecklist = async () => {
    try {
      if (sections.length === 0) {
        setErrors({ ...errors, sections: t('checklists.errors.sectionsRequired') });
        return;
      }

      // Verificar se todas as seções têm pelo menos uma pergunta
      const sectionsWithoutQuestions = sections.filter((section) => section.questions.length === 0);
      if (sectionsWithoutQuestions.length > 0) {
        setErrors({
          ...errors,
          sections: t('checklists.errors.sectionsWithoutQuestions', {
            sections: sectionsWithoutQuestions.map((s) => s.name).join(', '),
          }),
        });
        return;
      }

      // Verificar se todas as perguntas têm um departamento responsável
      const questionsWithoutDepartment = sections.flatMap((section) =>
        section.questions.filter((question) => !question.department)
      );
      if (questionsWithoutDepartment.length > 0) {
        setErrors({
          ...errors,
          sections: t('checklists.errors.questionsWithoutDepartment', {
            questions: questionsWithoutDepartment.map((q) => q.text).join(', '),
          }),
        });
        return;
      }

      // Mapear a frequência para o enum correto
      const frequencyMap: {
        [key: string]: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'SEMESTRAL' | 'ANNUAL';
      } = {
        diario: 'DAILY',
        semanal: 'WEEKLY',
        mensal: 'MONTHLY',
        trimestral: 'MONTHLY', // Usando MONTHLY como fallback
        semestral: 'SEMESTRAL',
        anual: 'ANNUAL',
      };

      const data = {
        name: checklistName,
        description,
        frequency: frequencyMap[frequency] || 'DAILY',
        time: executionTime,
        daysOfWeek: weekdays,
        responsibles,
        sections,
        environmentId: selectedEnvironment,
      };

      console.log('Dados sendo enviados:', data);

      // Verificar se todos os campos obrigatórios estão preenchidos
      const missingFields = [];
      if (!data.name) missingFields.push('name');
      if (!data.frequency) missingFields.push('frequency');
      if (!data.time) missingFields.push('time');
      if (!data.daysOfWeek || data.daysOfWeek.length === 0) missingFields.push('daysOfWeek');
      if (!data.responsibles || data.responsibles.length === 0) missingFields.push('responsibles');
      if (!data.sections || data.sections.length === 0) missingFields.push('sections');
      if (!data.environmentId) missingFields.push('environmentId');

      if (missingFields.length > 0) {
        setErrorMessage(t('checklists.errors.missingFields', { fields: missingFields.join(', ') }));
        return;
      }

      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar checklist');
      }

      setSuccessMessage(t('checklists.success.saved'));
      setTimeout(() => {
        router.push('/panel/checklists');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao salvar checklist:', error);
      setErrorMessage(error.message || t('checklists.errors.saveError'));
    }
  };

  return (
    <Box sx={{ width: '100%', py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        {t('checklists.title')}
      </Typography>
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {step === 0 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            {t('checklists.steps.general')}
          </Typography>
          <TextField
            fullWidth
            id="checklist-name-input"
            label={t('checklists.fields.name')}
            margin="normal"
            value={checklistName}
            onChange={(e) => setChecklistName(e.target.value)}
            sx={{ mb: 2 }}
            error={!!errors.checklistName}
            helperText={errors.checklistName}
            inputProps={{ 'data-testid': 'checklist-name-input' }}
          />
          <TextField
            fullWidth
            id="checklist-description-input"
            label={t('checklists.fields.description')}
            multiline
            rows={3}
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.environment}>
            <InputLabel>{t('checklists.fields.environment')}</InputLabel>
            <Select
              id="environment-select"
              data-testid="environment-select"
              label={t('checklists.fields.environment')}
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              disabled={loadingEnvironments}
            >
              {loadingEnvironments ? (
                <MenuItem value="" disabled>
                  Carregando...
                </MenuItem>
              ) : environments.length === 0 ? (
                <MenuItem value="" disabled>
                  Nenhum ambiente disponível
                </MenuItem>
              ) : (
                environments.map((env) => {
                  return (
                    <MenuItem key={env.id} value={env.id}>
                      {env.name}
                    </MenuItem>
                  );
                })
              )}
            </Select>
            {errors.environment && <FormHelperText>{errors.environment}</FormHelperText>}
          </FormControl>
          <Autocomplete
            id="responsibles-autocomplete"
            data-testid="responsibles-autocomplete"
            multiple
            options={users}
            getOptionLabel={(option) => option.name + (option.email ? ` (${option.email})` : '')}
            value={responsibles}
            onChange={(_, value) => setResponsibles(value)}
            loading={loadingUsers}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('checklists.fields.responsibles')}
                placeholder={t('checklists.fields.responsibles')}
                margin="normal"
                error={!!errors.responsibles}
                helperText={errors.responsibles}
              />
            )}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.frequency}>
            <InputLabel>{t('checklists.fields.frequency')}</InputLabel>
            <Select
              id="frequency-select"
              data-testid="frequency-select"
              label={t('checklists.fields.frequency')}
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <MenuItem value="diario">{t('checklists.frequencies.daily')}</MenuItem>
              <MenuItem value="semanal">{t('checklists.frequencies.weekly')}</MenuItem>
              <MenuItem value="mensal">{t('checklists.frequencies.monthly')}</MenuItem>
              <MenuItem value="trimestral">{t('checklists.frequencies.quarterly')}</MenuItem>
              <MenuItem value="semestral">{t('checklists.frequencies.semiannual')}</MenuItem>
              <MenuItem value="anual">{t('checklists.frequencies.annual')}</MenuItem>
            </Select>
            {errors.frequency && <FormHelperText>{errors.frequency}</FormHelperText>}
          </FormControl>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 2 }}>
              <Typography variant="subtitle1">{t('checklists.fields.weekdays')}:</Typography>
              <TextField
                type="time"
                label={t('checklists.fields.time')}
                value={executionTime}
                onChange={(e) => setExecutionTime(e.target.value)}
                size="small"
                sx={{ width: 130 }}
                InputLabelProps={{ shrink: true }}
                error={!!errors.executionTime}
                helperText={errors.executionTime}
                inputProps={{ 'data-testid': 'execution-time-input' }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {[
                t('checklists.weekdays.sun'),
                t('checklists.weekdays.mon'),
                t('checklists.weekdays.tue'),
                t('checklists.weekdays.wed'),
                t('checklists.weekdays.thu'),
                t('checklists.weekdays.fri'),
                t('checklists.weekdays.sat'),
              ].map((day, idx) => (
                <FormControl key={day} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox
                    checked={weekdays.includes(idx.toString())}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setWeekdays([...weekdays, idx.toString()]);
                      } else {
                        setWeekdays(weekdays.filter((w) => w !== idx.toString()));
                      }
                    }}
                  />
                  <Typography variant="body2">{day}</Typography>
                </FormControl>
              ))}
            </Box>
            {errors.weekdays && <FormHelperText error>{errors.weekdays}</FormHelperText>}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant="outlined" href="/panel/checklists">
              {t('checklists.buttons.cancel')}
            </Button>
            <Button
              data-testid="next-step-button"
              variant="contained"
              color="primary"
              onClick={() => {
                if (validateStep1()) setStep(1);
              }}
            >
              {t('checklists.buttons.next')}
            </Button>
          </Box>
        </Box>
      )}

      {step === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
            {t('checklists.steps.checklist')}
          </Typography>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="sections-droppable" type="section">
              {(provided) => (
                <Box ref={provided.innerRef} {...provided.droppableProps} sx={{ mb: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      id="add-section-button"
                      data-testid="add-section-button"
                      variant="outlined"
                      onClick={handleOpenSectionModal}
                      sx={{ ml: 0 }}
                    >
                      + {t('checklists.categories.add')}
                    </Button>
                  </Box>
                  {sections.length === 0 && (
                    <Paper
                      variant="outlined"
                      sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper', mb: 2 }}
                    >
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        {t('checklists.categories.empty')}
                      </Typography>
                      <Button
                        id="add-first-section-button"
                        data-testid="add-first-section-button"
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={handleOpenSectionModal}
                      >
                        {t('checklists.categories.addFirst')}
                      </Button>
                    </Paper>
                  )}
                  {errors.sections && (
                    <FormHelperText error sx={{ mb: 2 }}>
                      {errors.sections}
                    </FormHelperText>
                  )}
                  {sections.map((section, idx) => (
                    <Draggable key={section.id} draggableId={section.id} index={idx}>
                      {(provided) => (
                        <SectionBox
                          section={section}
                          onUpdateQuestions={(questions) =>
                            handleUpdateSectionQuestions(section.id, questions)
                          }
                          onRemoveSection={() => handleRemoveSection(section.id)}
                          onUpdateSectionName={(name) => handleUpdateSectionName(section.id, name)}
                          responseTypes={responseTypes}
                          departments={departments}
                          loadingTypes={loadingTypes}
                          loadingDepartments={loadingDepartments}
                          sectionIndex={idx}
                          provided={provided}
                          innerRef={provided.innerRef}
                          questionsDroppableId={`section-${section.id}`}
                        />
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Box>
              )}
            </Droppable>
          </DragDropContext>
          <Divider sx={{ my: 4 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant="outlined" onClick={() => setStep(0)}>
              {t('checklists.buttons.back')}
            </Button>
            <Box>
              <Button variant="outlined" sx={{ mr: 2 }} href="/panel/checklists">
                {t('checklists.buttons.cancel')}
              </Button>
              <Button
                data-testid="save-checklist-button"
                variant="contained"
                color="primary"
                onClick={handleSaveChecklist}
              >
                {t('checklists.buttons.save')}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Modal open={sectionModalOpen} onClose={handleCloseSectionModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            minWidth: 320,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {t('checklists.categories.modal.title')}
          </Typography>
          <TextField
            fullWidth
            id="section-name-input"
            label={t('checklists.categories.modal.name')}
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            sx={{ mb: 2 }}
            inputProps={{ 'data-testid': 'section-name-input' }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button id="cancel-section-button" onClick={handleCloseSectionModal} sx={{ mr: 2 }}>
              {t('checklists.buttons.cancel')}
            </Button>
            <Button
              id="confirm-section-button"
              variant="contained"
              onClick={handleAddSection}
              disabled={!sectionName.trim()}
            >
              {t('checklists.buttons.add')}
            </Button>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMessage(null)} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={2000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
