'use client';

import React from 'react';
import { Container, Typography, Grid, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import TestimonialCard from './TestimonialCard';

const TestimonialsSection: React.FC = () => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Renderiza os depoimentos dos arquivos de tradução
  const testimonials = Array.from({ length: 6 }).map((_, index) => ({
    name: t(`testimonials.items.${index}.name`),
    role: t(`testimonials.items.${index}.role`),
    testimonial: t(`testimonials.items.${index}.testimonial`),
    avatar: `https://i.pravatar.cc/150?img=${12 + index * 8}`, // Gera URLs diferentes para cada avatar
  }));

  if (!isClient) {
    return (
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" sx={{ mb: 6 }}>
            Carregando...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, bgcolor: 'white' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          align="center"
          sx={{
            mb: 1,
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {t('testimonials.title')}
        </Typography>
        <Typography variant="h6" component="p" align="center" color="text.secondary" sx={{ mb: 6 }}>
          {t('testimonials.subtitle')}
        </Typography>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} sm={6} lg={4} key={index}>
              <TestimonialCard {...testimonial} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;
