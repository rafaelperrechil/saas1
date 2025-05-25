'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Snackbar,
  Paper,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LoadingScreen from '@/components/common/LoadingScreen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

interface ChecklistExecutionItem {
  checklistItemId: string;
  isPositive: boolean;
  note: string | null;
  checklistItem: {
    name: string;
    description: string | null;
    checklistResponseType: {
      positiveLabel: string;
      negativeLabel: string;
    };
  };
}

interface ChecklistExecution {
  id: string;
  checklistId: string;
  status: string;
  completedAt: string;
  items: ChecklistExecutionItem[];
  checklist: {
    name: string;
    description: string | null;
  };
}

export default function InspectionResultPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [execution, setExecution] = useState<ChecklistExecution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExecution = async () => {
      try {
        const response = await fetch(`/api/checklists/executions/${unwrappedParams.id}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar resultados da inspeção');
        }
        const data = await response.json();
        setExecution(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar resultados da inspeção');
      } finally {
        setLoading(false);
      }
    };

    if (unwrappedParams.id) {
      fetchExecution();
    }
  }, [unwrappedParams.id]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!execution) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}
        >
          Checklist Finalizado com Sucesso!
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          {execution.checklist.name}
        </Typography>

        {execution.checklist.description && (
          <Typography color="text.secondary" paragraph sx={{ mb: 4 }}>
            {execution.checklist.description}
          </Typography>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.secondary' }}>
            Data de Conclusão: {new Date(execution.completedAt).toLocaleString()}
          </Typography>
        </Box>

        {execution.items.map((item) => (
          <Card key={item.checklistItemId} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {item.checklistItem.name}
                  </Typography>
                  {item.note && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Observação: {item.note}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {item.isPositive ? (
                    <>
                      <CheckCircleIcon color="success" />
                      <Typography color="success.main">
                        {item.checklistItem.checklistResponseType.positiveLabel}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <CancelIcon color="error" />
                      <Typography color="error.main">
                        {item.checklistItem.checklistResponseType.negativeLabel}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => router.push('/panel/inspections')}
          >
            Voltar para Lista de Inspeções
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
