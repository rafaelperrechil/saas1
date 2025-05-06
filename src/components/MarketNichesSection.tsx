'use client';

import React from 'react';
import {
  Stethoscope,
  UtensilsCrossed,
  Briefcase,
  Factory,
  HardHat,
  GraduationCap,
  Store,
  Sparkles,
  Car,
} from 'lucide-react';
import { Container, Typography, Grid, Box, Skeleton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import NicheCard from './NicheCard';

const MarketNichesSection: React.FC = () => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = React.useState(false);

  // Dados dos nichos usando as traduções
  const niches = [
    {
      key: 'clinics',
      icon: Stethoscope,
    },
    {
      key: 'restaurants',
      icon: UtensilsCrossed,
    },
    {
      key: 'offices',
      icon: Briefcase,
    },
    {
      key: 'industries',
      icon: Factory,
    },
    {
      key: 'construction',
      icon: HardHat,
    },
    {
      key: 'schools',
      icon: GraduationCap,
    },
    {
      key: 'stores',
      icon: Store,
    },
    {
      key: 'cleaning',
      icon: Sparkles,
    },
    {
      key: 'fleet',
      icon: Car,
    },
  ];

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" gutterBottom>
            Carregando...
          </Typography>
          <Grid container spacing={3}>
            {[...Array(9)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Skeleton
                  variant="rectangular"
                  height={180}
                  sx={{ borderRadius: 4 }}
                  animation="wave"
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
      <Container maxWidth="lg" sx={{ p: 0 }}>
        <Typography variant="h4" component="h1" align="center" fontWeight="bold" gutterBottom>
          {t('niches.title')}
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          paragraph
          sx={{ mb: 6 }}
        >
          {t('niches.subtitle')}
        </Typography>

        <Grid container spacing={3}>
          {niches.map((niche, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <NicheCard
                title={t(`niches.sectors.${niche.key}.title`)}
                description={t(`niches.sectors.${niche.key}.description`)}
                Icon={niche.icon}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default MarketNichesSection;
