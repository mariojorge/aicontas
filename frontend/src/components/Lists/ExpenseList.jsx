import React, { useState } from 'react';
import styled from 'styled-components';
import { Edit2, Trash2, Calendar, DollarSign, Tag, CheckCircle, Circle, CreditCard, ChevronDown, ChevronRight, CreditCard as CreditCardPayIcon } from 'lucide-react';
import { Card, CardContent, CardGrid } from '../UI/Card';
import { Button } from '../UI/Button';
import { PrivateValue } from '../UI/PrivateValue';
import { GroupItemsModal } from '../UI/GroupItemsModal';
import { expenseService } from '../../services/api';

const ListContainer = styled.div`
  width: 100%;
`;

const TableWrapper = styled.div`
  background: ${props => props.theme.colors.card};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  overflow: hidden;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: ${props => props.theme.colors.backgroundTertiary};
`;

const TableHeaderCell = styled.th`
  padding: ${props => props.theme.spacing.md};
  text-align: left;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TableRow = styled.tr`
  &:hover {
    background-color: ${props => props.theme.colors.backgroundTertiary};
  }
`;

const TableCell = styled.td`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.borderLight};
`;

const StatusBadge = styled.span`
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${props => props.status === 'pago' ? props.theme.colors.success : props.theme.colors.warning};
  color: white;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.xs};
`;

const ActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.md};
  background-color: transparent;
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.textSecondary};
  transition: ${props => props.theme.transitions.fast};
  min-height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.theme.colors.backgroundTertiary};
    color: ${props => props.theme.colors.text};
  }
`;

const MobileCardGrid = styled(CardGrid)`
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: grid;
  }
`;

const MobileCard = styled(Card)`
  cursor: pointer;
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CardLabel = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const CreditCardGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
`;

const CreditCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.primary + '10'};
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: ${props => props.theme.colors.primary + '15'};
  }
`;

const CreditCardInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

const CreditCardDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const CreditCardName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 1.1rem;
`;

const CreditCardBrand = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const CreditCardTotal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${props => props.theme.spacing.xs};
`;

const CreditCardValue = styled.span`
  font-weight: 600;
  font-size: 1.2rem;
  color: ${props => props.theme.colors.text};
`;

const CreditCardCount = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const CreditCardExpenses = styled.div`
  display: ${props => props.expanded ? 'block' : 'none'};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const CardValue = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

const Description = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ClickableDescription = styled.span`
  cursor: pointer;
  transition: ${props => props.theme.transitions.fast};
  color: ${props => props.clickable ? props.theme.colors.primary : props.theme.colors.text};
  
  &:hover {
    color: ${props => props.clickable ? props.theme.colors.primaryHover : props.theme.colors.text};
    text-decoration: ${props => props.clickable ? 'underline' : 'none'};
  }
`;

const Value = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xxxl};
  color: ${props => props.theme.colors.textSecondary};
`;

const MobileCardActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${props => props.theme.spacing.md};
`;

const MobileActionButton = styled.button`
  padding: ${props => props.theme.spacing.xs};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  color: ${props => props.theme.colors.textSecondary};

  &:hover {
    background: ${props => props.theme.colors.backgroundTertiary};
  }
`;

