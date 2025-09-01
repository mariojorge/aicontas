import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { createPortal } from 'react-dom';
import { theme } from '../../styles/theme';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${props => props.theme.colors.card};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  min-width: 400px;
  max-width: 90vw;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    min-width: auto;
    margin: ${props => props.theme.spacing.md};
  }
`;

const ModalHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
`;

const ModalDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid;
  font-weight: 500;
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  min-height: 44px;
  
  ${props => props.variant === 'primary' && `
    background-color: ${props.theme.colors.primary};
    color: white;
    border-color: ${props.theme.colors.primary};
    
    &:hover {
      background-color: ${props.theme.colors.primaryHover};
      border-color: ${props.theme.colors.primaryHover};
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background-color: transparent;
    color: ${props.theme.colors.textSecondary};
    border-color: ${props.theme.colors.border};
    
    &:hover {
      background-color: ${props.theme.colors.backgroundTertiary};
      color: ${props.theme.colors.text};
    }
  `}
`;

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children,
  actions 
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <ThemeProvider theme={theme}>
      <ModalOverlay onClick={handleOverlayClick}>
        <ModalContent>
          {(title || description) && (
            <ModalHeader>
              {title && <ModalTitle>{title}</ModalTitle>}
              {description && <ModalDescription>{description}</ModalDescription>}
            </ModalHeader>
          )}
          
          {children}
          
          {actions && (
            <ModalActions>
              {actions}
            </ModalActions>
          )}
        </ModalContent>
      </ModalOverlay>
    </ThemeProvider>,
    document.body
  );
};

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "primary",
  children
}) => {
  if (children) {
    // Se tem children customizados, usar eles
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        description={description}
      >
        {children}
      </Modal>
    );
  }

  const actions = (
    <>
      <Button variant="secondary" onClick={onClose}>
        {cancelText}
      </Button>
      <Button variant={confirmVariant} onClick={onConfirm}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      actions={actions}
    />
  );
};