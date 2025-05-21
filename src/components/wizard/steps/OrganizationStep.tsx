'use client';

import {
  Box,
  TextField,
  Button,
  Grid,
  Autocomplete,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { countries } from '@/utils/countries';
import { cities } from '@/utils/cities';
import { ArrowBack } from '@mui/icons-material';
import { nicheService } from '@/services';

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
  readOnly?: boolean;
}

export default function OrganizationStep({
  data,
  onChange,
  onBack,
  onNext,
  readOnly = false,
}: OrganizationStepProps) {
  const { t } = useTranslation();
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNiches = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await nicheService.getNiches();

        if (response.error) {
          console.error('Erro ao carregar nichos:', response.error);
          setError(t('wizard.organization.errors.loadingNiches'));
          return;
        }

        if (!response.data) {
          console.error('Resposta sem dados ao carregar nichos');
          setError(t('wizard.organization.errors.loadingNiches'));
          return;
        }

        setNiches(response.data);
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {t('wizard.organization.title')}
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {t('wizard.organization.subtitle')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} role="alert">
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t('wizard.organization.name')}
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            disabled={readOnly}
            inputProps={{ 'data-testid': 'organization-name' }}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t('wizard.organization.employeesCount')}
            value={data.employeesCount}
            onChange={(e) => handleChange('employeesCount', e.target.value)}
            type="number"
            required
            disabled={readOnly}
            inputProps={{ 'data-testid': 'employees-count' }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={countries}
            value={data.country}
            onChange={(_, newValue) => handleChange('country', newValue || '')}
            renderInput={(params) => (
              <TextField {...params} label={t('wizard.organization.country')} required />
            )}
            disabled={readOnly}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Autocomplete
            options={cities[data.country] || []}
            value={data.city}
            onChange={(_, newValue) => handleChange('city', newValue || '')}
            renderInput={(params) => (
              <TextField {...params} label={t('wizard.organization.city')} required />
            )}
            disabled={readOnly || !data.country}
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
              <TextField
                {...params}
                label={t('wizard.organization.niche')}
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            disabled={readOnly}
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
          disabled={loading}
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
