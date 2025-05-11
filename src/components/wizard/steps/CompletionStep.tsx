'use client';

import { Box, Alert, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTranslation } from 'react-i18next';

export default function CompletionStep() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 3,
      }}
    >
      <CheckCircleOutlineIcon
        sx={{
          fontSize: 80,
          color: '#2AB7CA',
        }}
      />

      <Typography variant="h4" fontWeight="bold" color="#1F3251" textAlign="center">
        {t('wizard.completion.title')}
      </Typography>

      <Alert
        severity="success"
        sx={{
          maxWidth: 500,
          width: '100%',
        }}
      >
        {t('wizard.completion.message')}
      </Alert>

      <Typography variant="body1" color="textSecondary" textAlign="center">
        {t('wizard.completion.redirect')}
      </Typography>
    </Box>
  );
}
