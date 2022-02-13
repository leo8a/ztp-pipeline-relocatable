import React from 'react';
import { ProgressStepProps } from '@patternfly/react-core';
import { WizardStateType } from '../Wizard/types';

type WizardProgressStep = Pick<ProgressStepProps, 'isCurrent' | 'variant'>;
export type WizardProgressStepType = 'subnet' | 'virtualip' | 'domain' | 'sshkey'; // those displayed in the top-level progress
export type WizardStepType = WizardProgressStepType | 'persist';

export type WizardProgressSteps = {
  subnet: WizardProgressStep;
  virtualip: WizardProgressStep;
  domain: WizardProgressStep;
  sshkey: WizardProgressStep;
};

export type WizardProgressContextData = {
  steps: WizardProgressSteps;
  setActiveStep: (step: WizardProgressStepType) => void;

  state: WizardStateType;
};

const WIZARD_STEP_INDEXES: { [key in WizardProgressStepType]: number } = {
  subnet: 0,
  virtualip: 1,
  domain: 2,
  sshkey: 3,
};

const WizardProgressContext = React.createContext<WizardProgressContextData | null>(null);

export const WizardProgressContextProvider: React.FC<{
  children: React.ReactNode;
  state: WizardStateType;
}> = ({ state, children }) => {
  const [steps, setSteps] = React.useState<WizardProgressSteps>({
    subnet: {
      isCurrent: true,
      variant: 'info',
    },
    virtualip: {
      isCurrent: false,
      variant: 'pending',
    },
    domain: {
      isCurrent: false,
      variant: 'pending',
    },
    sshkey: {
      isCurrent: false,
      variant: 'pending',
    },
  });

  const value: WizardProgressContextData = React.useMemo(
    () => ({
      steps,
      state,

      setActiveStep: (step: WizardProgressStepType) => {
        if (!steps[step].isCurrent) {
          const newSteps = { ...steps };
          const stepIdx = WIZARD_STEP_INDEXES[step];

          (Object.keys(newSteps) as WizardProgressStepType[]).forEach((key) => {
            newSteps[key].isCurrent = step === key;

            const idx = WIZARD_STEP_INDEXES[key];
            if (idx < stepIdx) {
              newSteps[key].variant = 'success';
            } else if (idx === stepIdx) {
              newSteps[key].variant = 'info';
            } else {
              newSteps[key].variant = 'pending';
            }
          });
          setSteps(newSteps);
        }
      },
    }),
    [steps, setSteps, state],
  );

  return <WizardProgressContext.Provider value={value}>{children}</WizardProgressContext.Provider>;
};

export const useWizardProgressContext = () => {
  const context = React.useContext(WizardProgressContext);
  if (!context) {
    throw new Error('useWizardProgressContext must be used within WizardProgressContextProvider.');
  }
  return context;
};
