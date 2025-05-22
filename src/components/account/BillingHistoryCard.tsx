'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { formatDistanceToNow } from 'date-fns';
import { ptBR, enUS, es } from 'date-fns/locale';
import ReceiptIcon from '@mui/icons-material/Receipt';

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  description?: string;
  plan?: {
    name: string;
  };
}

interface BillingHistoryCardProps {
  payments: Payment[];
  translations: {
    billingHistory: string;
    succeeded: string;
  };
}

export default function BillingHistoryCard({ payments, translations }: BillingHistoryCardProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [activeRowId, setActiveRowId] = React.useState<string | null>(null);
  const [locale, setLocale] = useState(ptBR); // Padrão: português

  const text = {
    billingHistory: translations?.billingHistory || 'Billing History',
    succeeded: translations?.succeeded || 'SUCCEEDED',
    invoice: 'Invoice',
    amount: 'Amount',
    date: 'Date',
    status: 'Status',
    noInvoices: 'Nenhuma fatura encontrada',
  };

  // Detectar o idioma atual baseado no navegador para formatação de data
  useEffect(() => {
    // Executado apenas no cliente
    const getUserLocale = () => {
      const browserLang = navigator.language;
      if (browserLang.startsWith('pt')) return ptBR;
      if (browserLang.startsWith('es')) return es;
      return enUS;
    };

    setLocale(getUserLocale());
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale,
      });
    } catch {
      return 'Invalid date';
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setActiveRowId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const downloadInvoice = (id: string) => {
    // Simulação de download (em uma aplicação real, chamaria uma API)
    console.log('Download invoice', id);
    handleMenuClose();
  };

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="h2">
          {text.billingHistory}
        </Typography>
      </Box>

      {payments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">{text.noInvoices}</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Valor</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  onClick={(e) => handleMenuClick(e, payment.id)}
                  sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>{formatDate(new Date(payment.createdAt))}</TableCell>
                  <TableCell>{payment.description || payment.plan?.name || 'N/A'}</TableCell>
                  <TableCell>{formatCurrency(Number(payment.amount))}</TableCell>
                  <TableCell>
                    <Chip
                      label={text.succeeded}
                      color="success"
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        id={`menu-${activeRowId}`}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => activeRowId && downloadInvoice(activeRowId)}>
          <DownloadIcon fontSize="small" sx={{ mr: 1 }} />
          Download all
        </MenuItem>
      </Menu>
    </Card>
  );
}
