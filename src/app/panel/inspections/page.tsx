'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Modal,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LoadingScreen from '@/components/common/LoadingScreen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface Checklist {
  id: string;
  name: string;
  description: string | null;
  sections: {
    items: { id: string }[];
  }[];
  _count: {
    executions: number;
  };
}

interface ExecutionItem {
  id: string;
  isPositive: boolean;
  note: string | null;
  checklistItem: {
    name: string;
  };
}

interface Execution {
  id: string;
  createdAt: string;
  checklist: {
    name: string;
  };
  items: ExecutionItem[];
}

export default function InspectionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [checklistsResponse, executionsResponse] = await Promise.all([
          fetch('/api/checklists'),
          fetch('/api/checklists/executions'),
        ]);

        if (!checklistsResponse.ok || !executionsResponse.ok) {
          throw new Error('Erro ao carregar dados');
        }

        const [checklistsData, executionsData] = await Promise.all([
          checklistsResponse.json(),
          executionsResponse.json(),
        ]);

        setChecklists(checklistsData);
        setExecutions(executionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenExecutionDetails = (execution: Execution) => {
    setSelectedExecution(execution);
  };

  const handleCloseExecutionDetails = () => {
    setSelectedExecution(null);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Inspeções
      </Typography>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Checklists Disponíveis
      </Typography>

      <Grid container spacing={3}>
        {checklists.map((checklist) => {
          const totalQuestions = checklist.sections.reduce(
            (sum, section) => sum + section.items.length,
            0
          );
          return (
            <Grid item xs={12} sm={6} md={4} key={checklist.id}>
              <Card
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 240 }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <Typography variant="h6" gutterBottom>
                      {checklist.name}
                    </Typography>
                    {checklist.description && (
                      <Typography color="text.secondary" paragraph>
                        {checklist.description}
                      </Typography>
                    )}
                  </div>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mt: 2,
                    }}
                  >
                    <Chip
                      label={`${totalQuestions} perguntas`}
                      color="secondary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={`${checklist._count.executions} execuções`}
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => router.push(`/panel/inspections/${checklist.id}`)}
                    >
                      Iniciar Inspeção
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mb: 3, mt: 4 }}>
        Últimas Inspeções realizadas
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {executions.map((execution) => {
          const totalItems = execution.items.length;
          const positiveItems = execution.items.filter((item) => item.isPositive).length;
          const negativeItems = totalItems - positiveItems;
          const positivePercentage = ((positiveItems / totalItems) * 100).toFixed(1);
          const negativePercentage = ((negativeItems / totalItems) * 100).toFixed(1);

          return (
            <Grid item xs={12} sm={12} md={12} key={execution.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleOpenExecutionDetails(execution)}
              >
                <CardContent>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {execution.checklist.name}
                      </Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {new Date(execution.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        icon={<CheckCircleIcon />}
                        label={`${positiveItems} (${positivePercentage}%)`}
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        icon={<CancelIcon />}
                        label={`${negativeItems} (${negativePercentage}%)`}
                        color="error"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Modal
        open={!!selectedExecution}
        onClose={handleCloseExecutionDetails}
        aria-labelledby="execution-details-modal"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 600,
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            overflow: 'auto',
          }}
        >
          {selectedExecution && (
            <>
              <Typography variant="h5" gutterBottom>
                {selectedExecution.checklist.name}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {new Date(selectedExecution.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
              <List>
                {selectedExecution.items.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{item.checklistItem.name}</Typography>
                            {item.isPositive ? (
                              <CheckCircleIcon color="success" />
                            ) : (
                              <CancelIcon color="error" />
                            )}
                          </Box>
                        }
                        secondary={
                          item.note && (
                            <Typography variant="body2" color="text.secondary">
                              {item.note}
                            </Typography>
                          )
                        }
                      />
                    </ListItem>
                    {index < selectedExecution.items.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button onClick={handleCloseExecutionDetails} variant="contained">
                  Fechar
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
