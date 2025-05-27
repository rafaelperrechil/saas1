'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  Paper,
  FormHelperText,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragHandleIcon,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { wizardService } from '@/services';

interface Environment {
  id: number;
  name: string;
}

interface EnvironmentsStepProps {
  data: Environment[];
  onChange: (data: Environment[]) => void;
  onBack: () => void;
  onNext: () => void;
  wizardData: any;
}

interface SortableItemProps {
  environment: Environment;
  onChange: (id: number, value: string) => void;
  onDelete: (id: number) => void;
}

function SortableItem({ environment, onChange, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: environment.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <ListItem ref={setNodeRef} style={style} sx={{ py: 1, px: 0 }}>
      <Paper
        elevation={1}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          p: 1,
          bgcolor: 'white',
          borderRadius: 1,
        }}
      >
        <IconButton
          size="small"
          {...attributes}
          {...listeners}
          sx={{ cursor: 'grab', color: 'grey.500', mr: 1 }}
        >
          <DragHandleIcon />
        </IconButton>

        <TextField
          fullWidth
          size="small"
          placeholder="Nome do ambiente"
          value={environment.name}
          onChange={(e) => onChange(environment.id, e.target.value)}
          sx={{ flex: 1 }}
        />

        <IconButton
          size="small"
          onClick={() => onDelete(environment.id)}
          sx={{ ml: 1, color: 'error.main' }}
        >
          <DeleteIcon />
        </IconButton>
      </Paper>
    </ListItem>
  );
}

export default function EnvironmentsStep({
  data,
  onChange,
  onBack,
  onNext,
  wizardData,
}: EnvironmentsStepProps) {
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Initialize with default environments if none exist
  useEffect(() => {
    if (data.length === 0) {
      onChange([
        { id: 1, name: 'Produção' },
        { id: 2, name: 'Escritório' },
      ]);
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addEnvironment = () => {
    const newId = Date.now();
    onChange([...data, { id: newId, name: '' }]);
  };

  const updateEnvironment = (id: number, name: string) => {
    const updatedEnvironments = data.map((env) => (env.id === id ? { ...env, name } : env));
    onChange(updatedEnvironments);
    if (error) setError('');
  };

  const deleteEnvironment = (id: number) => {
    onChange(data.filter((env) => env.id !== id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item.id === active.id);
      const newIndex = data.findIndex((item) => item.id === over.id);

      const newArray = [...data];
      const [movedItem] = newArray.splice(oldIndex, 1);
      newArray.splice(newIndex, 0, movedItem);

      onChange(newArray);
    }
  };

  const validate = () => {
    // Check if all environments have names
    const emptyEnvironments = data.filter((env) => !env.name.trim());

    if (emptyEnvironments.length > 0) {
      setError(t('wizard.environments.errors.emptyNames'));
      return false;
    }

    // Check for duplicate names
    const names = data.map((env) => env.name.trim().toLowerCase());
    const uniqueNames = [...new Set(names)];

    if (uniqueNames.length !== names.length) {
      setError(t('wizard.environments.errors.duplicateNames'));
      return false;
    }

    // Require at least one environment
    if (data.length === 0) {
      setError(t('wizard.environments.errors.noEnvironments'));
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    if (validate()) {
      try {
        setIsSaving(true);
        setError(''); // Limpar erro anterior

        // Validar dados do wizard
        if (!wizardData?.organization) {
          throw new Error('Dados da organização não encontrados');
        }

        const { organization } = wizardData;

        if (
          !organization.name ||
          !organization.employeesCount ||
          !organization.country ||
          !organization.city ||
          !organization.nicheId
        ) {
          throw new Error('Dados da organização incompletos');
        }

        if (!wizardData?.branch?.name) {
          throw new Error('Dados da filial incompletos');
        }

        if (!wizardData?.departments?.length) {
          throw new Error('Nenhum departamento cadastrado');
        }

        if (!session?.user?.id) {
          throw new Error('Usuário não autenticado');
        }

        // Chamar onNext após validação
        onNext();
      } catch (error) {
        console.error('Erro ao validar dados:', error);
        setError(
          error instanceof Error
            ? error.message
            : 'Ocorreu um erro ao validar os dados. Por favor, tente novamente.'
        );
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <Typography variant="h5" sx={{ mb: 3 }}>
        {t('wizard.environments.title')}
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        {t('wizard.environments.subtitle')}
      </Typography>

      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{t('wizard.environments.title')}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addEnvironment}
            color="primary"
            size="small"
          >
            {t('wizard.environments.addEnvironment')}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            {error}
          </Alert>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={data} strategy={verticalListSortingStrategy}>
            <List>
              {data.map((environment, index) => (
                <SortableItem
                  key={environment.id}
                  environment={environment}
                  onChange={(id, value) => updateEnvironment(id, value)}
                  onDelete={(id) => deleteEnvironment(id)}
                />
              ))}
            </List>
          </SortableContext>
        </DndContext>

        {data.length > 0 && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
            {t('wizard.environments.dragToReorder')}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" onClick={onBack} startIcon={<ArrowBack />} disabled={isSaving}>
          {t('common.back')}
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={isSaving}
          sx={{
            bgcolor: '#2AB7CA',
            '&:hover': {
              bgcolor: '#1F3251',
            },
          }}
          data-testid="environments-step-next-button"
        >
          {isSaving ? t('common.saving') : t('common.finish')}
        </Button>
      </Box>
    </Box>
  );
}
