'use client';

import { Box, TextField, Button, Grid, Autocomplete, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { countries } from '@/utils/countries';
import { cities } from '@/utils/cities';
import { ArrowBack } from '@mui/icons-material';

interface Niche {
  id: string;
  name: string;
}

interface OrganizationStepProps {
  data: {
    name: string;
    employeesCount: string;
    country: string;
    city: string;
    nicheId: string;
  };
  onChange: (data: OrganizationStepProps['data']) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function OrganizationStep({
  data,
  onChange,
  onBack,
  onNext,
}: OrganizationStepProps) {
  const { t } = useTranslation();
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNiches = async () => {
      try {
        const response = await fetch('/api/niches');
        if (!response.ok) {
          throw new Error('Erro ao carregar nichos');
        }
        const data = await response.json();
        setNiches(data);
      } catch (error) {
        console.error('Erro ao carregar nichos:', error);
        setError(t('wizard.organization.errors.loadingNiches'));
      } finally {
        setLoading(false);
      }
    };

    fetchNiches();
  }, [t]);

  const handleChange = (field: keyof OrganizationStepProps['data'], value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const validate = () => {
    if (!data.name.trim()) {
      setError(t('wizard.organization.errors.nameRequired'));
      return false;
    }

    if (!data.employeesCount) {
      setError(t('wizard.organization.errors.employeesRequired'));
      return false;
    }

    if (!data.country) {
      setError(t('wizard.organization.errors.countryRequired'));
      return false;
    }

    if (!data.city) {
      setError(t('wizard.organization.errors.cityRequired'));
      return false;
    }

    if (!data.nicheId) {
      setError(t('wizard.organization.errors.nicheRequired'));
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Typography variant="h5" gutterBottom>
        {t('wizard.organization.title')}
      </Typography>

      <Typography variant="body1" color="textSecondary" gutterBottom>
        {t('wizard.organization.subtitle')}
      </Typography>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t('wizard.organization.name')}
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t('wizard.organization.employeesCount')}
            type="number"
            value={data.employeesCount}
            onChange={(e) => handleChange('employeesCount', e.target.value)}
            required
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={countries}
            value={data.country}
            onChange={(_, newValue) => handleChange('country', newValue || '')}
            renderInput={(params) => (
              <TextField {...params} label={t('wizard.organization.country')} required />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            options={cities}
            value={data.city}
            onChange={(_, newValue) => handleChange('city', newValue || '')}
            renderInput={(params) => (
              <TextField {...params} label={t('wizard.organization.city')} required />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Autocomplete
            options={niches}
            getOptionLabel={(option) => option.name}
            value={niches.find((niche) => niche.id === data.nicheId) || null}
            onChange={(_, newValue) => handleChange('nicheId', newValue?.id || '')}
            loading={loading}
            renderInput={(params) => (
              <TextField {...params} label={t('wizard.organization.niche')} required />
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Button variant="outlined" onClick={onBack} startIcon={<ArrowBack />}>
          {t('wizard.common.back')}
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
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
