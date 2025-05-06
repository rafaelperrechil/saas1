'use client';

import React from 'react';
import { Box, Typography, Container, Grid, Link, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Carregando...
          </Typography>
        </Container>
      </Box>
    );
  }

  const productLinks = [
    { key: 'features', label: t('footer.features') },
    { key: 'plans', label: t('footer.plans') },
    { key: 'useCases', label: t('footer.useCases') },
    { key: 'security', label: t('footer.security') },
  ];

  const companyLinks = [
    { key: 'about', label: t('footer.about') },
    { key: 'blog', label: t('footer.blog') },
    { key: 'careers', label: t('footer.careers') },
    { key: 'contact', label: t('footer.contact') },
  ];

  const resourceLinks = [
    { key: 'help', label: t('footer.help') },
    { key: 'docs', label: t('footer.docs') },
    { key: 'api', label: t('footer.api') },
    { key: 'tutorials', label: t('footer.tutorials') },
  ];

  const legalLinks = [
    { key: 'terms', label: t('footer.terms') },
    { key: 'privacy', label: t('footer.privacy') },
    { key: 'cookies', label: t('footer.cookies') },
    { key: 'compliance', label: t('footer.compliance') },
  ];

  return (
    <Box sx={{ bgcolor: 'background.paper', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography
              variant="h6"
              sx={{
                color: 'primary.main',
                fontWeight: 'bold',
                mb: 2,
              }}
            >
              QualiSight
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              {t('footer.description')}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('footer.product')}
            </Typography>
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {productLinks.map((item) => (
                <Box component="li" key={item.key} sx={{ mb: 1 }}>
                  <Link href="#" underline="hover" sx={{ color: 'text.secondary' }}>
                    {item.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('footer.company')}
            </Typography>
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {companyLinks.map((item) => (
                <Box component="li" key={item.key} sx={{ mb: 1 }}>
                  <Link href="#" underline="hover" sx={{ color: 'text.secondary' }}>
                    {item.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('footer.resources')}
            </Typography>
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {resourceLinks.map((item) => (
                <Box component="li" key={item.key} sx={{ mb: 1 }}>
                  <Link href="#" underline="hover" sx={{ color: 'text.secondary' }}>
                    {item.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              {t('footer.legal')}
            </Typography>
            <Box component="ul" sx={{ m: 0, p: 0, listStyle: 'none' }}>
              {legalLinks.map((item) => (
                <Box component="li" key={item.key} sx={{ mb: 1 }}>
                  <Link href="#" underline="hover" sx={{ color: 'text.secondary' }}>
                    {item.label}
                  </Link>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            © {new Date().getFullYear()} {t('footer.copyright')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
