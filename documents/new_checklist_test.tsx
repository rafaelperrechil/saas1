'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Stack,
  Breadcrumbs,
  Link as MuiLink,
  Box,
  FormHelperText,
  Divider,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import Link from 'next/link';

const qualiSightTheme = createTheme({
  palette: {
    primary: {
      main: '#2AB7CA',
      dark: '#1F3251',
      light: '#56c7d6',
      contrastText: '#fff',
    },
    secondary: {
      main: '#F29D35',
      light: '#f5b665',
      dark: '#d78823',
      contrastText: '#000',
    },
    background: {
      default: '#ffffff',
      paper: '#f8f9fa',
    },
    text: {
      primary: '#1F3251',
      secondary: '#475569',
    },
    error: {
      main: '#dc2626',
    },
    success: {
      main: '#16a34a',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#1F3251',
    },
    body1: {
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        containedPrimary: {
          backgroundColor: '#2AB7CA',
          '&:hover': {
            backgroundColor: '#1F9DAF',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

const responseTypes = [
  { value: 'binary', label: 'Binário (Sim/Não)' },
  { value: 'status', label: 'Status (OK/Falha)' },
  { value: 'guest', label: 'Convidado' },
  { value: 'presence', label: 'Presença' },
  { value: 'custom', label: 'Customizado' },
];

const departments = [
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'cleaning', label: 'Limpeza' },
  { value: 'it', label: 'TI' },
  { value: 'security', label: 'Segurança' },
];

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

export default function NewTemplate() {
  const [isClient, setIsClient] = useState(false);
  const [checklistName, setChecklistName] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      text: '',
      responseType: 'binary',
      positiveLabel: 'Sim',
      negativeLabel: 'Não',
      department: '',
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
    if (errors[`question-${id}`]) {
      setErrors({ ...errors, [`question-${id}`]: '' });
    }
  };

  const updateResponseType = (id: string, responseType: string) => {
    const defaultLabels = getDefaultLabels(responseType);
    setQuestions(
      questions.map((q) =>
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
    setQuestions(questions.map((q) => (q.id === id ? { ...q, positiveLabel } : q)));
  };

  const updateNegativeLabel = (id: string, negativeLabel: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, negativeLabel } : q)));
  };

  const updateDepartment = (id: string, department: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, department } : q)));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!checklistName.trim()) {
      newErrors.checklistName = 'Nome do checklist é obrigatório';
    }

    questions.forEach((q) => {
      if (!q.text.trim()) {
        newErrors[`question-${q.id}`] = 'Texto da pergunta é obrigatório';
      }

      if (!q.department) {
        newErrors[`department-${q.id}`] = 'Departamento é obrigatório';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log({
        name: checklistName,
        description,
        questions,
      });

      alert('Checklist salvo com sucesso!');
    }
  };

  if (!isClient) {
    return (
      <ThemeProvider theme={qualiSightTheme}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4">Carregando...</Typography>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={qualiSightTheme}>
      <Head>
        <title>Criar Novo Checklist | QualiSight</title>
        <meta name="description" content="Crie um novo template de checklist" />
      </Head>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 3 }}
        >
          <Link href="/dashboard" passHref>
            <MuiLink underline="hover" color="text.secondary">
              Dashboard
            </MuiLink>
          </Link>
          <Link href="/templates" passHref>
            <MuiLink underline="hover" color="text.secondary">
              Templates
            </MuiLink>
          </Link>
          <Typography color="text.primary" fontWeight="bold">
            Novo Checklist
          </Typography>
        </Breadcrumbs>

        <form onSubmit={handleSubmit}>
          <Typography variant="h4" gutterBottom>
            Criar Novo Checklist
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Defina as perguntas, tipos de resposta e departamentos responsáveis por resolver itens
            negativos.
          </Typography>

          <TextField
            fullWidth
            label="Nome do Checklist"
            margin="normal"
            value={checklistName}
            onChange={(e) => setChecklistName(e.target.value)}
            error={!!errors.checklistName}
            helperText={errors.checklistName}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Descrição (opcional)"
            multiline
            rows={3}
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 4 }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Perguntas
            </Typography>

            {questions.length === 0 && (
              <Paper
                variant="outlined"
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  mb: 2,
                }}
              >
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Ainda não há perguntas neste checklist.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={addQuestion}
                >
                  Adicionar Primeira Pergunta
                </Button>
              </Paper>
            )}

            {questions.map((question, index) => (
              <Card
                key={question.id}
                variant="outlined"
                sx={{
                  my: 2,
                  p: 2,
                  position: 'relative',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DragIndicatorIcon
                    sx={{
                      mr: 1,
                      color: 'text.secondary',
                      cursor: 'grab',
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Texto da Pergunta"
                    value={question.text}
                    onChange={(e) => updateQuestionText(question.id, e.target.value)}
                    error={!!errors[`question-${question.id}`]}
                    helperText={errors[`question-${question.id}`]}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      ml: 1,
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: 'error.light',
                        color: 'white',
                      },
                    }}
                    onClick={() => removeQuestion(question.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo de Resposta</InputLabel>
                      <Select
                        label="Tipo de Resposta"
                        value={question.responseType}
                        onChange={(e) => updateResponseType(question.id, e.target.value)}
                      >
                        {responseTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={!!errors[`department-${question.id}`]}>
                      <InputLabel>Departamento Responsável</InputLabel>
                      <Select
                        label="Departamento Responsável"
                        value={question.department}
                        onChange={(e) => updateDepartment(question.id, e.target.value)}
                      >
                        {departments.map((dept) => (
                          <MenuItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors[`department-${question.id}`] && (
                        <FormHelperText>{errors[`department-${question.id}`]}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {question.responseType === 'custom' && (
                    <>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Rótulo Positivo"
                          value={question.positiveLabel}
                          onChange={(e) => updatePositiveLabel(question.id, e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          fullWidth
                          label="Rótulo Negativo"
                          value={question.negativeLabel}
                          onChange={(e) => updateNegativeLabel(question.id, e.target.value)}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Card>
            ))}

            {questions.length > 0 && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddIcon />}
                onClick={addQuestion}
                sx={{ mt: 2 }}
              >
                Adicionar Outra Pergunta
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Link href="/templates" passHref>
              <Button component="a" sx={{ mr: 2 }}>
                Cancelar
              </Button>
            </Link>
            <Button variant="contained" color="primary" type="submit">
              Salvar Checklist
            </Button>
          </Box>
        </form>
      </Container>
    </ThemeProvider>
  );
}
