import { Metadata } from 'next';
import React from 'react';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Confira nossos planos disponíveis',
};

interface Plan {
  id: string;
  name: string;
  price: Prisma.Decimal;
  includedUnits: number;
  maxUsers: number;
  extraUserPrice: Prisma.Decimal | null;
  maxChecklists: number | null;
  extraUnitPrice: Prisma.Decimal | null;
  isCustom: boolean;
}

export default async function PricingPage() {
  // Busca planos ordenados pelo preço
  const plans: Plan[] = await prisma.plan.findMany({ orderBy: { price: 'asc' } });

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        Preços
      </Typography>

      <Grid container spacing={4} justifyContent="center" sx={{ my: 4 }}>
        {plans.map((plan, idx) => {
          const isFeatured = idx === 1;
          return (
            <Grid item xs={12} sm={6} md={3} key={plan.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: isFeatured ? 'primary.dark' : 'background.paper',
                  color: isFeatured ? 'common.white' : 'text.primary',
                  borderRadius: 3,
                  p: 2,
                  transition: 'transform 0.3s ease, background-color 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    backgroundColor: 'primary.dark',
                    zIndex: 1,
                    '& .MuiButton-root': {
                      backgroundColor: 'common.white !important',
                      color: 'text.primary !important',
                    },
                    '& .MuiButton-root:hover': {
                      backgroundColor: 'grey.100 !important',
                    },
                    '& .MuiTypography-root': {
                      color: 'common.white',
                    },
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                    {plan.name}
                  </Typography>
                  <Typography
                    variant="h4"
                    gutterBottom
                    sx={{ color: isFeatured ? 'common.white' : 'primary.main' }}
                  >
                    R$ {plan.price.toFixed(2)}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon
                        sx={{ color: isFeatured ? 'success.light' : 'success.main', mr: 1 }}
                      />
                      <Typography>Unidades inclusas: {plan.includedUnits}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon
                        sx={{ color: isFeatured ? 'success.light' : 'success.main', mr: 1 }}
                      />
                      <Typography>Máx. de usuários: {plan.maxUsers}</Typography>
                    </Box>
                    {/* Adicione mais detalhes conforme necessário */}
                  </Box>
                </CardContent>

                <Box sx={{ p: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: isFeatured ? 'success.main' : 'primary.main',
                      color: 'common.white',
                      '&:hover': { backgroundColor: isFeatured ? 'success.dark' : 'primary.dark' },
                    }}
                  >
                    Get Started
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
