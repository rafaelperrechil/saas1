'use client';

import React from 'react';
import { Card, CardContent, Typography, Button, Box, Chip } from '@mui/material';
import { Plan, Subscription } from '@prisma/client';
import Link from 'next/link';

interface CurrentPlanCardProps {
  currentPlan: Plan | null;
  subscription: Subscription | null;
  translations?: {
    currentPlan?: string;
    active?: string;
  };
}

export default function CurrentPlanCard({
  currentPlan,
  subscription,
  translations,
}: CurrentPlanCardProps) {
  const text = {
    currentPlan: translations?.currentPlan || 'Current Plan',
    active: translations?.active || 'ACTIVE',
    basicPlan: 'Basic plan',
    noActiveSubscription: "You don't have an active subscription",
    upgradeNow: 'Upgrade now',
    perMonth: 'per month',
    upgradePlan: 'Upgrade plan',
  };

  if (!currentPlan || !subscription) {
    return (
      <Card sx={{ height: '100%', minHeight: '200px' }}>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {text.basicPlan}
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {text.noActiveSubscription}
          </Typography>
          <Box mt={2}>
            <Button variant="contained" color="primary" component={Link} href="/pricing">
              {text.upgradeNow}
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            {text.currentPlan}
          </Typography>
          <Chip label={text.active} color="success" size="small" variant="outlined" />
        </Box>
        <Typography variant="h5">{currentPlan.name}</Typography>
        <Typography variant="h4" color="primary" gutterBottom>
          R$ {Number(currentPlan.price).toFixed(2)}
          <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
            {text.perMonth}
          </Typography>
        </Typography>
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button variant="outlined" color="primary" component={Link} href="/pricing">
            {text.upgradePlan}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
