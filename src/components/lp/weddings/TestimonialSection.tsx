'use client';

import { Box, Typography, Container } from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';

export default function TestimonialSection() {
  return (
    <Box sx={{ bgcolor: 'secondary.main', py: 8 }}>
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            py: 4,
          }}
        >
          <FormatQuoteIcon
            sx={{
              fontSize: 60,
              opacity: 0.2,
              position: 'absolute',
              top: 0,
              left: { xs: 20, md: 40 },
            }}
          />

          <Typography
            variant="h6"
            component="blockquote"
            sx={{
              fontStyle: 'italic',
              lineHeight: 1.8,
              fontSize: { xs: '1.1rem', md: '1.35rem' },
              mb: 3,
              px: { xs: 4, md: 8 },
            }}
          >
            "O QualiSight transformou o nosso grande dia. Conseguimos acompanhar todos os
            preparativos em tempo real, e quando o DJ teve um imprevisto, resolvemos tudo em minutos
            com um ticket de ajuste. Nossa coordenadora de casamento disse que nunca viu um evento
            tão bem organizado!"
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontWeight: 'medium',
            }}
          >
            — Mariana & Felipe, Casados em Maio/2025
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
