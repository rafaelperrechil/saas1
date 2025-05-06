'use client';

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const UnitsSection: React.FC = () => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Box
        sx={{
          position: 'relative',
          py: 12,
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" align="center" color="white">
            Carregando...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        py: 12,
        overflow: 'hidden',
      }}
    >
      {/* Background Image with Overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage:
            'url("https://images.pexels.com/photos/7681091/pexels-photo-7681091.jpeg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundColor: '#0A1628',
            opacity: 0.9,
          },
        }}
      />

      {/* Content Container */}
      <Container
        maxWidth="md"
        sx={{
          position: 'relative',
          zIndex: 10,
          px: { xs: 3, md: 6 },
        }}
      >
        <Typography
          variant="h3"
          component="h2"
          align="center"
          color="white"
          sx={{
            fontWeight: 700,
            mb: 4,
            fontFamily: '"Inter", sans-serif',
            fontSize: { xs: '2rem', sm: '2.25rem' },
            lineHeight: 1.3,
          }}
        >
          {t('units.title')}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography
            variant="body1"
            align="center"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: { xs: '1rem', sm: '1.125rem' },
              lineHeight: 1.7,
              fontFamily: '"Inter", sans-serif',
            }}
          >
            {t('units.paragraph1')}
          </Typography>

          <Typography
            variant="body1"
            align="center"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: { xs: '1rem', sm: '1.125rem' },
              lineHeight: 1.7,
              fontFamily: '"Inter", sans-serif',
            }}
          >
            {t('units.paragraph2')}
          </Typography>
        </Box>

        {/* Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 96,
            height: 96,
            border: '2px solid #00B4D8',
            borderRight: 'none',
            borderBottom: 'none',
            opacity: 0.2,
            transform: 'translate(-48px, -48px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 96,
            height: 96,
            border: '2px solid #00B4D8',
            borderLeft: 'none',
            borderTop: 'none',
            opacity: 0.2,
            transform: 'translate(48px, 48px)',
          }}
        />
      </Container>
    </Box>
  );
};

export default UnitsSection;
