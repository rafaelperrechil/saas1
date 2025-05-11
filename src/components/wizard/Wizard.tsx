'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import WelcomeStep from './steps/WelcomeStep';
import OrganizationStep from './steps/OrganizationStep';
import UnitStep from './steps/UnitStep';
import DepartmentsStep from './steps/DepartmentsStep';
import EnvironmentsStep from './steps/EnvironmentsStep';

interface Department {
  id?: string;
  name: string;
  responsibleEmail: string;
}

interface WizardData {
  organization: {
    name: string;
    employeesCount: string;
    country: string;
    city: string;
    nicheId: string;
  };
  branch: {
    name: string;
  };
  departments: Department[];
}

export default function Wizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    organization: {
      name: '',
      employeesCount: '0',
      country: '',
      city: '',
      nicheId: '',
    },
    branch: {
      name: '',
    },
    departments: [],
  });

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleOrganizationData = (data: WizardData['organization']) => {
    console.log('Organization data:', data); // Debug
    setWizardData((prev) => ({
      ...prev,
      organization: data,
    }));
  };

  const handleBranchData = (data: WizardData['branch']) => {
    console.log('Branch data:', data); // Debug
    setWizardData((prev) => ({
      ...prev,
      branch: data,
    }));
  };

  const handleDepartmentsData = (data: Department[]) => {
    console.log('Departments data:', data); // Debug
    setWizardData((prev) => ({
      ...prev,
      departments: data,
    }));
  };

  const renderStep = () => {
    console.log('Current wizard data:', wizardData); // Debug

    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return (
          <OrganizationStep
            data={wizardData.organization}
            onChange={handleOrganizationData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <UnitStep
            data={wizardData.branch}
            onChange={handleBranchData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <DepartmentsStep
            data={wizardData.departments}
            onChange={handleDepartmentsData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <EnvironmentsStep
            data={[]}
            onChange={() => {}}
            onNext={handleNext}
            onBack={handleBack}
            wizardData={wizardData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {renderStep()}
    </Box>
  );
}
