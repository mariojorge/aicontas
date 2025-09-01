import React from 'react';
import styled from 'styled-components';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const InputField = styled.input`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.error ? props.theme.colors.error : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  transition: ${props => props.theme.transitions.fast};
  min-height: 44px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textLight};
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.backgroundTertiary};
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    min-height: 48px;
    font-size: 16px; /* Previne zoom no iOS */
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.error ? props.theme.colors.error : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: ${props => props.theme.colors.backgroundSecondary};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  transition: ${props => props.theme.transitions.fast};
  min-height: 44px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &:disabled {
    background-color: ${props => props.theme.colors.backgroundTertiary};
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    min-height: 48px;
    font-size: 16px;
  }
`;

const ErrorMessage = styled.span`
  color: ${props => props.theme.colors.error};
  font-size: 0.875rem;
  margin-top: ${props => props.theme.spacing.xs};
`;

export const Input = React.forwardRef(({ 
  label, 
  error, 
  type = 'text',
  options,
  ...props 
}, ref) => {
  const Component = type === 'select' ? Select : InputField;
  
  return (
    <InputWrapper>
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <Component
        ref={ref}
        type={type === 'select' ? undefined : type}
        error={error}
        {...props}
      >
        {type === 'select' && options && (
          <>
            <option value="">Selecione...</option>
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </>
        )}
      </Component>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </InputWrapper>
  );
});