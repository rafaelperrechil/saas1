'use client';

import { Box, Typography, Button, Container } from '@mui/material';
import { alpha } from '@mui/material/styles';

export default function HeroSection() {
  return (
    <Box
      sx={{
        background: `linear-gradient(${alpha('#000', 0.5)}, ${alpha('#000', 0.5)}), url('https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="md" sx={{ textAlign: 'center', py: { xs: 8, md: 16 }, px: 3 }}>
        <Typography
          variant="h1"
          component="h1"
          sx={{
            color: 'white',
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 'bold',
            mb: 2,
          }}
        >
          Planeje Seu Grande Dia com Perfeição
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: 'grey.200',
            mb: 4,
            fontSize: { xs: '1.1rem', md: '1.25rem' },
          }}
        >
          Do ensaio ao 'sim', garanta que cada detalhe do seu casamento aconteça exatamente como
          sonhado.
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
          Comece Grátis
        </Button>
      </Container>
    </Box>
  );
}
