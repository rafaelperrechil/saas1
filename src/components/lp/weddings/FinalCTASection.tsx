'use client';

import { Box, Typography, Container, Button } from '@mui/material';

export default function FinalCTASection() {
  return (
    <Box sx={{ bgcolor: 'primary.main', py: 8 }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Typography
          variant="h3"
          component="h2"
          sx={{
            color: 'white',
            mb: 2,
            fontWeight: 'bold',
            fontSize: { xs: '1.75rem', md: '2.5rem' },
          }}
        >
          Não deixe nada ao acaso no dia mais importante da sua vida.
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: 'grey.100',
            mb: 4,
            fontWeight: 'normal',
            fontSize: { xs: '1rem', md: '1.25rem' },
          }}
        >
          Use o QualiSight para transformar a organização do seu casamento em uma experiência
          fluida, confiável e memorável.
        </Typography>

        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: 'secondary.main',
            '&:hover': { bgcolor: 'secondary.dark' },
            py: 1.5,
            px: 4,
            fontSize: '1.1rem',
          }}
        >
          Experimentar Gratuitamente
        </Button>
      </Container>
    </Box>
  );
}
