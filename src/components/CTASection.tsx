'use client';

import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

const CTASection: React.FC = () => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" align="center" sx={{ mb: 6 }}>
            Carregando...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 12,
        bgcolor: 'background.paper',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          component="h2"
          sx={{
            mb: 2,
            fontWeight: 700,
          }}
        >
          {t('cta.title')}
        </Typography>
        <Typography
          variant="h6"
          component="p"
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}
        >
          {t('cta.subtitle')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#7B1FA2',
              '&:hover': {
                bgcolor: '#6A1B9A',
              },
              px: 4,
              py: 1.5,
            }}
          >
            {t('cta.startFree')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              borderColor: '#7B1FA2',
              color: '#7B1FA2',
              '&:hover': {
                borderColor: '#6A1B9A',
                bgcolor: 'rgba(123, 31, 162, 0.04)',
              },
              px: 4,
              py: 1.5,
            }}
          >
            {t('cta.talkToTeam')}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default CTASection;
