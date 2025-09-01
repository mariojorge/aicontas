import React, { useState } from 'react';
import styled from 'styled-components';
import { Modal } from './Modal';
import { Button } from './Button';
import { applyCurrencyMask, handleCurrencyKeyDown, parseCurrency, formatCurrency } from '../../utils/maskUtils';

const ValueInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1.125rem;
  font-weight: 600;
  text-align: center;
  min-height: 52px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}25;
  }
  
  &:invalid {
    border-color: ${props => props.theme.colors.error};
  }
`;

const ValueLabel = styled.label`
  display: block;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
  text-align: center;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    flex-direction: column-reverse;
  }
`;

const CurrentValueInfo = styled.div`
  background: ${props => props.theme.colors.backgroundTertiary};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  text-align: center;
`;

const CurrentValueLabel = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  display: block;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const CurrentValue = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

export const ValueConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  currentValue = 0,
  type = 'expense' // 'expense' ou 'income'
}) => {
  const [enteredValue, setEnteredValue] = useState('');

  const handleValueChange = (e) => {
    applyCurrencyMask(e);
    setEnteredValue(e.target.value);
  };

  // Atualiza o valor quando o modal abrir ou o currentValue mudar
  React.useEffect(() => {
    if (isOpen) {
      setEnteredValue(formatCurrency(currentValue * 100));
    }
  }, [isOpen, currentValue]);

  const handleConfirm = () => {
    const numericValue = parseCurrency(enteredValue);
    
    if (numericValue <= 0) {
      alert('Por favor, informe um valor válido maior que zero.');
      return;
    }
    
    onConfirm(numericValue);
    handleClose();
  };

  const handleClose = () => {
    setEnteredValue('');
    onClose();
  };

  const confirmButtonText = type === 'expense' ? 'Confirmar Pagamento' : 'Confirmar Recebimento';
  const confirmButtonColor = type === 'expense' ? 'error' : 'success';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
    >
      <CurrentValueInfo>
        <CurrentValueLabel>Valor atual:</CurrentValueLabel>
        <CurrentValue>
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(currentValue)}
        </CurrentValue>
      </CurrentValueInfo>

      <ValueLabel>Confirme ou altere o valor:</ValueLabel>
      <ValueInput
        type="text"
        value={enteredValue}
        onChange={handleValueChange}
        onKeyDown={handleCurrencyKeyDown}
        placeholder="R$ 0,00"
        required
      />

      <ActionButtonsContainer>
        <Button
          variant="secondary"
          onClick={handleClose}
          style={{ flex: 1 }}
        >
          Cancelar
        </Button>
        <Button
          variant={confirmButtonColor}
          onClick={handleConfirm}
          style={{ flex: 1 }}
        >
          {confirmButtonText}
        </Button>
      </ActionButtonsContainer>
    </Modal>
  );
};