import styled, { css } from 'styled-components';

const getVariantStyles = (variant, theme) => {
  switch (variant) {
    case 'primary':
      return css`
        background-color: ${theme.colors.primary};
        color: white;
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primaryDark};
        }
      `;
    case 'secondary':
      return css`
        background-color: transparent;
        color: ${theme.colors.primary};
        border: 1px solid ${theme.colors.primary};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.primary};
          color: white;
        }
      `;
    case 'success':
      return css`
        background-color: ${theme.colors.success};
        color: white;
        
        &:hover:not(:disabled) {
          background-color: #059669;
        }
      `;
    case 'error':
      return css`
        background-color: ${theme.colors.error};
        color: white;
        
        &:hover:not(:disabled) {
          background-color: #dc2626;
        }
      `;
    default:
      return css`
        background-color: ${theme.colors.backgroundTertiary};
        color: ${theme.colors.text};
        
        &:hover:not(:disabled) {
          background-color: ${theme.colors.border};
        }
      `;
  }
};

const getSizeStyles = (size, theme) => {
  switch (size) {
    case 'small':
      return css`
        padding: ${theme.spacing.sm} ${theme.spacing.md};
        font-size: 0.875rem;
        min-height: 36px;
      `;
    case 'large':
      return css`
        padding: ${theme.spacing.md} ${theme.spacing.xl};
        font-size: 1.125rem;
        min-height: 52px;
      `;
    default:
      return css`
        padding: ${theme.spacing.sm} ${theme.spacing.lg};
        font-size: 1rem;
        min-height: 44px;
      `;
  }
};

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: 500;
  transition: ${props => props.theme.transitions.normal};
  border: none;
  cursor: pointer;
  white-space: nowrap;
  
  ${props => getVariantStyles(props.variant, props.theme)}
  ${props => getSizeStyles(props.size, props.theme)}
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    min-height: 48px;
    padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  }
`;