import React from 'react';

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <div style={styles.container}>
      <div style={styles.stepsRow}>
        {steps.map((label, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <React.Fragment key={label}>
              {/* Connector line */}
              {idx > 0 && (
                <div 
                  style={{
                    ...styles.connector,
                    backgroundColor: isCompleted ? 'var(--primary)' : 'var(--border-color)',
                  }} 
                />
              )}

              {/* Step indicator circle */}
              <div style={styles.stepItem}>
                <div
                  style={{
                    ...styles.circle,
                    backgroundColor: isActive 
                      ? 'var(--primary)' 
                      : isCompleted 
                        ? 'var(--primary)' 
                        : 'var(--bg-tertiary)',
                    borderColor: isActive 
                      ? 'var(--primary)' 
                      : isCompleted 
                        ? 'var(--primary)' 
                        : 'var(--border-color)',
                    color: isActive || isCompleted ? '#ffffff' : 'var(--text-secondary)',
                  }}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <span 
                  style={{
                    ...styles.label,
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? '700' : '500',
                  }}
                >
                  {label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    padding: '8px 0 20px 0',
  } as React.CSSProperties,
  stepsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    width: '100%',
  } as React.CSSProperties,
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    zIndex: 1,
    flex: '1 1 0px',
  } as React.CSSProperties,
  circle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: '700',
    border: '2px solid',
    transition: 'all var(--transition-fast)',
    boxShadow: 'var(--shadow-sm)',
  } as React.CSSProperties,
  label: {
    fontSize: '0.75rem',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  connector: {
    height: '3px',
    flexGrow: 1,
    margin: '0 -16px 20px -16px',
    transition: 'background-color var(--transition-fast)',
  } as React.CSSProperties,
};
