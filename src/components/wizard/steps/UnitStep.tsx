'use client';

import { Box, TextField, Button, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowBack } from '@mui/icons-material';

interface UnitStepProps {
  data: {
    name: string;
  };
  onChange: (data: any) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function UnitStep({ data, onChange, onBack, onNext }: UnitStepProps) {
  const { t } = useTranslation();
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setIsValid(Boolean(data.name));
  }, [data.name]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" color="#1F3251" gutterBottom>
          {t('wizard.branch.title')}
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {t('wizard.branch.subtitle')}
        </Typography>
      </Box>

      <TextField
        fullWidth
        label={t('wizard.branch.name')}
        value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        required
        // helperText="Cada organização tem apenas uma unidade por padrão. Adicionar mais sob consulta."
      />

      <Box
        sx={{
          p: 3,
          bgcolor: 'rgba(242, 157, 53, 0.08)',
          borderRadius: 2,
          mt: 4,
        }}
      >
        <Typography variant="body2" color="textSecondary">
          {t('wizard.branch.description')}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button variant="outlined" onClick={onBack} startIcon={<ArrowBack />}>
          {t('wizard.common.back')}
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!isValid}
          sx={{
            bgcolor: '#2AB7CA',
            '&:hover': {
              bgcolor: '#1F3251',
            },
          }}
        >
          {t('wizard.common.next')}
        </Button>
      </Box>
    </Box>
  );
}
