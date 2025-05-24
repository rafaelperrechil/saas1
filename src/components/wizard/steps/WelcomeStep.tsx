'use client';

import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: '100%',
        gap: 3,
      }}
    >
      <Typography variant="h4" fontWeight="bold" color="#1F3251">
        {t('wizard.welcome.title')}
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 600 }} paragraph>
        {t('wizard.welcome.description')}
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={onNext}
        sx={{
          mt: 2,
          bgcolor: '#2AB7CA',
          '&:hover': {
            bgcolor: '#1F3251',
          },
        }}
        data-testid="next-button"
      >
        {t('wizard.common.next')}
      </Button>
    </Box>
  );
}
