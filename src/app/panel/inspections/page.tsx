'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Grid, Chip } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import LoadingScreen from '@/components/common/LoadingScreen';

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

export default function InspectionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        const response = await fetch('/api/checklists');
        if (!response.ok) {
          throw new Error('Erro ao carregar checklists');
        }
        const data = await response.json();
        setChecklists(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar checklists');
      } finally {
        setLoading(false);
      }
    };

    fetchChecklists();
  }, []);

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
    </Box>
  );
}
