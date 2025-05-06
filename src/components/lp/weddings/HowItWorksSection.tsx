'use client';

import { Box, Typography, Container, Step, StepLabel, Stepper } from '@mui/material';

const steps = [
  'Configure seus ambientes (igreja, salão, lounge)',
  'Crie seus checklists (decoração, buffet, som)',
  'Monitore cada etapa no dia do evento',
];

export default function HowItWorksSection() {
  return (
    <Box sx={{ bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="md">
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
          Como Funciona
        </Typography>

        <Box sx={{ mb: 6 }}>
          <Stepper activeStep={3} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label} completed>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      color: 'secondary.main',
                      '&.Mui-completed': { color: 'secondary.main' },
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Typography
          variant="body1"
          sx={{
            color: 'text.primary',
            fontSize: { xs: '1rem', md: '1.125rem' },
            lineHeight: 1.7,
            textAlign: 'center',
          }}
        >
          Em três passos simples você garante tudo: configure seus ambientes (igreja, salão,
          lounge), crie seus checklists (decoração, buffet, som) e monitore cada etapa no dia do
          evento pelo celular ou tablet, solucionando imprevistos antes que seus convidados notem.
        </Typography>
      </Container>
    </Box>
  );
}
