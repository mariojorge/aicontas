import React from 'react';
import styled from 'styled-components';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import { useValueVisibility } from '../../utils/valueVisibility';

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin: ${props => props.theme.spacing.lg} 0;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

const TotalCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.md};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: ${props => props.theme.transitions.fast};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const CardTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const CardIcon = styled.div`
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => {
    switch (props.variant) {
      case 'paid': return props.theme.colors.success + '20';
      case 'pending': return props.theme.colors.warning + '20';
      case 'total': return props.theme.colors.primary + '20';
      case 'creditCard': return (props.theme.colors.info || props.theme.colors.primary) + '20';
      default: return props.theme.colors.primary + '20';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'paid': return props.theme.colors.success;
      case 'pending': return props.theme.colors.warning;
      case 'total': return props.theme.colors.primary;
      case 'creditCard': return props.theme.colors.info || props.theme.colors.primary;
      default: return props.theme.colors.primary;
    }
  }};
`;

const CardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const HiddenValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

export const TotalsCards = ({ totals, type = 'expense' }) => {
  const { isVisible } = useValueVisibility();
  
  const getIcon = (variant) => {
    switch (variant) {
      case 'paid':
        return type === 'expense' ? <TrendingDown size={20} /> : <TrendingUp size={20} />;
      case 'pending':
        return <DollarSign size={20} />;
      case 'total':
        return <DollarSign size={20} />;
      case 'creditCard':
        return <CreditCard size={20} />;
      default:
        return <DollarSign size={20} />;
    }
  };

  const getLabels = () => {
    if (type === 'income') {
      return {
        paid: 'Recebido',
        pending: 'A Receber',
        total: 'Total Geral'
      };
    }
    return {
      paid: 'Pago',
      pending: 'A Pagar',
      total: 'Total Geral'
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const labels = getLabels();
  const paidKey = type === 'income' ? 'total_recebido' : 'total_pago';
  const pendingKey = type === 'income' ? 'total_aberto' : 'total_aberto';

  return (
    <CardsContainer>
      <TotalCard>
        <CardHeader>
          <CardTitle>{labels.paid}</CardTitle>
          <CardIcon variant="paid">
            {getIcon('paid')}
          </CardIcon>
        </CardHeader>
        {isVisible ? (
          <CardValue>
            {formatCurrency(totals[paidKey] || 0)}
          </CardValue>
        ) : (
          <HiddenValue>••••••</HiddenValue>
        )}
      </TotalCard>

      <TotalCard>
        <CardHeader>
          <CardTitle>{labels.pending}</CardTitle>
          <CardIcon variant="pending">
            {getIcon('pending')}
          </CardIcon>
        </CardHeader>
        {isVisible ? (
          <CardValue>
            {formatCurrency(totals[pendingKey] || 0)}
          </CardValue>
        ) : (
          <HiddenValue>••••••</HiddenValue>
        )}
      </TotalCard>

      <TotalCard>
        <CardHeader>
          <CardTitle>{labels.total}</CardTitle>
          <CardIcon variant="total">
            {getIcon('total')}
          </CardIcon>
        </CardHeader>
        {isVisible ? (
          <CardValue>
            {formatCurrency(totals.total_geral || 0)}
          </CardValue>
        ) : (
          <HiddenValue>••••••</HiddenValue>
        )}
      </TotalCard>

      {type === 'expense' && totals.total_cartoes !== undefined && (
        <TotalCard>
          <CardHeader>
            <CardTitle>Total Cartões</CardTitle>
            <CardIcon variant="creditCard">
              {getIcon('creditCard')}
            </CardIcon>
          </CardHeader>
          {isVisible ? (
            <CardValue>
              {formatCurrency(totals.total_cartoes || 0)}
            </CardValue>
          ) : (
            <HiddenValue>••••••</HiddenValue>
          )}
        </TotalCard>
      )}
    </CardsContainer>
  );
};