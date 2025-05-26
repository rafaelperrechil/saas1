'use client';

import React, { useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Button,
  Chip,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getTicketsByBranch } from '@/services/ticket.service';

const TICKET_STATUS = [
  { value: 'OPEN', label: 'Aberto' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'ON_HOLD', label: 'Em espera' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELED', label: 'Cancelado' },
];

const fetcher = async (branchId: string): Promise<any[]> => {
  return await getTicketsByBranch(branchId);
};

export default function TicketsPage() {
  const { data: session } = useSession();
  const branchId = session?.user?.branch?.id;
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

  const {
    data: ticketsData,
    error,
    isLoading,
  } = useSWR(branchId ? ['/api/tickets', branchId] : null, () => fetcher(branchId || ''));

  const tickets: any[] = ticketsData || [];

  // Contagem por status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of TICKET_STATUS) counts[s.value] = 0;
    for (const ticket of tickets) {
      if (counts[ticket.status] !== undefined) counts[ticket.status]++;
    }
    return counts;
  }, [tickets]);

  // Filtro
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket: any) => {
      const matchStatus = statusFilter ? ticket.status === statusFilter : true;
      const matchSearch = search
        ? ticket.title.toLowerCase().includes(search.toLowerCase()) ||
          ticket.description.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchStatus && matchSearch;
    });
  }, [tickets, statusFilter, search]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Cards de status */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {TICKET_STATUS.map((status) => (
          <Grid item xs={12} sm={6} md={2.4} key={status.value}>
            <Card sx={{ bgcolor: 'primary.dark', color: 'white', minHeight: 120 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {status.label}
                </Typography>
                <Typography variant="h3" fontWeight={700}>
                  {statusCounts[status.value] || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filtro */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">Todos</MenuItem>
            {TICKET_STATUS.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          size="small"
          label="Buscar por título ou descrição"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 280 }}
        />
      </Paper>

      {/* Listagem */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Erro ao carregar tickets</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.dark' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Título</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Descrição</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Prioridade</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Abertura</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhum ticket encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket: any) => (
                  <TableRow key={ticket.id}>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>{ticket.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          TICKET_STATUS.find((s) => s.value === ticket.status)?.label ||
                          ticket.status
                        }
                        color={
                          ticket.status === 'OPEN'
                            ? 'info'
                            : ticket.status === 'IN_PROGRESS'
                              ? 'warning'
                              : ticket.status === 'ON_HOLD'
                                ? 'default'
                                : ticket.status === 'COMPLETED'
                                  ? 'success'
                                  : ticket.status === 'CANCELED'
                                    ? 'error'
                                    : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{ticket.priority}</TableCell>
                    <TableCell>{new Date(ticket.createdAt).toLocaleString('pt-BR')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
