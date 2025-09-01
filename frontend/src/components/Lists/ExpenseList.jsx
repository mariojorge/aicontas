import React, { useState } from 'react';
import styled from 'styled-components';
import { Edit2, Trash2, Calendar, DollarSign, Tag, CheckCircle, Circle, CreditCard, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardGrid } from '../UI/Card';
import { Button } from '../UI/Button';
import { Flex } from '../Layout/Container';
import { PrivateValue } from '../UI/PrivateValue';

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

export const ExpenseList = ({ 
  expenses = [], 
  onEdit, 
  onDelete,
  onToggleStatus,
  isLoading 
}) => {
  const [expandedCards, setExpandedCards] = useState({});
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
      {/* Tabela para Desktop */}
      <TableWrapper>
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
                    <strong>{expense.descricao}</strong>
                    {expense.subcategoria && (
                      <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                        {expense.subcategoria}
                      </div>
                    )}
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

      {/* Tabela de Cartões de Crédito */}
      {Object.keys(creditCardGroups).length > 0 && (
        <TableWrapper style={{ marginTop: '2rem' }}>
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
                      <ActionButton
                        onClick={() => toggleCardExpansion(creditCard.id)}
                        title="Ver detalhes"
                      >
                        {expandedCards[creditCard.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                  {expandedCards[creditCard.id] && creditCard.expenses.map((expense) => (
                    <TableRow key={expense.id} style={{ backgroundColor: '#f9fafb' }}>
                      <TableCell style={{ paddingLeft: '3rem' }}>
                        <div>
                          <strong>{expense.descricao}</strong>
                          {expense.subcategoria && (
                            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                              {expense.subcategoria}
                            </div>
                          )}
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
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {/* Cards para Mobile - Despesas Regulares */}
      <MobileCardGrid>
        {regularExpenses.map((expense) => (
          <MobileCard key={expense.id}>
            <CardContent>
              <Description>{expense.descricao}</Description>
              
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
                  {expense.subcategoria && ` - ${expense.subcategoria}`}
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
              
              <Flex justify="flex-end" style={{ marginTop: '1rem' }}>
                <Button
                  size="small"
                  variant={expense.situacao === 'pago' ? 'secondary' : 'success'}
                  onClick={() => onToggleStatus && onToggleStatus(expense)}
                  style={{ marginRight: '0.5rem' }}
                >
                  {expense.situacao === 'pago' ? <Circle size={16} /> : <CheckCircle size={16} />}
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => onEdit && onEdit(expense)}
                  style={{ marginRight: '0.5rem' }}
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  size="small"
                  variant="error"
                  onClick={() => onDelete && onDelete(expense.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </Flex>
            </CardContent>
          </MobileCard>
        ))}
      </MobileCardGrid>

      {/* Cards para Mobile - Cartões de Crédito */}
      {Object.keys(creditCardGroups).length > 0 && (
        <MobileCardGrid style={{ marginTop: '2rem' }}>
          {Object.values(creditCardGroups).map((creditCard) => (
            <div key={`mobile-card-${creditCard.id}`}>
              <CreditCardGroup>
                <CreditCardHeader onClick={() => toggleCardExpansion(creditCard.id)}>
                  <CreditCardInfo>
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
                  {expandedCards[creditCard.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </CreditCardHeader>
                <CreditCardExpenses expanded={expandedCards[creditCard.id]}>
                  {creditCard.expenses.map((expense) => (
                    <MobileCard key={expense.id} style={{ margin: '0', borderRadius: '0' }}>
                      <CardContent>
                        <Description>{expense.descricao}</Description>
                        
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
                            {expense.subcategoria && ` - ${expense.subcategoria}`}
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
                        
                        <Flex justify="flex-end" style={{ marginTop: '1rem' }}>
                          <Button
                            size="small"
                            variant={expense.situacao === 'pago' ? 'secondary' : 'success'}
                            onClick={() => onToggleStatus && onToggleStatus(expense)}
                            style={{ marginRight: '0.5rem' }}
                          >
                            {expense.situacao === 'pago' ? <Circle size={16} /> : <CheckCircle size={16} />}
                          </Button>
                          <Button
                            size="small"
                            variant="secondary"
                            onClick={() => onEdit && onEdit(expense)}
                            style={{ marginRight: '0.5rem' }}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            size="small"
                            variant="error"
                            onClick={() => onDelete && onDelete(expense.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </Flex>
                      </CardContent>
                    </MobileCard>
                  ))}
                </CreditCardExpenses>
              </CreditCardGroup>
            </div>
          ))}
        </MobileCardGrid>
      )}
    </ListContainer>
  );
};