'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  IconButton,
  Modal,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LoadingScreen from '@/components/common/LoadingScreen';
import NotesIcon from '@mui/icons-material/Notes';

interface ChecklistItem {
  id: string;
  name: string;
  description: string | null;
  checklistResponseType: {
    positiveLabel: string;
    negativeLabel: string;
  };
}

interface ChecklistSection {
  id: string;
  name: string;
  items: ChecklistItem[];
}

interface Checklist {
  id: string;
  name: string;
  description: string | null;
  sections: ChecklistSection[];
}

export default function InspectionPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const checklistId = unwrappedParams.id;
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: boolean }>({});
  const [notes, setNotes] = useState<{ [key: string]: string }>({});
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const response = await fetch(`/api/checklists/${checklistId}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar checklist');
        }
        const data = await response.json();
        setChecklist(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar checklist');
      } finally {
        setLoading(false);
      }
    };

    if (checklistId) {
      fetchChecklist();
    }
  }, [checklistId]);

  const handleAnswerChange = (itemId: string, value: boolean) => {
    setAnswers((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleNoteChange = (itemId: string, value: string) => {
    setNotes((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleOpenNoteModal = (itemId: string) => {
    setCurrentNoteId(itemId);
    setNoteModalOpen(true);
  };

  const handleCloseNoteModal = () => {
    setNoteModalOpen(false);
    setCurrentNoteId(null);
  };

  const handleSubmit = async () => {
    try {
      const executionItems = Object.entries(answers).map(([itemId, isPositive]) => ({
        checklistItemId: itemId,
        isPositive,
        note: notes[itemId] || null,
      }));

      const response = await fetch('/api/checklists/executions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checklistId: checklistId,
          items: executionItems,
          status: 'COMPLETED',
          completedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar inspeção');
      }

      setSuccess('Inspeção finalizada com sucesso!');
      setTimeout(() => {
        router.push('/panel/inspections');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar inspeção');
    }
  };

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

  if (!checklist) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        {checklist.name}
      </Typography>
      {checklist.description && (
        <Typography color="text.secondary" paragraph sx={{ mb: 4 }}>
          {checklist.description}
        </Typography>
      )}

      {checklist.sections.map((section) => (
        <Box key={section.id} sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            {section.name}
          </Typography>
          {section.items.map((item) => (
            <Card key={item.id} sx={{ mb: 1, p: 0, boxShadow: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 3,
                  py: 2,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FormControl component="fieldset" sx={{ m: 0 }}>
                    <RadioGroup
                      row
                      value={answers[item.id] === undefined ? '' : answers[item.id]}
                      onChange={(e) => handleAnswerChange(item.id, e.target.value === 'true')}
                    >
                      <FormControlLabel
                        value={true}
                        control={<Radio />}
                        label={item.checklistResponseType.positiveLabel}
                      />
                      <FormControlLabel
                        value={false}
                        control={<Radio />}
                        label={item.checklistResponseType.negativeLabel}
                      />
                    </RadioGroup>
                  </FormControl>
                  <IconButton onClick={() => handleOpenNoteModal(item.id)}>
                    <NotesIcon color={notes[item.id] ? 'primary' : 'action'} />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length === 0}
        >
          Finalizar Inspeção
        </Button>
      </Box>

      <Modal open={noteModalOpen} onClose={handleCloseNoteModal}>
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
            maxWidth: 400,
            width: '90%',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Observações
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={currentNoteId ? notes[currentNoteId] || '' : ''}
            onChange={(e) => currentNoteId && handleNoteChange(currentNoteId, e.target.value)}
            placeholder="Digite suas observações aqui..."
            autoFocus
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleCloseNoteModal} variant="contained">
              Fechar
            </Button>
          </Box>
        </Box>
      </Modal>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={2000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
