'use client';

import { Box, Typography, Container } from '@mui/material';

export default function WhyUseSection() {
  return (
    <Box sx={{ bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="md" sx={{ textAlign: 'center', py: { xs: 4, md: 8 }, px: 3 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{
            color: 'primary.main',
            mb: 4,
            fontWeight: 'bold',
          }}
        >
          Por que usar QualiSight no seu casamento?
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'text.primary',
            fontSize: { xs: '1rem', md: '1.125rem' },
            lineHeight: 1.7,
          }}
        >
          Em casamentos, cada espaço e cada fornecedor precisa estar impecável no momento certo. Com
          o QualiSight, você cria checklists inteligentes para verificar desde a montagem do altar
          até a chegada do bolo, tudo em um único painel. Não importa quantas cerimônias ou
          recepções você tenha ao longo do dia, nossa plataforma mantém tudo centralizado — sem
          papelada, sem estresse.
        </Typography>
      </Container>
    </Box>
  );
}
