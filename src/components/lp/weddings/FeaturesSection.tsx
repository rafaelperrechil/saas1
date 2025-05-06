'use client';

import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import TimelineIcon from '@mui/icons-material/Timeline';

const features = [
  {
    title: 'Checklist de Espaços',
    description:
      'Faça a checagem completa de todos os ambientes do seu casamento: do altar da igreja às mesas do salão, da iluminação da pista de dança até a decoração da área externa. Tudo verificado e aprovado com antecedência.',
    icon: <CheckCircleOutlineIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
  },
  {
    title: 'Gestão de Fornecedores',
    description:
      'Controle em tempo real as entregas de cada fornecedor: chegada do buffet, montagem floral, instalação de equipamentos de som e posicionamento da equipe de fotografia. Tudo dentro do cronograma.',
    icon: <PeopleOutlineIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
  },
  {
    title: 'Cronograma Visual & Tickets de Ajustes',
    description:
      'Visualize o fluxo completo do seu evento e crie tickets instantâneos para resolver imprevistos. Do atraso na entrega das flores ao ajuste de última hora no menu, solucione tudo com agilidade.',
    icon: <TimelineIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
  },
];

export default function FeaturesSection() {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h2"
          sx={{
            color: 'primary.main',
            mb: 6,
            textAlign: 'center',
            fontWeight: 'bold',
          }}
        >
          Facilidades para o seu Grande Dia
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>{feature.icon}</Box>
                <Typography
                  variant="h6"
                  component="h3"
                  sx={{
                    mb: 2,
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    textAlign: 'center',
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
