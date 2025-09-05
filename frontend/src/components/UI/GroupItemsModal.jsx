import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, DollarSign, Calendar, CheckCircle, Circle } from 'lucide-react';
import { Modal } from './Modal';
import { PrivateValue } from './PrivateValue';
import { Button } from './Button';

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const ModalSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: ${props => props.theme.spacing.xs} 0 0 0;
  font-size: 0.875rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: ${props => props.theme.spacing.xs};
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  
  &:hover {
    color: ${props => props.theme.colors.text};
  }
`;

const ItemsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    max-height: 300px;
  }
`;

const ItemCard = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ItemTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
  flex: 1;
`;

const StatusBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: 0.75rem;
  font-weight: 500;
  margin-left: ${props => props.theme.spacing.sm};
  
  ${props => {
    if (props.type === 'expense') {
      return props.status === 'pago' ? `
        background-color: ${props.theme.colors.success};
        color: white;
      ` : `
        background-color: ${props.theme.colors.warning};
        color: white;
      `;
    } else {
      return props.status === 'recebido' ? `
        background-color: ${props.theme.colors.success};
        color: white;
      ` : `
        background-color: ${props.theme.colors.warning};
        color: white;
      `;
    }
  }}
`;

const ItemDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

const ItemDetail = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const ItemValue = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.textSecondary};
`;

const ErrorState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.error};
`;

const SummaryCard = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SummaryTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 ${props => props.theme.spacing.sm} 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SummaryStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${props => props.theme.spacing.md};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

export const GroupItemsModal = ({ 
  isOpen, 
  onClose, 
  groupData, 
  type, // 'expense' or 'income'
  onFetchGroup 
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && groupData && onFetchGroup) {
      fetchGroupItems();
    }
  }, [isOpen, groupData]);

  const fetchGroupItems = async () => {
    if (!groupData) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Passar group_id se disponível
      const result = await onFetchGroup(
        groupData.descricao, 
        groupData.repetir,
        groupData.group_id
      );
      setItems(result);
    } catch (err) {
      setError('Erro ao carregar itens do grupo');
      console.error('Erro ao buscar itens do grupo:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getStatusText = (item) => {
    if (type === 'expense') {
      return item.situacao === 'pago' ? 'Pago' : 'Aberto';
    } else {
      return item.situacao === 'recebido' ? 'Recebido' : 'Aberto';
    }
  };

  const getDateField = (item) => {
    return type === 'expense' ? item.data_pagamento : item.data_recebimento;
  };

  const getBaseDescription = (description) => {
    return description?.replace(/ \(\d+\/\d+\)$/, '') || '';
  };

  const calculateSummary = () => {
    if (!items.length) return { total: 0, completed: 0, pending: 0, completedValue: 0, pendingValue: 0 };
    
    const completedStatus = type === 'expense' ? 'pago' : 'recebido';
    const completed = items.filter(item => item.situacao === completedStatus);
    const pending = items.filter(item => item.situacao !== completedStatus);
    
    return {
      total: items.length,
      completed: completed.length,
      pending: pending.length,
      completedValue: completed.reduce((sum, item) => sum + item.valor, 0),
      pendingValue: pending.reduce((sum, item) => sum + item.valor, 0),
      totalValue: items.reduce((sum, item) => sum + item.valor, 0)
    };
  };

  const summary = calculateSummary();
  const baseDescription = groupData ? getBaseDescription(groupData.descricao) : '';
  const typeText = type === 'expense' ? 'Despesas' : 'Receitas';
  const completedText = type === 'expense' ? 'Pagas' : 'Recebidas';
  const pendingText = type === 'expense' ? 'Abertas' : 'Abertas';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <div>
          <ModalTitle>{baseDescription}</ModalTitle>
        </div>
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>
      </ModalHeader>

      {loading && (
        <LoadingState>
          Carregando itens do grupo...
        </LoadingState>
      )}

      {error && (
        <ErrorState>
          {error}
        </ErrorState>
      )}

      {!loading && !error && items.length > 0 && (
        <>
          <SummaryCard>
            <SummaryTitle>Resumo do Grupo</SummaryTitle>
            <SummaryStats>
              <StatItem>
                <StatLabel>Total</StatLabel>
                <StatValue>{summary.total}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>{completedText}</StatLabel>
                <StatValue>{summary.completed}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>{pendingText}</StatLabel>
                <StatValue>{summary.pending}</StatValue>
              </StatItem>
              <StatItem>
                <StatLabel>Valor Total</StatLabel>
                <StatValue>
                  <PrivateValue>
                    {formatCurrency(summary.totalValue)}
                  </PrivateValue>
                </StatValue>
              </StatItem>
            </SummaryStats>
          </SummaryCard>

          <ItemsList>
            {items
              .sort((a, b) => (a.parcela_atual || 0) - (b.parcela_atual || 0))
              .map((item) => (
                <ItemCard key={item.id}>
                  <ItemHeader>
                    <ItemTitle>{item.descricao}</ItemTitle>
                    <StatusBadge type={type} status={item.situacao}>
                      {getStatusText(item)}
                    </StatusBadge>
                  </ItemHeader>
                  
                  <ItemDetails>
                    <ItemDetail>
                      <DollarSign size={14} />
                      <span>Valor:</span>
                      <PrivateValue>
                        <ItemValue>{formatCurrency(item.valor)}</ItemValue>
                      </PrivateValue>
                    </ItemDetail>
                    <ItemDetail>
                      <Calendar size={14} />
                      <span>Data:</span>
                      <ItemValue>{formatDate(getDateField(item))}</ItemValue>
                    </ItemDetail>
                    {item.categoria && (
                      <ItemDetail>
                        <span>Categoria:</span>
                        <ItemValue>{item.categoria}</ItemValue>
                      </ItemDetail>
                    )}
                    {item.parcela_atual && item.parcelas && (
                      <ItemDetail>
                        <span>Parcela:</span>
                        <ItemValue>{item.parcela_atual}/{item.parcelas}</ItemValue>
                      </ItemDetail>
                    )}
                  </ItemDetails>
                </ItemCard>
              ))}
          </ItemsList>
        </>
      )}

      {!loading && !error && items.length === 0 && (
        <LoadingState>
          Nenhum item encontrado no grupo.
        </LoadingState>
      )}
    </Modal>
  );
};