export const ExpenseList = ({ 
  expenses = [], 
  onEdit, 
  onDelete,
  onToggleStatus,
  onRefresh,
  selectedMonth,
  selectedYear,
  isLoading 
}) => {
  const [expandedCards, setExpandedCards] = useState({});
  const [groupModal, setGroupModal] = useState({ 
    isOpen: false, 
    groupData: null 
  });
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Parse manual da string para evitar timezone issues
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatRecorrencia = (expense) => {
    if (expense.repetir === 'fixo') {
      return 'Conta fixa';
    } else if (expense.repetir === 'parcelado') {
      return `${expense.parcela_atual || 1}/${expense.parcelas || 1}`;
    }
    return 'Única';
  };

  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const isGroupClickable = (expense) => {
    return expense.repetir === 'fixo' || expense.repetir === 'parcelado';
  };

  const handleDescriptionClick = (expense) => {
    if (isGroupClickable(expense)) {
      setGroupModal({
        isOpen: true,
        groupData: expense
      });
    }
  };

  const handleCloseGroupModal = () => {
    setGroupModal({
      isOpen: false,
      groupData: null
    });
  };

  const handleFetchGroup = async (descricao, repetir, groupId) => {
    try {
      // Preferir group_id se disponível
      if (groupId) {
        const response = await expenseService.getGroupById(groupId);
        return response.data;
      }
      // Fallback para método legado
      const response = await expenseService.getGroup(descricao, repetir);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar grupo:', error);
      throw error;
    }
  };

  const handleToggleCreditCardPayments = async (cardId) => {
    try {
      const mes = (selectedMonth + 1).toString().padStart(2, '0');
      const ano = selectedYear.toString();
      
      await expenseService.toggleCreditCardPayments(cardId, mes, ano);
      
      // Atualizar a lista de despesas
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Erro ao alternar pagamentos do cartão:', error);
      alert('Erro ao alterar situação do cartão. Tente novamente.');
    }
  };

  const getCardPaymentStatus = (creditCard) => {
    const allPaid = creditCard.expenses.every(expense => expense.situacao === 'pago');
    const hasUnpaid = creditCard.expenses.some(expense => expense.situacao === 'aberto');
    
    if (allPaid) {
      return { label: 'Reabrir Todas', variant: 'secondary' };
    } else if (hasUnpaid) {
      return { label: 'Pagar Todas', variant: 'success' };
    }
    return { label: 'Pagar Todas', variant: 'success' };
  };

  // Separate expenses: regular (no credit card) and credit card expenses
  const regularExpenses = expenses.filter(expense => !expense.cartao_credito_id);
  const creditCardExpenses = expenses.filter(expense => expense.cartao_credito_id);
  
  // Group credit card expenses by card
  const creditCardGroups = creditCardExpenses.reduce((groups, expense) => {
    const key = expense.cartao_credito_id;
    if (!groups[key]) {
      groups[key] = {
        id: expense.cartao_credito_id,
        nome: expense.cartao_nome,
        bandeira: expense.cartao_bandeira,
        total: 0,
        count: 0,
        expenses: []
      };
    }
    groups[key].total += expense.valor;
    groups[key].count += 1;
    groups[key].expenses.push(expense);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <EmptyState>
        Carregando despesas...
      </EmptyState>
    );
  }

  if (expenses.length === 0) {
    return (
      <EmptyState>
        <DollarSign size={48} style={{ marginBottom: '1rem' }} />
        <h3>Nenhuma despesa encontrada</h3>
        <p>Adicione sua primeira despesa para começar o controle financeiro.</p>
      </EmptyState>
    );
  }

  return (
    <ListContainer>
      {/* Tabela de Cartões de Crédito */}
      {Object.keys(creditCardGroups).length > 0 && (
        <TableWrapper>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Cartão de Crédito</TableHeaderCell>
                <TableHeaderCell>Valor Total</TableHeaderCell>
                <TableHeaderCell>Despesas</TableHeaderCell>
                <TableHeaderCell>Ações</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {Object.values(creditCardGroups).map((creditCard) => (
                <React.Fragment key={`card-${creditCard.id}`}>
                  <TableRow style={{ backgroundColor: '#f8fafc' }}>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <CreditCard size={20} style={{ color: '#6366f1' }} />
                        <div>
                          <strong>{creditCard.nome}</strong>
                          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                            {creditCard.bandeira}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PrivateValue>
                        <Value style={{ color: '#1f2937' }}>{formatCurrency(creditCard.total)}</Value>
                      </PrivateValue>
                    </TableCell>
                    <TableCell>
                      <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        {creditCard.count} despesa{creditCard.count !== 1 ? 's' : ''}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ActionButtons>
                        <ActionButton
                          onClick={() => handleToggleCreditCardPayments(creditCard.id)}
                          title={getCardPaymentStatus(creditCard).label}
                          className={getCardPaymentStatus(creditCard).variant === 'success' ? 'success' : ''}
                        >
                          {getCardPaymentStatus(creditCard).variant === 'success' ? <CheckCircle size={16} /> : <Circle size={16} />}
                        </ActionButton>
                        <ActionButton
                          onClick={() => toggleCardExpansion(creditCard.id)}
                          title="Ver detalhes"
                        >
                          {expandedCards[creditCard.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </ActionButton>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                  {expandedCards[creditCard.id] && creditCard.expenses.map((expense) => (
                    <TableRow key={expense.id} style={{ backgroundColor: '#f9fafb' }}>
                      <TableCell style={{ paddingLeft: '3rem' }}>
                        <div>
                          <ClickableDescription
                            clickable={isGroupClickable(expense)}
                            onClick={() => handleDescriptionClick(expense)}
                          >
                            <strong>{expense.descricao}</strong>
                          </ClickableDescription>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PrivateValue>
                          <Value>{formatCurrency(expense.valor)}</Value>
                        </PrivateValue>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={expense.situacao}>
                          {expense.situacao === 'pago' ? 'Pago' : 'Aberto'}
                        </StatusBadge>
                        <div style={{ fontSize: '0.875rem', color: '#6B7280', marginTop: '0.25rem' }}>
                          {expense.categoria} • {formatDate(expense.data_pagamento)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ActionButtons>
                          <ActionButton
                            onClick={() => onEdit && onEdit(expense)}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </ActionButton>
                          <ActionButton
                            onClick={() => onDelete && onDelete(expense.id)}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </ActionButton>
                        </ActionButtons>
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {/* Tabela para Desktop */}
      <TableWrapper style={{ marginTop: '2rem' }}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Descrição</TableHeaderCell>
              <TableHeaderCell>Valor</TableHeaderCell>
              <TableHeaderCell>Situação</TableHeaderCell>
              <TableHeaderCell>Categoria</TableHeaderCell>
              <TableHeaderCell>Data</TableHeaderCell>
              <TableHeaderCell>Recorrência</TableHeaderCell>
              <TableHeaderCell>Ações</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {regularExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>
                  <div>
                    <ClickableDescription 
                      clickable={isGroupClickable(expense)}
                      onClick={() => handleDescriptionClick(expense)}
                    >
                      <strong>{expense.descricao}</strong>
                    </ClickableDescription>
                  </div>
                </TableCell>
                <TableCell>
                  <PrivateValue>
                    <Value>{formatCurrency(expense.valor)}</Value>
                  </PrivateValue>
                </TableCell>
                <TableCell>
                  <StatusBadge status={expense.situacao}>
                    {expense.situacao === 'pago' ? 'Pago' : 'Aberto'}
                  </StatusBadge>
                </TableCell>
                <TableCell>{expense.categoria}</TableCell>
                <TableCell>{formatDate(expense.data_pagamento)}</TableCell>
                <TableCell>
                  <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    {formatRecorrencia(expense)}
                  </span>
                </TableCell>
                <TableCell>
                  <ActionButtons>
                    <ActionButton
                      onClick={() => onToggleStatus && onToggleStatus(expense)}
                      title={expense.situacao === 'pago' ? 'Marcar como aberto' : 'Marcar como pago'}
                    >
                      {expense.situacao === 'pago' ? <Circle size={16} /> : <CheckCircle size={16} />}
                    </ActionButton>
                    <ActionButton
                      onClick={() => onEdit && onEdit(expense)}
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </ActionButton>
                    <ActionButton
                      onClick={() => onDelete && onDelete(expense.id)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </ActionButton>
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableWrapper>

      {/* Cards para Mobile - Cartões de Crédito */}
      {Object.keys(creditCardGroups).length > 0 && (
        <MobileCardGrid>
          {Object.values(creditCardGroups).map((creditCard) => (
            <div key={`mobile-card-${creditCard.id}`}>
              <CreditCardGroup>
                <CreditCardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <CreditCardInfo onClick={() => toggleCardExpansion(creditCard.id)} style={{ cursor: 'pointer', flex: 1 }}>
                      <CreditCard size={24} style={{ color: '#6366f1' }} />
                      <CreditCardDetails>
                        <CreditCardName>{creditCard.nome}</CreditCardName>
                        <CreditCardBrand>{creditCard.bandeira}</CreditCardBrand>
                      </CreditCardDetails>
                    </CreditCardInfo>
                    <CreditCardTotal>
                      <PrivateValue>
                        <CreditCardValue>{formatCurrency(creditCard.total)}</CreditCardValue>
                      </PrivateValue>
                      <CreditCardCount>{creditCard.count} despesa{creditCard.count !== 1 ? 's' : ''}</CreditCardCount>
                    </CreditCardTotal>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Button
                        size="small"
                        variant={getCardPaymentStatus(creditCard).variant === 'success' ? 'success' : 'secondary'}
                        onClick={() => handleToggleCreditCardPayments(creditCard.id)}
                        title={getCardPaymentStatus(creditCard).label}
                      >
                        {getCardPaymentStatus(creditCard).variant === 'success' ? <CheckCircle size={16} /> : <Circle size={16} />}
                      </Button>
                      <div onClick={() => toggleCardExpansion(creditCard.id)} style={{ cursor: 'pointer' }}>
                        {expandedCards[creditCard.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </div>
                    </div>
                  </div>
                </CreditCardHeader>
                <CreditCardExpenses expanded={expandedCards[creditCard.id]}>
                  {creditCard.expenses.map((expense) => (
                    <MobileCard key={expense.id} style={{ margin: '0', borderRadius: '0' }}>
                      <CardContent>
                        <Description>
                          <ClickableDescription
                            clickable={isGroupClickable(expense)}
                            onClick={() => handleDescriptionClick(expense)}
                          >
                            {expense.descricao}
                          </ClickableDescription>
                        </Description>

                        <CardRow>
                          <CardLabel>
                            <DollarSign size={16} />
                            Valor
                          </CardLabel>
                          <PrivateValue>
                            <Value>{formatCurrency(expense.valor)}</Value>
                          </PrivateValue>
                        </CardRow>

                        <CardRow>
                          <CardLabel>Situação</CardLabel>
                          <StatusBadge status={expense.situacao}>
                            {expense.situacao === 'pago' ? 'Pago' : 'Aberto'}
                          </StatusBadge>
                        </CardRow>

                        <CardRow>
                          <CardLabel>
                            <Tag size={16} />
                            Categoria
                          </CardLabel>
                          <CardValue>
                            {expense.categoria}
                          </CardValue>
                        </CardRow>

                        <CardRow>
                          <CardLabel>
                            <Calendar size={16} />
                            Data
                          </CardLabel>
                          <CardValue>{formatDate(expense.data_pagamento)}</CardValue>
                        </CardRow>

                        <CardRow>
                          <CardLabel>Recorrência</CardLabel>
                          <CardValue>{formatRecorrencia(expense)}</CardValue>
                        </CardRow>

                        <MobileCardActions>
                          <MobileActionButton
                            onClick={() => onEdit && onEdit(expense)}
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </MobileActionButton>
                          <MobileActionButton
                            onClick={() => onDelete && onDelete(expense.id)}
                            title="Excluir"
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={18} />
                          </MobileActionButton>
                        </MobileCardActions>
                      </CardContent>
                    </MobileCard>
                  ))}
                </CreditCardExpenses>
              </CreditCardGroup>
            </div>
          ))}
        </MobileCardGrid>
      )}

      {/* Cards para Mobile - Despesas Regulares */}
      <MobileCardGrid style={{ marginTop: '2rem' }}>
        {regularExpenses.map((expense) => (
          <MobileCard key={expense.id}>
            <CardContent>
              <Description>
                <ClickableDescription 
                  clickable={isGroupClickable(expense)}
                  onClick={() => handleDescriptionClick(expense)}
                >
                  {expense.descricao}
                </ClickableDescription>
              </Description>
              
              <CardRow>
                <CardLabel>
                  <DollarSign size={16} />
                  Valor
                </CardLabel>
                <PrivateValue>
                  <Value>{formatCurrency(expense.valor)}</Value>
                </PrivateValue>
              </CardRow>
              
              <CardRow>
                <CardLabel>Situação</CardLabel>
                <StatusBadge status={expense.situacao}>
                  {expense.situacao === 'pago' ? 'Pago' : 'Aberto'}
                </StatusBadge>
              </CardRow>
              
              <CardRow>
                <CardLabel>
                  <Tag size={16} />
                  Categoria
                </CardLabel>
                <CardValue>
                  {expense.categoria}
                </CardValue>
              </CardRow>
              
              <CardRow>
                <CardLabel>
                  <Calendar size={16} />
                  Data
                </CardLabel>
                <CardValue>{formatDate(expense.data_pagamento)}</CardValue>
              </CardRow>
              
              <CardRow>
                <CardLabel>Recorrência</CardLabel>
                <CardValue>{formatRecorrencia(expense)}</CardValue>
              </CardRow>
              
              <MobileCardActions>
                <MobileActionButton
                  onClick={() => onToggleStatus && onToggleStatus(expense)}
                  title={expense.situacao === 'pago' ? 'Marcar como aberto' : 'Marcar como pago'}
                  style={{ color: expense.situacao === 'pago' ? '#64748b' : '#10b981' }}
                >
                  {expense.situacao === 'pago' ? <Circle size={18} /> : <CheckCircle size={18} />}
                </MobileActionButton>
                <MobileActionButton
                  onClick={() => onEdit && onEdit(expense)}
                  title="Editar"
                >
                  <Edit2 size={18} />
                </MobileActionButton>
                <MobileActionButton
                  onClick={() => onDelete && onDelete(expense.id)}
                  title="Excluir"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={18} />
                </MobileActionButton>
              </MobileCardActions>
            </CardContent>
          </MobileCard>
        ))}
      </MobileCardGrid>

      <GroupItemsModal
        isOpen={groupModal.isOpen}
        onClose={handleCloseGroupModal}
        groupData={groupModal.groupData}
        type="expense"
        onFetchGroup={handleFetchGroup}
      />
    </ListContainer>
  );
};